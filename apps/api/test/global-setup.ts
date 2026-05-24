import { execSync } from 'child_process';
import { join } from 'path';
import * as dotenv from 'dotenv';
import { expand } from 'dotenv-expand';
import { assertTestDatabaseUrl } from './helpers/assert-test-env';

export default async function globalSetup(): Promise<void> {
	const envPath = join(__dirname, '../../../.env.test');
	expand(dotenv.config({ path: envPath }));

	assertTestDatabaseUrl();

	execSync('npx prisma migrate deploy', {
		cwd: join(__dirname, '..'),
		env: process.env,
		stdio: 'inherit',
	});
}
