import { Pressable, Text } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { useRouter } from "expo-router";

export type BrowseCardProps = {
  name: string;
};

export function BrowseCard({ name }: BrowseCardProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push({
      pathname: "/(tabs)/(search)/searchprocessing",
      params: { searchKey: name },
    });
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      <Text style={styles.name}>{name}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.surface.default,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border.default,
    borderRadius: theme.radius.component.card,
    paddingVertical: theme.spacing.component.gapLg,
    paddingHorizontal: theme.spacing.component.cardPadding,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 100,
  },
  pressed: {
    backgroundColor: theme.colors.surface.hover,
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
