import 'express-serve-static-core';

declare module 'express-serve-static-core' {
  interface Request {
    id?: string;
    user?: {
      id: string;
      name: string;
      email: string;
      emailVerified: boolean;
      image?: string | null;
      role: string;
      banned?: boolean | null;
      banReason?: string | null;
      banExpires?: Date | null;
      createdAt: Date;
      updatedAt: Date;
    };
  }
}
