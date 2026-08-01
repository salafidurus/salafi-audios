import { createZodDto } from 'nestjs-zod';
import { UpdateListingDetailsDtoSchema } from '@sd/core-contracts';

export class UpdateListingDetailsDto extends createZodDto(UpdateListingDetailsDtoSchema) {}
