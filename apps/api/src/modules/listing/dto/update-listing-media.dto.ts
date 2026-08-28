import { createZodDto } from 'nestjs-zod';
import { UpdateListingMediaDtoSchema } from '@sd/core-contracts';

/** listing application module responsible for update listing media.dto behavior at the backend boundary. */
/** NestJS update listing media dto service or controller coordinating the API boundary for this responsibility. */
export class UpdateListingMediaDto extends createZodDto(UpdateListingMediaDtoSchema) {}
