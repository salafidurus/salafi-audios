import { createZodDto } from 'nestjs-zod';
import { UpdateLocaleDtoSchema } from '@sd/core-contracts';

export class UpdateLocaleDto extends createZodDto(UpdateLocaleDtoSchema) {}
