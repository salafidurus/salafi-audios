/** Exposes native navigation accessory components and route helpers. */
// Screens (none currently — navigation uses Expo Router tabs directly)

export { GlobalSearchButton } from "./components/GlobalSearchButton/GlobalSearchButton";
export {
  RootScreenHeader,
  type RootScreenHeaderProps,
} from "./components/RootScreenHeader/RootScreenHeader";

// Components (used outside this feature)
export { BottomAccessory } from "./components/BottomAccessory/BottomAccessory";
export {
  BottomAccessoryContent,
  BottomAccessoryContent as BottomAccessoryInnerContent,
} from "./components/BottomAccessory/BottomAccessoryContent";
