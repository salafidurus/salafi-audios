export type ScholarViewDto = {
  id: string;
  slug: string;
  name: string;
  bio?: string;
  isActive: boolean;
  isKibar: boolean;
};

export type ScholarDetailDto = {
  id: string;
  slug: string;
  name: string;
  bio?: string;
  country?: string;
  mainLanguage?: string;
  imageUrl?: string;
  isActive: boolean;
  isKibar: boolean;
  socialTwitter?: string;
  socialTelegram?: string;
  socialYoutube?: string;
  socialWebsite?: string;
  createdAt: string;
  updatedAt?: string;
};

export type ScholarStatsDto = {
  seriesCount: number;
  lecturesCount: number;
  followerCount: number;
  collectionsCount: number;
  standaloneSeriesCount: number;
  standaloneLecturesCount: number;
};
