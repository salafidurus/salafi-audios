import {
  SaveTopicTranslationDtoSchema,
  type SaveTopicTranslationDto as SaveTopicTranslationDtoType,
} from '@sd/core-contracts';

/** Request contract for creating or replacing a topic translation in one locale. */
export { SaveTopicTranslationDtoSchema };
/** Fields accepted by the topic-translation write endpoint. */
export type SaveTopicTranslationDto = SaveTopicTranslationDtoType;
