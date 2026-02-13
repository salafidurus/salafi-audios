import type {
  CollectionViewDto,
  LectureViewDto,
  ScholarViewDto,
  SeriesViewDto,
} from "@sd/api-client/schemas";

export type Scholar = ScholarViewDto;
export type Collection = CollectionViewDto;
export type Series = SeriesViewDto;
export type Lecture = LectureViewDto;

export type BreadCrumb = {
  href: string;
  label: string;
};
