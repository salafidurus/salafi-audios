import type { AccessGrantAttribute } from '../../core/auth/ability/ability.types';

declare global {
  namespace Express {
    interface Request {
      id?: string;
      user?: {
        id: string;
        name: string;
        email: string;
        emailVerified: boolean;
        image?: string | null;
        roles: string[];
        accessGrants: AccessGrantAttribute[];
        banned?: boolean | null;
        banReason?: string | null;
        banExpires?: Date | null;
        createdAt: Date;
        updatedAt: Date;
      };
    }
  }
}

export {};
