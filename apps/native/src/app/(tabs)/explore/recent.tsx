import { Redirect } from "expo-router";

export default function ExploreRecentRedirect() {
  return <Redirect href="/explore?sub=recent" />;
}
