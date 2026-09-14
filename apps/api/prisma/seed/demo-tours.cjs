/**
 * Fills the catalogue with demo tours: categories, events in all three languages,
 * upcoming dates, cancellation rules and photos.
 *
 * Photos come from Unsplash (free for commercial use under the Unsplash License).
 * Cloudinary fetches each one by URL into the same folder the API uploads to, so the
 * admin panel can replace or delete them like any other event image — and the orphan
 * reconciliation finds them referenced instead of deleting them.
 *
 * Safe to re-run: a tour whose English title already exists is skipped, and existing
 * categories are matched by their Russian name before a new one is created.
 *
 *   node prisma/seed/demo-tours.cjs --dry-run   # show what would be created, touch nothing
 *   node prisma/seed/demo-tours.cjs             # create it
 *
 * Reads DATABASE_URL, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 * and CLOUDINARY_UPLOAD_FOLDER from the environment.
 */
'use strict';

const { PrismaClient } = require('@prisma/client');
const { v2: cloudinary } = require('cloudinary');
const { categories, tours } = require('./demo-tours.data.cjs');

const DRY_RUN = process.argv.includes('--dry-run');
const LOCALES = ['en', 'ru', 'hy'];
const YEREVAN_UTC_OFFSET_HOURS = 4;
const UPLOAD_FOLDER = process.env.CLOUDINARY_UPLOAD_FOLDER || 'event-space';
const DEFAULT_CANCELLATION_RULES = [
	{ hoursBeforeEvent: 72, refundPercentage: 100 },
	{ hoursBeforeEvent: 24, refundPercentage: 50 },
];
// Mirrors the column sizes in schema.prisma, so a too-long text fails here with the
// tour's name instead of as a bare database error halfway through.
const MAX_LENGTH = { title: 100, description: 1000, location: 200, meetingLocation: 200 };

function requireEnv(name) {
	const value = process.env[name];
	if (!value) throw new Error(`${name} is not set`);
	return value;
}

/**
 * Local database plus the production folder is the one combination that loses images:
 * production's reconciliation would find them unreferenced in its own database.
 */
function assertSafeTarget() {
	const host = new URL(requireEnv('DATABASE_URL')).hostname;
	if (['localhost', '127.0.0.1'].includes(host) && UPLOAD_FOLDER === 'event-space') {
		throw new Error(
			'Refusing to seed a local database into the production Cloudinary folder. ' +
				'Set CLOUDINARY_UPLOAD_FOLDER=event-space-dev in .env.',
		);
	}
}

function validateTour(tour) {
	for (const locale of LOCALES) {
		const t = tour.translations[locale];
		if (!t) throw new Error(`${tour.key}: missing "${locale}" translation`);
		for (const [field, max] of Object.entries(MAX_LENGTH)) {
			if (!t[field]) throw new Error(`${tour.key}/${locale}: empty ${field}`);
			if (t[field].length > max) {
				throw new Error(`${tour.key}/${locale}: ${field} is ${t[field].length} chars, max ${max}`);
			}
		}
	}
	if (!tour.photos.length) throw new Error(`${tour.key}: no photos`);
}

/** Every matching weekday over the next `weeks` weeks, at `time` Yerevan time. */
function upcomingDates({ weekdays, time, weeks }) {
	const [hours, minutes] = time.split(':').map(Number);
	const now = Date.now();
	const dates = [];

	for (let day = 1; day <= weeks * 7; day++) {
		// Shifting by the offset makes the UTC calendar fields read as Yerevan's.
		const yerevan = new Date(now + (YEREVAN_UTC_OFFSET_HOURS * 3600 + day * 86400) * 1000);
		if (!weekdays.includes(yerevan.getUTCDay())) continue;

		dates.push(
			new Date(
				Date.UTC(
					yerevan.getUTCFullYear(),
					yerevan.getUTCMonth(),
					yerevan.getUTCDate(),
					hours - YEREVAN_UTC_OFFSET_HOURS,
					minutes,
				),
			),
		);
	}
	return dates;
}

function unsplashUrl(photoId) {
	return `https://images.unsplash.com/${photoId}?w=1600&q=80&fm=jpg`;
}

async function deletePhotos(photos) {
	for (const { publicId } of photos) {
		await cloudinary.uploader.destroy(publicId).catch(() => undefined);
	}
}

