import type {
  AdminListingDetailDto,
  CreateListingDto,
  UpdateListingDetailsDto,
} from "@sd/core-contracts";

import { httpClient, endpoints } from "@sd/core-contracts";

export async function createSeries(data: CreateListingDto): Promise<AdminListingDetailDto> {
  return httpClient<AdminListingDetailDto>({
    url: endpoints.admin.listings.create,
    method: "POST",
    body: data,
  });
}

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

export async function createCollection(data: CreateListingDto): Promise<AdminListingDetailDto> {
  return httpClient<AdminListingDetailDto>({
    url: endpoints.admin.listings.create,
    method: "POST",
    body: data,
  });
}

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
