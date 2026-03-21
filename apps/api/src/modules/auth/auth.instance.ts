import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin } from 'better-auth/plugins';
import { PrismaClient } from '@sd/core-db';
import { PrismaPg } from '@prisma/adapter-pg';
import type { ConfigService } from '../../shared/config/config.service';

let prisma: PrismaClient | undefined;

function getAuthPrisma(config: ConfigService): PrismaClient {
  if (prisma) {
    return prisma;
  }

  const connectionString = config.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL is required for Better Auth Prisma client.');
  }

  const adapter = new PrismaPg({ connectionString });
  prisma = new PrismaClient({ adapter });
  return prisma;
}

function createAuthInstance(config: ConfigService) {
  return betterAuth({
    secret: config.BETTER_AUTH_SECRET,
    baseURL: config.BETTER_AUTH_URL,
    basePath: '/api/auth',
    database: prismaAdapter(getAuthPrisma(config), { provider: 'postgresql' }),
    trustedOrigins: config.CORS_ORIGINS,
    emailAndPassword: { enabled: true },
    socialProviders: {
      google: {
        clientId: config.GOOGLE_CLIENT_ID,
        clientSecret: config.GOOGLE_CLIENT_SECRET,
      },
      apple: {
        clientId: config.APPLE_CLIENT_ID,
        clientSecret: config.APPLE_CLIENT_SECRET,
      },
    },
    plugins: [admin()],
  });
}

// Auth type inferred from the full configuration, including plugin-extended fields.
export type Auth = ReturnType<typeof createAuthInstance>;

let _auth: Auth | undefined;

export function initAuth(config: ConfigService): Auth {
  _auth = createAuthInstance(config);
  return _auth;
}

export function getAuth(): Auth {
  if (!_auth)
    throw new Error('Auth not initialized — call initAuth(config) first');
  return _auth;
}
