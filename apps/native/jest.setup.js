/* global jest */
jest.setTimeout(15000);

// Eagerly evaluate Expo's lazy globals to prevent Jest from throwing "import outside of the scope of the test code"
// when they are accessed asynchronously/lazy-loaded later during tests.
const eagerEvaluate = [
  "TextDecoder",
  "TextDecoderStream",
  "TextEncoderStream",
  "URL",
  "URLSearchParams",
  "DOMException",
  "__ExpoImportMetaRegistry",
  "structuredClone",
  "fetch",
  "Headers",
  "Request",
  "Response",
];

for (const name of eagerEvaluate) {
  try {
    if (global[name]) {
      // Eagerly access a property to trigger the lazy getter
      const _ = global[name].prototype || global[name];
    }
  } catch {
    // Ignore any evaluation errors during eager load
  }
}

jest.mock("react-native/Libraries/EventEmitter/NativeEventEmitter");

// react-native-unistyles pulls in native nitro-modules that cannot load under
// jest. Mock it so StyleSheet.create((theme) => ...) resolves against the real
// light theme and useUnistyles exposes that theme.
jest.mock("react-native-unistyles", () => {
  const { lightNativeTheme: baseTheme } = require("./src/core/styles/theme");
  const lightNativeTheme = {
    ...baseTheme,
    border: {
      ...baseTheme.border,
      width: {
        ...baseTheme.border.width,
        hairline: 0.5,
      },
    },
  };
  const resolve = (styles) =>
    typeof styles === "function" ? styles(lightNativeTheme, {}) : styles;
  return {
    StyleSheet: {
      create: resolve,
      configure: () => undefined,
    },
    useUnistyles: () => ({ theme: lightNativeTheme, rt: {} }),
  };
});

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
}));
