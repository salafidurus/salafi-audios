import type { AccessGrantAttribute } from '../../core/auth/ability/ability.types';

/** Shared API express.d utilities and boundary definitions used by backend modules. */
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
        /** Documents the roles field's API projection semantics and lifecycle meaning. */
        roles: string[];
        accessGrants: AccessGrantAttribute[];
        banned?: boolean | null;
        banReason?: string | null;
        banExpires?: Date | null;
        /** Documents the createdAt field's API projection semantics and lifecycle meaning. */
        createdAt: Date;
        /** Documents the updatedAt field's API projection semantics and lifecycle meaning. */
        updatedAt: Date;
      };
    }
  }
}

export {};
