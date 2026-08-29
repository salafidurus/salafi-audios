import {
  UpdateProfileDtoSchema,
  type UpdateProfileDto as UpdateProfileDtoType,
} from '@sd/core-contracts';

/** Defines the validated request contract for editable account profile fields. */
export { UpdateProfileDtoSchema };
/** Editable account profile fields accepted by the profile update endpoint. */
export type UpdateProfileDto = UpdateProfileDtoType;
