import { type StyleProp, type TextStyle } from "react-native";
import { Text } from "react-native-unistyles/components/native/Text";

export type MarqueeTextProps = {
  text: string;
  textStyle?: StyleProp<TextStyle>;
};

export function MarqueeText({ text, textStyle }: MarqueeTextProps) {
  return (
    <Text numberOfLines={1} ellipsizeMode="tail" style={textStyle}>
      {text}
    </Text>
  );
}