async function uploadPhotos(photos) {
	const uploaded = [];
	try {
		for (const photo of photos) {
			// Same transformation as the API's own uploads.
			const result = await cloudinary.uploader.upload(unsplashUrl(photo.id), {
				folder: UPLOAD_FOLDER,
				resource_type: 'image',
				transformation: [
					{ width: 1200, crop: 'limit' },
					{ quality: 'auto', fetch_format: 'auto' },
				],
			});
			uploaded.push({ url: result.secure_url, publicId: result.public_id });
		}
		return uploaded;
	} catch (error) {
		await deletePhotos(uploaded);
		throw error;
	}
}

async function findOrCreateCategory(prisma, category) {
	const byName = await prisma.category.findFirst({
		where: {
			translations: { some: { locale: 'ru', name: { equals: category.names.ru, mode: 'insensitive' } } },
		},
	});
	if (byName) return { id: byName.id, status: 'existing' };

	const bySlug = await prisma.category.findUnique({ where: { slug: category.slug } });
	if (bySlug) return { id: bySlug.id, status: 'existing' };

	if (DRY_RUN) return { id: null, status: 'would create' };

	const created = await prisma.category.create({
		data: {
			slug: category.slug,
			translations: { create: LOCALES.map((locale) => ({ locale, name: category.names[locale] })) },
		},
	});
	return { id: created.id, status: 'created' };
}

async function seedTour(prisma, tour, { organizerId, categoryId }) {
	const title = tour.translations.en.title;
	const existing = await prisma.eventTranslation.findFirst({ where: { locale: 'en', title } });
	if (existing) {
		console.log(`  skip     ${title} (already exists)`);
		return 'skipped';
	}

	const dates = upcomingDates(tour.schedule);
	if (!dates.length) throw new Error(`${tour.key}: schedule produces no dates`);

	if (DRY_RUN) {
		console.log(`  planned  ${title}: ${dates.length} dates, ${tour.photos.length} photos, ${tour.price} AMD`);
		return 'planned';
	}

	const photos = await uploadPhotos(tour.photos);
	try {
		await prisma.event.create({
			data: {
				userId: organizerId,
				categoryId,
				status: 'PUBLISHED',
				price: tour.price,
				duration: tour.duration,
				difficulty: tour.difficulty,
				locationUrl: tour.locationUrl,
				meetingLocationUrl: tour.meetingLocationUrl,
				translations: { create: LOCALES.map((locale) => ({ locale, ...tour.translations[locale] })) },
				cancellationRules: { create: tour.cancellationRules ?? DEFAULT_CANCELLATION_RULES },
				images: { create: photos.map((photo, order) => ({ ...photo, order })) },
				occurrences: { create: dates.map((date) => ({ date, maxParticipants: tour.maxParticipants })) },
			},
		});
	} catch (error) {
		await deletePhotos(photos);
		throw error;
	}

	console.log(`  created  ${title}: ${dates.length} dates, ${photos.length} photos`);
	return 'created';
}

async function main() {
	tours.forEach(validateTour);
	assertSafeTarget();

	if (!DRY_RUN) {
		cloudinary.config({
			cloud_name: requireEnv('CLOUDINARY_CLOUD_NAME'),
			api_key: requireEnv('CLOUDINARY_API_KEY'),
			api_secret: requireEnv('CLOUDINARY_API_SECRET'),
		});
	}

	console.log(`${DRY_RUN ? 'DRY RUN — nothing will be written' : 'Seeding'} · Cloudinary folder "${UPLOAD_FOLDER}"`);

	const prisma = new PrismaClient();
	try {
		const organizer = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
		if (!organizer) throw new Error('No ADMIN user found: the tours need an organizer.');

		console.log('Categories:');
		const categoryIds = {};
		for (const category of categories) {
			const { id, status } = await findOrCreateCategory(prisma, category);
			categoryIds[category.key] = id;
			console.log(`  ${status.padEnd(12)} ${category.names.ru}`);
		}

		console.log('Tours:');
		const summary = { created: 0, skipped: 0, planned: 0 };
		for (const tour of tours) {
			const result = await seedTour(prisma, tour, {
				organizerId: organizer.id,
				categoryId: categoryIds[tour.category],
			});
			summary[result]++;
		}
		console.log('Done:', summary);
	} finally {
		await prisma.$disconnect();
	}
}

main().catch((error) => {
	console.error(`Seed failed: ${error.message ?? error}`);
	process.exitCode = 1;
});
