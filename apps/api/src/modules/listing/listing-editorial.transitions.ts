import { BadRequestException } from '@nestjs/common';
import type { Status } from '@sd/core-db';

export type ListingEditorialTransition = 'publish' | 'archive';

type AllowedStatusMap = {
  readonly [Action in ListingEditorialTransition]: readonly Status[];
};

const allowedStatuses: AllowedStatusMap = {
  publish: ['draft', 'review'],
  archive: ['published'],
};

export function assertListingTransition(
  action: ListingEditorialTransition,
  currentStatus: Status,
): void {
  if (!allowedStatuses[action].includes(currentStatus)) {
    throw new BadRequestException(`Cannot ${action} a listing in ${currentStatus} status`);
  }
}
