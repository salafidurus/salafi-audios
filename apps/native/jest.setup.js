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

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

const mockQueryClientInstance = {
  invalidateQueries: jest.fn().mockResolvedValue(undefined),
  clear: jest.fn(),
};

jest.mock("@tanstack/react-query", () => ({
  useQueryClient: jest.fn(() => mockQueryClientInstance),
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

  // Mirrors the real ObservableState contract (a plain object with a mutable
  // `.value`) but backs it with React state, so a caller mutating `.value`
  // (e.g. to reset a field) is actually observable/re-renders in tests, the
  // same way the native module's Proxy-backed state would.
  function useNativeState(initial) {
    const [current, setCurrent] = React.useState(initial);
    return React.useMemo(
      () => ({
        get value() {
          return current;
        },
        set value(next) {
          setCurrent(next);
        },
      }),
      [current],
    );
  }

  function TextInput({
    value,
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
      value: value ? value.value : undefined,
      defaultValue: value ? undefined : defaultValue,
      placeholder,
      placeholderTextColor,
      onChangeText: (text) => {
        if (value) value.value = text;
        onChangeText?.(text);
      },
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

  return { Host, Button, Switch, TextInput, useNativeState };
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
    appearance,
    testID,
  }) {
    return React.createElement(
      View,
      { testID: testID ?? "native-segmented-control", appearance },
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

// Platform-specific Button (Button.ios.tsx / Button.android.tsx) import the
// raw swift-ui / jetpack-compose modules directly, not the universal @expo/ui
// entry point mocked above — each needs its own mock. jest-expo resolves
// extensionless imports to `.ios.tsx` by default, so in practice only the
// swift-ui mocks below are exercised by the current test suite; the
// jetpack-compose ones are kept for parity/future-proofing.
jest.mock("@expo/ui/swift-ui", () => {
  const React = require("react");
  const { Pressable, Text, View } = require("react-native");

  function Button({ children, label, onPress, modifiers = [], testID }) {
    const isDisabled = modifiers.some((m) => m.$type === "disabled" && m.value !== false);
    return React.createElement(
      Pressable,
      {
        onPress,
        disabled: isDisabled,
        testID,
        accessibilityRole: "button",
        accessibilityState: { disabled: isDisabled },
      },
      children ?? React.createElement(Text, null, label),
    );
  }

  function HStack({ children, spacing }) {
    return React.createElement(
      View,
      { style: { flexDirection: "row", alignItems: "center", gap: spacing } },
      children,
    );
  }

  function SwiftUIText({ children }) {
    return React.createElement(Text, null, children);
  }

  // isPresented fully controls visibility here (matches the real controlled-
  // component contract); Alert.Trigger is rendered as null since its Button is
  // only a required SwiftUI anchor, never actually pressed by the user.
  function Alert({ title, isPresented, children }) {
    if (!isPresented) return null;
    return React.createElement(View, null, React.createElement(Text, null, title), children);
  }
  Alert.Trigger = () => null;
  Alert.Actions = function AlertActions({ children }) {
    return React.createElement(View, null, children);
  };
  Alert.Message = function AlertMessage({ children }) {
    return React.createElement(View, null, children);
  };

  return { Button, HStack, Text: SwiftUIText, Alert };
});

jest.mock("@expo/ui/swift-ui/modifiers", () => ({
  background: (color) => ({ $type: "background", color }),
  border: (params) => ({ $type: "border", ...params }),
  buttonStyle: (style) => ({ $type: "buttonStyle", style }),
  clipShape: (shape, cornerRadius) => ({ $type: "clipShape", shape, cornerRadius }),
  disabled: (value = true) => ({ $type: "disabled", value }),
  font: (params) => ({ $type: "font", ...params }),
  foregroundStyle: (style) => ({ $type: "foregroundStyle", style }),
  frame: (params) => ({ $type: "frame", ...params }),
  opacity: (value) => ({ $type: "opacity", value }),
  padding: (params) => ({ $type: "padding", ...params }),
}));

jest.mock("@expo/ui/jetpack-compose", () => {
  const React = require("react");
  const { Pressable, Text, View } = require("react-native");

  function makeComposeButton() {
    return function ComposeButton({ children, onClick, enabled = true, modifiers = [] }) {
      const isDisabled = !enabled;
      const testIdMod = modifiers.find((m) => m.$type === "testID");
      return React.createElement(
        Pressable,
        {
          onPress: onClick,
          disabled: isDisabled,
          testID: testIdMod?.tag,
          accessibilityRole: "button",
          accessibilityState: { disabled: isDisabled },
        },
        children,
      );
    };
  }

  function ComposeText({ children, color, style }) {
    return React.createElement(Text, { style: { color, ...style } }, children);
  }

  function Spacer() {
    return React.createElement(View, null);
  }

  // Visibility is controlled by the caller conditionally rendering AlertDialog
  // (matches the real controlled-component contract), so the mock just renders
  // its compound-component children as-is. `colors` is forwarded onto the
  // wrapping View (queryable via testID) so specs can assert theming reaches it.
  function AlertDialog({ children, colors }) {
    return React.createElement(View, { testID: "alert-dialog", colors }, children);
  }
  AlertDialog.Title = function AlertDialogTitle({ children }) {
    return React.createElement(View, null, children);
  };
  AlertDialog.Text = function AlertDialogText({ children }) {
    return React.createElement(View, null, children);
  };
  AlertDialog.DismissButton = function AlertDialogDismissButton({ children }) {
    return React.createElement(View, null, children);
  };
  AlertDialog.ConfirmButton = function AlertDialogConfirmButton({ children }) {
    return React.createElement(View, null, children);
  };

  return {
    Button: makeComposeButton(),
    OutlinedButton: makeComposeButton(),
    TextButton: makeComposeButton(),
    FilledTonalButton: makeComposeButton(),
    ElevatedButton: makeComposeButton(),
    Text: ComposeText,
    Spacer,
    AlertDialog,
  };
});

jest.mock("@expo/ui/jetpack-compose/modifiers", () => ({
  alpha: (value) => ({ $type: "alpha", value }),
  background: (color) => ({ $type: "background", color }),
  border: (width, color) => ({ $type: "border", width, color }),
  clip: (shape) => ({ $type: "clip", shape }),
  height: (value) => ({ $type: "height", value }),
  padding: (start, top, end, bottom) => ({ $type: "padding", start, top, end, bottom }),
  Shapes: { RoundedCorner: (radius) => ({ type: "roundedCorner", radius }) },
  testID: (tag) => ({ $type: "testID", tag }),
  width: (value) => ({ $type: "width", value }),
}));

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
      inOut: (fn) => fn,
      easeIn: (v) => v,
      easeOut: (v) => v,
    },
    runOnJS: jest.fn((fn) => fn),
    interpolate: jest.fn(),
    Extrapolate: { CLAMP: "clamp" },
  };
});

jest.mock("@expo/vector-icons", () => {
  return {
    Ionicons: "Ionicons",
  };
});
