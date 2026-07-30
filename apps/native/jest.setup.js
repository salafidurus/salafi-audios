/* global jest */
jest.setTimeout(15000);
jest.retryTimes(2);

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
      void (global[name].prototype || global[name]);
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
  const { lightNativeTheme } = require("./src/core/styles/theme");
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

jest.mock("@tanstack/react-query", () => ({
  useQueryClient: jest.fn(() => ({
    invalidateQueries: jest.fn().mockResolvedValue(undefined),
  })),
}));

// @expo/ui renders real SwiftUI/Jetpack Compose views, which don't exist under
// Jest's node test environment. Mock each entry point with RN-equivalent stand-ins
// so specs can render, query, and interact with them the same way as before.
jest.mock("@expo/ui", () => {
  const React = require("react");
  const {
    Pressable,
    Switch: RNSwitch,
    TextInput: RNTextInput,
    View,
    Text,
  } = require("react-native");

  function Host({ children, style, ...rest }) {
    return React.createElement(View, { style, ...rest }, children);
  }

  function Button({ children, label, onPress, disabled, testID }) {
    return React.createElement(
      Pressable,
      {
        onPress,
        disabled,
        testID,
        accessibilityRole: "button",
        accessibilityState: { disabled },
      },
      children ?? React.createElement(Text, null, label),
    );
  }

  function Switch({ value, onValueChange, disabled, testID }) {
    return React.createElement(RNSwitch, { value, onValueChange, disabled, testID });
  }

  function TextInput({
    defaultValue,
    placeholder,
    placeholderTextColor,
    onChangeText,
    editable,
    secureTextEntry,
    testID,
    multiline,
    keyboardType,
    autoCapitalize,
    autoCorrect,
    autoFocus,
    maxLength,
    onSubmitEditing,
    onFocus,
    onBlur,
  }) {
    return React.createElement(RNTextInput, {
      defaultValue,
      placeholder,
      placeholderTextColor,
      onChangeText,
      editable,
      secureTextEntry,
      testID,
      multiline,
      keyboardType,
      autoCapitalize,
      autoCorrect,
      autoFocus,
      maxLength,
      onFocus,
      onBlur,
      onSubmitEditing: onSubmitEditing ? (e) => onSubmitEditing(e.nativeEvent.text) : undefined,
    });
  }

  return { Host, Button, Switch, TextInput };
});

jest.mock("@expo/ui/community/segmented-control", () => {
  const React = require("react");
  const { Pressable, Text, View } = require("react-native");

  function SegmentedControl({
    values = [],
    selectedIndex,
    onValueChange,
    onChange,
    enabled = true,
    testID,
  }) {
    return React.createElement(
      View,
      { testID },
      values.map((value, index) =>
        React.createElement(
          Pressable,
          {
            key: value,
            disabled: !enabled,
            accessibilityRole: "button",
            accessibilityState: { selected: index === selectedIndex },
            onPress: () => {
              onValueChange?.(value);
              onChange?.({ nativeEvent: { selectedSegmentIndex: index, value } });
            },
          },
          React.createElement(Text, null, value),
        ),
      ),
    );
  }

  return { SegmentedControl };
});

// The mock renders every action inline (rather than simulating an open/closed native
// menu) so specs can select an action directly via its title/testID without having to
// choreograph a long-press-then-tap sequence the real native menu can't express in Jest.
jest.mock("@expo/ui/community/menu", () => {
  const React = require("react");
  const { Pressable, Text, View } = require("react-native");

  function renderActions(actions, onPressAction, prefix) {
    return actions.map((action) => {
      if (action.subactions?.length) {
        return React.createElement(
          View,
          { key: action.id ?? action.title },
          renderActions(action.subactions, onPressAction, prefix),
        );
      }
      const id = action.id ?? action.title;
      return React.createElement(
        Pressable,
        {
          key: id,
          testID: `${prefix}-action-${id}`,
          disabled: action.attributes?.disabled,
          accessibilityRole: "menuitem",
          accessibilityState: action.state ? { checked: action.state === "on" } : undefined,
          onPress: () => onPressAction?.({ nativeEvent: { event: id } }),
        },
        React.createElement(Text, null, action.title),
      );
    });
  }

  function MenuView({ children, actions = [], onPressAction, testID = "menu" }) {
    return React.createElement(
      View,
      { testID },
      children,
      renderActions(actions, onPressAction, testID),
    );
  }

  return { MenuView, default: MenuView };
});

jest.mock("react-native-reanimated", () => {
  const { View, Text, Image, ScrollView } = require("react-native");

  return {
    __esModule: true,
    default: {
      View,
      Text,
      Image,
      ScrollView,
      createAnimatedComponent: (c) => c,
    },
    useSharedValue: jest.fn((value) => ({ value })),
    useAnimatedStyle: jest.fn((fn) => (typeof fn === "function" ? fn() : {})),
    useAnimatedReaction: jest.fn(),
    withTiming: jest.fn((toValue) => toValue),
    withDelay: jest.fn((_, anim) => anim),
    withSequence: jest.fn((...anims) => anims[0]),
    withRepeat: jest.fn((anim) => anim),
    cancelAnimation: jest.fn(),
    Easing: {
      linear: (v) => v,
      ease: (v) => v,
      bezier: () => (v) => v,
    },
    runOnJS: jest.fn((fn) => fn),
    interpolate: jest.fn(),
    Extrapolate: { CLAMP: "clamp" },
  };
});
