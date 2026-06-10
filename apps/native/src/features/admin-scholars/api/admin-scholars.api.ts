import { httpClient, endpoints } from "@sd/core-contracts";
import type {
  AdminSeriesListItemDto,
  AdminSeriesDetailDto,
  CreateSeriesDto,
  UpdateSeriesDto,
  AdminCollectionListItemDto,
  AdminCollectionDetailDto,
  CreateCollectionDto,
  UpdateCollectionDto,
  BulkActionDto,
  BulkActionResultDto,
} from "@sd/core-contracts";

// Series
export async function fetchAdminSeries(scholarId: string): Promise<AdminSeriesListItemDto[]> {
  return httpClient<AdminSeriesListItemDto[]>({
    url: endpoints.admin.series.list,
    method: "GET",
    params: { scholarId },
  });
}

export async function createSeries(data: CreateSeriesDto): Promise<AdminSeriesDetailDto> {
  return httpClient<AdminSeriesDetailDto>({
    url: endpoints.admin.series.create,
    method: "POST",
    body: data,
  });
}

export async function updateSeries(
  id: string,
  data: Partial<UpdateSeriesDto>,
): Promise<AdminSeriesDetailDto> {
  return httpClient<AdminSeriesDetailDto>({
    url: endpoints.admin.series.update(id),
    method: "PATCH",
    body: data,
  });
}

export async function bulkSeriesAction(data: BulkActionDto): Promise<BulkActionResultDto> {
  return httpClient<BulkActionResultDto>({
    url: endpoints.admin.series.bulk,
    method: "POST",
    body: data,
  });
}

// Collections
export async function fetchAdminCollections(
  scholarId: string,
): Promise<AdminCollectionListItemDto[]> {
  return httpClient<AdminCollectionListItemDto[]>({
    url: endpoints.admin.collections.list,
    method: "GET",
    params: { scholarId },
  });
}

export async function createCollection(
  data: CreateCollectionDto,
): Promise<AdminCollectionDetailDto> {
  return httpClient<AdminCollectionDetailDto>({
    url: endpoints.admin.collections.create,
    method: "POST",
    body: data,
  });
}

export async function updateCollection(
  id: string,
  data: Partial<UpdateCollectionDto>,
): Promise<AdminCollectionDetailDto> {
  return httpClient<AdminCollectionDetailDto>({
    url: endpoints.admin.collections.update(id),
    method: "PATCH",
    body: data,
  });
}

export async function bulkCollectionAction(data: BulkActionDto): Promise<BulkActionResultDto> {
  return httpClient<BulkActionResultDto>({
    url: endpoints.admin.collections.bulk,
    method: "POST",
    body: data,
  });
}
