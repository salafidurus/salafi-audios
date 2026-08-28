import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

/** Core API apple native sign in.dto module providing shared backend infrastructure and authority-boundary services. */
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

/** NestJS apple native sign in dto service or controller coordinating the API boundary for this responsibility. */
export class AppleNativeSignInDto extends createZodDto(AppleNativeSignInDtoSchema) {}
