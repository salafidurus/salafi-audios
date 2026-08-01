import { createZodDto } from 'nestjs-zod';
import { UpdateListingMediaDtoSchema } from '@sd/core-contracts';

export class UpdateListingMediaDto extends createZodDto(UpdateListingMediaDtoSchema) {}
