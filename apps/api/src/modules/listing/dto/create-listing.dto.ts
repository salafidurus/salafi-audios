/** Listing request DTO validation declarations for creating catalog listings. */
import { createZodDto } from 'nestjs-zod';
import { CreateListingDtoSchema } from '@sd/core-contracts';

/** listing application module responsible for create listing.dto behavior at the backend boundary. */
/** NestJS create listing dto service or controller coordinating the API boundary for this responsibility. */
export class CreateListingDto extends createZodDto(CreateListingDtoSchema) {}
