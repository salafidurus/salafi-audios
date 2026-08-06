import { Redirect } from "expo-router";

// The Explore group root (/explore) redirects to the default Recent sub-tab.
export default function ExploreIndexRoute() {
  return <Redirect href="/explore/recent" />;
}
