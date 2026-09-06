import { Listing } from "./Listing/Listing";
import { ListingModal } from "./Listing/ListingModal";
import { ListingUploadArrangeModal } from "./Listing/ListingUploadArrangeModal";
import { Topic } from "./Topic/Topic";
import { TopicModal } from "./Topic/TopicModal";

/**
 * Provides the admin dashboard's single registry for content editors and modal entry points.
 *
 * The property names are the supported component identities; consumers select a content
 * surface from this object without reaching into the individual editor implementation paths.
 */
export const Content = {
  Topic,
  Listing,
  TopicModal,
  ListingModal,
  ListingUploadArrangeModal,
};
