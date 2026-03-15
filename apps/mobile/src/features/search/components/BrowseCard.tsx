import { Pressable, Text } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { useRouter } from "expo-router";
import { EaseView } from "react-native-ease";
import { useState } from "react";

export type BrowseCardProps = {
  name: string;
};

export function BrowseCard({ name }: BrowseCardProps) {
  const router = useRouter();
  const { theme } = useUnistyles();
  const [isPressed, setIsPressed] = useState(false);

  const handlePress = () => {
    router.push({
      pathname: "/(tabs)/(search)/searchprocessing",
      params: { searchKey: name },
    });
  };

  return (
    <EaseView
      animate={{
        scale: isPressed ? 0.95 : 1,
      }}
      transition={{ type: "spring", damping: 10, stiffness: 150 }}
      style={[
        styles.container,
        {
          backgroundColor: isPressed ? theme.colors.surface.hover : theme.colors.surface.default,
          borderColor: isPressed ? theme.colors.border.primary : theme.colors.border.default,
        },
      ]}
    >
      <Pressable
        onPress={handlePress}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        style={styles.pressable}
      >
        <Text style={styles.name}>{name}</Text>
      </Pressable>
    </EaseView>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: theme.radius.component.card,
    paddingVertical: theme.spacing.component.gapLg,
    paddingHorizontal: theme.spacing.component.cardPadding,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 100,
  },
  pressable: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    fontFamily: theme.typography.labelMd.fontFamily,
    fontSize: theme.typography.labelMd.fontSize,
    lineHeight: theme.typography.labelMd.lineHeight,
    letterSpacing: theme.typography.labelMd.letterSpacing,
    color: theme.colors.content.default,
    textAlign: "center",
  },
}));
