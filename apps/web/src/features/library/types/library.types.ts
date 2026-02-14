import type {
  CollectionViewDto,
  LectureViewDto,
  ScholarViewDto,
  SeriesViewDto,
  TopicDetailDto,
  TopicLectureViewDto,
} from "@sd/api-client";

export type Scholar = ScholarViewDto;
export type Collection = CollectionViewDto;
export type Series = SeriesViewDto;
export type Lecture = LectureViewDto;
export type TopicDetail = TopicDetailDto;
export type TopicLecture = TopicLectureViewDto;

export type BreadCrumb = {
  href: string;
  label: string;
};
