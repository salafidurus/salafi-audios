import { Listing } from "./Listing/Listing";
import { ListingModal } from "./Listing/ListingModal";
import { ListingUploadArrangeModal } from "./Listing/ListingUploadArrangeModal";
import { Topic } from "./Topic/Topic";
import { TopicModal } from "./Topic/TopicModal";

/**
 * Exposes the admin content editors and their modal entry points as one stable namespace.
 *
 * Consumers use this object to select the appropriate editor without importing each
 * content type's implementation details individually.
 */
export const Content = {
  Topic,
  Listing,
  TopicModal,
  ListingModal,
  ListingUploadArrangeModal,
};
