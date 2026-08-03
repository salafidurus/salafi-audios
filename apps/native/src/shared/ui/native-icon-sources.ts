import { Icon } from "@expo/ui";

export const nativeIconSources = {
  add: Icon.select({ ios: "plus", android: import("@expo/material-symbols/add.xml") }),
  back: Icon.select({
    ios: "chevron.backward",
    android: import("@expo/material-symbols/arrow_back.xml"),
  }),
  check: Icon.select({ ios: "checkmark", android: import("@expo/material-symbols/check.xml") }),
  close: Icon.select({ ios: "xmark", android: import("@expo/material-symbols/close.xml") }),
  delete: Icon.select({ ios: "trash", android: import("@expo/material-symbols/delete.xml") }),
  download: Icon.select({
    ios: "arrow.down.circle",
    android: import("@expo/material-symbols/download.xml"),
  }),
  edit: Icon.select({ ios: "pencil", android: import("@expo/material-symbols/edit.xml") }),
  error: Icon.select({
    ios: "exclamationmark.triangle",
    android: import("@expo/material-symbols/error.xml"),
  }),
  more: Icon.select({ ios: "ellipsis", android: import("@expo/material-symbols/more_horiz.xml") }),
  pause: Icon.select({ ios: "pause.fill", android: import("@expo/material-symbols/pause.xml") }),
  play: Icon.select({
    ios: "play.fill",
    android: import("@expo/material-symbols/play_arrow.xml"),
  }),
  search: Icon.select({
    ios: "magnifyingglass",
    android: import("@expo/material-symbols/search.xml"),
  }),
  settings: Icon.select({
    ios: "gearshape",
    android: import("@expo/material-symbols/settings.xml"),
  }),
  success: Icon.select({
    ios: "checkmark.circle.fill",
    android: import("@expo/material-symbols/check_circle.xml"),
  }),
  translate: Icon.select({
    ios: "character.book.closed",
    android: import("@expo/material-symbols/translate.xml"),
  }),
} as const;

export type NativeIconName = keyof typeof nativeIconSources;
