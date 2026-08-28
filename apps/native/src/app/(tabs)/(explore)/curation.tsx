import { CurationScreen } from "@/features/explore/screens/curation.screen";

/** Defines the Expo Router entrypoint for the native (tabs)/(explore)/curation route and delegates behavior to the feature layer. */
/** Renders the native explore curation route surface and coordinates its user-facing state. */
export default function ExploreCurationRoute() {
  return <CurationScreen />;
}
