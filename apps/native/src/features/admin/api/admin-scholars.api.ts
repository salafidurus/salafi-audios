import type {
  AdminListingDetailDto,
  CreateListingDto,
  UpdateListingDetailsDto,
} from "@sd/core-contracts";

import { httpClient, endpoints } from "@sd/core-contracts";

/** Provides authenticated native administration workflows and their data boundaries. */
/** Initializes series for the native runtime. */
export async function createSeries(data: CreateListingDto): Promise<AdminListingDetailDto> {
  return httpClient<AdminListingDetailDto>({
    url: endpoints.admin.listings.create,
    method: "POST",
    body: data,
  });
}

/** Sends the series update through the native API boundary. */
export async function updateSeries(
  id: string,
  data: UpdateListingDetailsDto,
): Promise<AdminListingDetailDto> {
  return httpClient<AdminListingDetailDto>({
    url: `${endpoints.admin.listings.detail}/${id}/details`,
    method: "PUT",
    body: data,
  });
}

/** Initializes collection for the native runtime. */
export async function createCollection(data: CreateListingDto): Promise<AdminListingDetailDto> {
  return httpClient<AdminListingDetailDto>({
    url: endpoints.admin.listings.create,
    method: "POST",
    body: data,
  });
}

/** Sends the collection update through the native API boundary. */
export async function updateCollection(
  id: string,
  data: UpdateListingDetailsDto,
): Promise<AdminListingDetailDto> {
  return httpClient<AdminListingDetailDto>({
    url: `${endpoints.admin.listings.detail}/${id}/details`,
    method: "PUT",
    body: data,
  });
}
