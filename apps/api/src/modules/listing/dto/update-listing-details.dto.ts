import { createZodDto } from 'nestjs-zod';
import { UpdateListingDetailsDtoSchema } from '@sd/core-contracts';

/** listing application module responsible for update listing details.dto behavior at the backend boundary. */
/** NestJS update listing details dto service or controller coordinating the API boundary for this responsibility. */
export class UpdateListingDetailsDto extends createZodDto(UpdateListingDetailsDtoSchema) {}
