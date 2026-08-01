import './set-env';
import '../../src/shared/utils/env.bootstrap';

if (process.env.DATABASE_URL) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.replace('localhost', '127.0.0.1');
}
if (process.env.DIRECT_DB_URL) {
  process.env.DIRECT_DB_URL = process.env.DIRECT_DB_URL.replace('localhost', '127.0.0.1');
}
