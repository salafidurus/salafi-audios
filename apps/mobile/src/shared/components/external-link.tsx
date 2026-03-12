import { Link, type Href } from "expo-router";
import { openBrowserAsync, WebBrowserPresentationStyle } from "expo-web-browser";
import { useState } from "react";
import { ActivityIndicator, Platform, StyleSheet, View, ViewStyle } from "react-native";

type ExternalLinkProps = {
  href: Href;
  loading?: boolean;
  style?: ViewStyle;
  children?: React.ReactNode;
};

export function ExternalLink({ href, loading, children, style }: ExternalLinkProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePress = async (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    if (Platform.OS !== "web") {
      event.preventDefault();
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
      <View style={[styles.container, style]}>
        <ActivityIndicator size="small" />
      </View>
    );
  }

  return (
    <Link target="_blank" href={href} onPress={handlePress as any} style={style as any}>
      {children}
    </Link>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
});
