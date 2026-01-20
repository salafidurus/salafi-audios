/* global jest */
import "react-native-unistyles/mocks";
import "./src/core/styles/unistyles";

jest.mock("react-native/Libraries/EventEmitter/NativeEventEmitter");

jest.mock("react-native-unistyles", () => ({
  StyleSheet: { create: (styles) => styles },
}));

jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const { Text } = require("react-native");

  const Icon = ({ name, ...props }) => React.createElement(Text, props, name);

  return {
    Ionicons: Icon,
    MaterialIcons: Icon,
    FontAwesome: Icon,
  };
});
