import {
  CreateTopicWithTranslationsDtoSchema,
  type CreateTopicWithTranslationsDto,
} from '@sd/core-contracts';

/** Defines the validated request contract for creating topic content. */
export { CreateTopicWithTranslationsDtoSchema };
/** Fields accepted when creating a topic with its main-language content. */
export type CreateTopicDto = CreateTopicWithTranslationsDto;
