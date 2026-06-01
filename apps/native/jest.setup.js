/* global jest */
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
  } catch (e) {
    // Ignore any evaluation errors during eager load
  }
}

jest.mock("react-native/Libraries/EventEmitter/NativeEventEmitter");

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
}));
