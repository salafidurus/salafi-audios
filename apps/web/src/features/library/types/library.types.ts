import type {
  CollectionViewDto,
  LectureViewDto,
  ScholarDetailDto,
  SeriesViewDto,
  TopicDetailDto,
  TopicLectureViewDto,
} from "@sd/api-client";

export type Scholar = ScholarDetailDto;
export type Collection = CollectionViewDto;
export type Series = SeriesViewDto;
export type Lecture = LectureViewDto;
export type TopicDetail = TopicDetailDto;
export type TopicLecture = TopicLectureViewDto;

export type BreadCrumb = {
  href: string;
  label: string;
};
