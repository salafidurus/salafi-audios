import type {
  AudioAssetViewDto,
  CollectionViewDto,
  LectureViewDto,
  ScholarViewDto,
  SeriesViewDto,
} from "@sd/api-client/schemas";

export type Scholar = ScholarViewDto;
export type Collection = CollectionViewDto;
export type Series = SeriesViewDto;
export type Lecture = LectureViewDto & {
  primaryAudioAsset?: AudioAssetViewDto;
};

export type BreadCrumb = {
  href: string;
  label: string;
};
