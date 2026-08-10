import './set-env';
import '../../src/shared/utils/env.bootstrap';

process.env.NEON_API_KEY ??= 'e2e-neon-api-key';
process.env.NEON_PROJECT_ID ??= 'e2e-project';
process.env.NEON_ENDPOINT_ID ??= 'ep-e2e-endpoint';

if (process.env.DATABASE_URL) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.replace('localhost', '127.0.0.1');
}
if (process.env.DIRECT_DB_URL) {
  process.env.DIRECT_DB_URL = process.env.DIRECT_DB_URL.replace('localhost', '127.0.0.1');
}
