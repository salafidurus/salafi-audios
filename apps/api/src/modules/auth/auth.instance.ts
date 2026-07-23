import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin, bearer, customSession } from 'better-auth/plugins';
import { ROLE_DEFAULT_PERMISSIONS } from '@sd/core-contracts';
import { expo } from '@better-auth/expo';
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
  const prismaClient = getAuthPrisma(config);

  return betterAuth({
    secret: config.BETTER_AUTH_SECRET,
    baseURL: config.BETTER_AUTH_URL,
    basePath: '/api/auth',
    database: prismaAdapter(prismaClient, {
      provider: 'postgresql',
    }),
    trustedOrigins: config.CORS_ORIGINS,
    emailAndPassword: { enabled: false },
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
    // Same-domain session cookies for web, bearer for native
    plugins: [
      admin(),
      expo(),
      bearer(),
      customSession(async ({ user, session }) => {
        const prismaInstance = getAuthPrisma(config);
        const userRoles = await prismaInstance.userRoleAssignment.findMany({
          where: { userId: user.id },
          select: { role: true },
        });
        let roles = userRoles.map((r) => r.role as string);
        if (!roles.length) {
          roles = ['listener'];
        }

        let permissions: string[] = [];
        if (roles.includes('superadmin')) {
          permissions = [...ROLE_DEFAULT_PERMISSIONS.superadmin];
        } else {
          const userPerms = await prismaInstance.userPermission.findMany({
            where: { userId: user.id },
            select: { permission: true },
          });
          permissions = userPerms.map((p) => p.permission as string);
        }

        return {
          user: {
            ...user,
            roles,
            permissions,
          },
          session,
        };
      }),
    ],

    // Session and cookie configuration for same-domain setup
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // Refresh if > 1 day old
    },

    advanced: {
      // Cross-subdomain cookie sharing: allows session from api.* to be sent
      // to web app (for OAuth callbacks)
      crossSubDomainCookies: {
        enabled: config.NODE_ENV !== 'development',
        domain: config.COOKIE_DOMAIN,
      },
      // HTTPS-only cookies in production (XSS + MITM mitigation)
      useSecureCookies: config.NODE_ENV === 'production',
      // HttpOnly, SameSite=Lax are already defaults
    },
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
  if (!_auth) throw new Error('Auth not initialized — call initAuth(config) first');
  return _auth;
}
