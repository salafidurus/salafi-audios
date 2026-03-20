import { Link, type Href } from "expo-router";
import { openBrowserAsync, WebBrowserPresentationStyle } from "expo-web-browser";
import { useState, type ComponentProps, type ReactNode } from "react";
import { ActivityIndicator, Platform, View, ViewStyle } from "react-native";
import { StyleSheet } from "react-native-unistyles";

type LinkProps = ComponentProps<typeof Link>;

type ExternalLinkProps = {
  href: Href;
  loading?: boolean;
  containerStyle?: ViewStyle;
  linkStyle?: LinkProps["style"];
  children?: ReactNode;
};

export function ExternalLink({
  href,
  loading,
  children,
  containerStyle,
  linkStyle,
}: ExternalLinkProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePress: NonNullable<LinkProps["onPress"]> = async (event) => {
    if (Platform.OS !== "web") {
      if ("preventDefault" in event) {
        event.preventDefault();
      }
      setIsLoading(true);
      try {
        await openBrowserAsync(href.toString(), {
          presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const isLoadingState = loading ?? isLoading;

  if (isLoadingState) {
    return (
      <View style={[styles.container, containerStyle]}>
        <ActivityIndicator size="small" color={styles.indicator.color} />
      </View>
    );
  }

  return (
    <Link target="_blank" href={href} onPress={handlePress} style={linkStyle}>
      {children}
    </Link>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.scale.sm,
  },
  indicator: {
    color: theme.colors.content.muted,
  },
}));
