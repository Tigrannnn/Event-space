import { getBrandForHost, type Brand } from '@event-space/shared';
import { escapeHtml } from './mail-strings';

export interface MailBrand {
	name: string;
	siteUrl: string;
	logoUrl?: string;
	replyTo?: string;
	phone?: string;
	instagram?: string;
	address?: string;
	colorPrimary: string;
	colorAccent: string;
}

export function resolveMailBrand(
	host: string | null | undefined,
	fallbackSiteUrl: string,
): MailBrand {
	const brand: Brand = getBrandForHost(host ?? null);
	const cleanHost = host?.split(':')[0]?.trim();
	const siteUrl = cleanHost ? `https://${cleanHost}` : fallbackSiteUrl.replace(/\/+$/, '');

	return {
		name: brand.name,
		siteUrl,
		// .ico не отображается в почтовых клиентах — у таких брендов остаётся текстовая шапка.
		logoUrl:
			siteUrl && brand.ogImage.startsWith('/') && !brand.ogImage.endsWith('.ico')
				? `${siteUrl}${brand.ogImage}`
				: undefined,
		replyTo: brand.contact.email,
		phone: brand.contact.phone,
		instagram: brand.contact.instagram,
		address: brand.contact.location?.address,
		colorPrimary: brand.colorPrimary,
		colorAccent: brand.colorAccent,
	};
}

export function buildBrandLogoBlock(brand: MailBrand): string {
	if (!brand.logoUrl) return '';

	return (
		`<mj-image src="${escapeHtml(brand.logoUrl)}" alt="${escapeHtml(brand.name)}" width="72px" ` +
		'padding="0px 0px 12px 0px" align="center" border-radius="36px" />'
	);
}

export function buildBrandTitle(brand: MailBrand): string {
	const [first, ...rest] = brand.name.split(' ');
	const tail = rest.join(' ');

	return tail
		? `<span style="color: ${escapeHtml(brand.colorPrimary)}">${escapeHtml(first)}</span> ` +
				`<span style="color: ${escapeHtml(brand.colorAccent)}">${escapeHtml(tail)}</span>`
		: `<span style="color: ${escapeHtml(brand.colorPrimary)}">${escapeHtml(first)}</span>`;
}

export function buildBrandFooter(brand: MailBrand): string {
	const contacts = [
		brand.phone ? escapeHtml(brand.phone) : undefined,
		brand.instagram
			? `<a href="${escapeHtml(brand.instagram)}" style="color: #9ca3af;">Instagram</a>`
			: undefined,
		brand.address ? escapeHtml(brand.address) : undefined,
	].filter(Boolean);

	const year = new Date().getFullYear();
	const line = `&copy; ${year} ${escapeHtml(brand.name)}`;

	return contacts.length ? `${line}<br />${contacts.join(' &nbsp;·&nbsp; ')}` : line;
}
