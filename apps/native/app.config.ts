import { ConfigContext, ExpoConfig } from "expo/config";

type AppEnv = "development" | "preview" | "production";

function ids(env: AppEnv) {
  const baseName = "Salafi Durus Native";
  const baseBundle = "com.salafidevs.salafidurusnative";
  const baseScheme = "salafidurus-native";

  if (env === "production") {
    return {
      name: baseName,
      iosBundleId: baseBundle,
      androidPackage: baseBundle,
      scheme: baseScheme,
    };
  }

  if (env === "preview") {
    return {
      name: `${baseName} (Preview)`,
      iosBundleId: `${baseBundle}.preview`,
      androidPackage: `${baseBundle}.preview`,
      scheme: `${baseScheme}-preview`,
    };
  }

  return {
    name: `${baseName} (Dev)`,
    iosBundleId: `${baseBundle}.dev`,
    androidPackage: `${baseBundle}.dev`,
    scheme: `${baseScheme}-dev`,
  };
}

export default ({ config }: ConfigContext): ExpoConfig => {
  const appEnv = (process.env.APP_ENV ?? "development") as AppEnv;
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  const { name, iosBundleId, androidPackage, scheme } = ids(appEnv);

  return {
    ...config,
    name,
    slug: "salafi-durus-native",
    scheme,
    version: "1.0.0",
    platforms: ["ios", "android"],
    orientation: "default",
    plugins: ["expo-router", "expo-image", "expo-localization", "expo-secure-store"],
    experiments: {
      typedRoutes: true,
      tsconfigPaths: true,
    },
    userInterfaceStyle: "automatic",
    ios: {
      ...config.ios,
      bundleIdentifier: iosBundleId,
      supportsTablet: true,
    },
    android: {
      ...config.android,
      package: androidPackage,
    },
    extra: {
      ...config.extra,
      router: {},
      appEnv,
      apiUrl,
    },
  };
};
