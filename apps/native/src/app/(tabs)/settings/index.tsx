import { SettingsGeneralScreen } from "@/features/settings/screens/settings-general.screen";

/** Defines the Expo Router entrypoint for the native (tabs)/settings route and delegates behavior to the feature layer. */
/** Renders the native settings index route surface and coordinates its user-facing state. */
export default function SettingsIndexRoute() {
  return <SettingsGeneralScreen />;
}
