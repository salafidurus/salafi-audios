import type {
  AdminListingDetailDto,
  CreateListingDto,
  UpdateListingDetailsDto,
} from "@sd/core-contracts";

import { httpClient, endpoints } from "@sd/core-contracts";

/** Provides the native features admin api admin-scholars.api module responsibility. */
/** Describes the createSeries native contract and behavior. */
export async function createSeries(data: CreateListingDto): Promise<AdminListingDetailDto> {
  return httpClient<AdminListingDetailDto>({
    url: endpoints.admin.listings.create,
    method: "POST",
    body: data,
  });
}

/** Describes the updateSeries native contract and behavior. */
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

/** Describes the createCollection native contract and behavior. */
export async function createCollection(data: CreateListingDto): Promise<AdminListingDetailDto> {
  return httpClient<AdminListingDetailDto>({
    url: endpoints.admin.listings.create,
    method: "POST",
    body: data,
  });
}

/** Describes the updateCollection native contract and behavior. */
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
