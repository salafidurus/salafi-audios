import { Text, type StyleProp, type TextStyle } from "react-native";

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
