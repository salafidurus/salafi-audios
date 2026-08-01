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
