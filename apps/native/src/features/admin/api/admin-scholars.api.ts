import { httpClient, endpoints } from "@sd/core-contracts";
import type {
  AdminListingListItemDto,
  AdminListingDetailDto,
  CreateListingDto,
  AdminListingUpdateDto,
  BulkActionDto,
  BulkActionResultDto,
} from "@sd/core-contracts";

// Series
export async function fetchAdminSeries(scholarId: string): Promise<AdminListingListItemDto[]> {
  return httpClient<AdminListingListItemDto[]>({
    url: endpoints.admin.listings.list,
    method: "GET",
    params: { scholarId, format: "series" },
  });
}

export async function createSeries(data: CreateListingDto): Promise<AdminListingDetailDto> {
  return httpClient<AdminListingDetailDto>({
    url: endpoints.admin.listings.create,
    method: "POST",
    body: data,
  });
}

export async function updateSeries(
  id: string,
  data: Partial<AdminListingUpdateDto>,
): Promise<AdminListingDetailDto> {
  return httpClient<AdminListingDetailDto>({
    url: endpoints.admin.listings.update(id),
    method: "PUT",
    body: data,
  });
}

export async function bulkSeriesAction(data: BulkActionDto): Promise<BulkActionResultDto> {
  return httpClient<BulkActionResultDto>({
    url: endpoints.admin.listings.bulk,
    method: "POST",
    body: data,
  });
}

// Collections
export async function fetchAdminCollections(scholarId: string): Promise<AdminListingListItemDto[]> {
  return httpClient<AdminListingListItemDto[]>({
    url: endpoints.admin.listings.list,
    method: "GET",
    params: { scholarId, format: "collection" },
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
  data: Partial<AdminListingUpdateDto>,
): Promise<AdminListingDetailDto> {
  return httpClient<AdminListingDetailDto>({
    url: endpoints.admin.listings.update(id),
    method: "PUT",
    body: data,
  });
}

export async function bulkCollectionAction(data: BulkActionDto): Promise<BulkActionResultDto> {
  return httpClient<BulkActionResultDto>({
    url: endpoints.admin.listings.bulk,
    method: "POST",
    body: data,
  });
}
