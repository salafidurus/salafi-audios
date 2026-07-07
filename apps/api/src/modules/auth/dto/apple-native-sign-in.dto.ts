import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const AppleUserInfoSchema = z
  .object({
    email: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
  })
  .optional();

const AppleNativeSignInDtoSchema = z.object({
  identityToken: z.string(),
  user: AppleUserInfoSchema,
});

export class AppleNativeSignInDto extends createZodDto(AppleNativeSignInDtoSchema) {}
