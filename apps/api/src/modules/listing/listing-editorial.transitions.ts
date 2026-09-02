import { BadRequestException } from '@nestjs/common';
import type { Status } from '@sd/core-db';

/** listing application module responsible for listing editorial.transitions behavior at the backend boundary. */
/** API type describing the listing editorial transition contract. */
export type ListingEditorialTransition = 'publish' | 'archive';

type AllowedStatusMap = {
  readonly [Action in ListingEditorialTransition]: readonly Status[];
};

const allowedStatuses: AllowedStatusMap = {
  publish: ['draft', 'review'],
  archive: ['published'],
};

/** Resolves assert listing transition behavior while preserving the API boundary contract. */
export function assertListingTransition(
  action: ListingEditorialTransition,
  currentStatus: Status,
): void {
  if (!allowedStatuses[action].includes(currentStatus)) {
    throw new BadRequestException(`Cannot ${action} a listing in ${currentStatus} status`);
  }
}
