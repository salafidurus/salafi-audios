export type UserProfileDto = {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  role: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
};
