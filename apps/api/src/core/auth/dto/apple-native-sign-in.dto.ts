import { z } from 'zod';

/** Defines the validated native Apple identity payload for authentication. */
const AppleUserInfoSchema = z
  .object({
    email: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
  })
  .optional();

/** Native Apple identity payload accepted by the sign-in endpoint. */
export const AppleNativeSignInDtoSchema = z.object({
  identityToken: z.string(),
  user: AppleUserInfoSchema,
});

/** Fields extracted from the native Apple identity payload. */
export type AppleNativeSignInDto = z.infer<typeof AppleNativeSignInDtoSchema>;
