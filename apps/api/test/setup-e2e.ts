import { assertTestDatabaseUrl, assertTestRedisUrl } from './helpers/assert-test-env';

assertTestDatabaseUrl();
assertTestRedisUrl();

jest.setTimeout(30_000);
