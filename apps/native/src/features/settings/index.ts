// Screens
export { AccountScreen, type AccountScreenProps } from "./screens/account.screen";
export {
  AccountProfileScreen,
  type AccountProfileScreenProps,
} from "./screens/account-profile.screen";
export { SupportScreen } from "./screens/support.screen";
export { LegalToggleScreen } from "./screens/legal-toggle.screen";

// Components
export { LanguageSwitch } from "./components/language-switch/language-switch";
export { ContentLanguageToggle } from "./components/content-language-toggle/content-language-toggle";

// i18n utilities
export {
  contentPreferenceStore,
  useShowOriginalContent,
  setShowOriginalContent,
} from "./content-preference";
