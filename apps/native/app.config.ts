import { ConfigContext, ExpoConfig } from "expo/config";
import { withSentry } from "@sentry/react-native/expo";
import { version } from "./package.json";
import path from "path";

type AppEnv = "development" | "preview" | "production";

const OWNER = "basmalabs";
// EAS project ID for apps/native. Update this after running `eas init` if
// a separate EAS project is created for native. For now it mirrors the
// mobile project so OTA channels are shared during the transition period.
const PROJECT_ID = "f943688f-bb4a-4f22-af5a-60dc5bafb485";

function ids(env: AppEnv) {
  const baseName = "Salafi Durus";
  const baseBundle = "com.salafidevs.salafidurus";
  const baseScheme = "salafidurus";

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

type ExpoConfigWithAutolinking = ExpoConfig & {
  autolinking?: {
    searchPaths?: string[];
  };
};

export default ({ config }: ConfigContext): ExpoConfig => {
  const appEnv = (process.env.APP_ENV ?? "development") as AppEnv;

  const { name, iosBundleId, androidPackage, scheme } = ids(appEnv);

  const expoConfig: ExpoConfigWithAutolinking = {
    ...config,
    name,
    slug: "salafi-durus",
    scheme,
    version,
    
    // Autolinking path configuration.
    // This ensures that during development, the app can resolve packages from the monorepo's node_modules,
    // while in production, it resolves from the correct location in the bundled app.
    autolinking: {
      searchPaths:
        appEnv === "development"
          ? ["../../node_modules", "./node_modules"]
          : [
              path.resolve(__dirname, "../../node_modules"),
              path.resolve(__dirname, "./node_modules"),
            ],
    },

    platforms: ["ios", "android"],
    orientation: "default",

    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/icons/splash-icon-light.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: {
            backgroundColor: "#000000",
          },
        },
      ],
      "expo-localization",
      "expo-font",
      "expo-web-browser",
      "expo-image",
      "expo-secure-store",
      [
        "@sentry/react-native/expo",
        {
          url: "https://sentry.io/",
          project: process.env.EXPO_PUBLIC_SENTRY_PROJECT,
          organization: process.env.EXPO_PUBLIC_SENTRY_ORG,
        },
      ],
      "expo-audio",
    ],

    experiments: {
      typedRoutes: true,
      tsconfigPaths: true,
    },

    userInterfaceStyle: "automatic",
    assetBundlePatterns: ["**/*"],

    icon: "./assets/icons/ios-light.png",
    splash: {
      image: "./assets/icons/splash-icon-light.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
      dark: {
        image: "./assets/icons/splash-icon-dark.png",
        backgroundColor: "#000000",
      },
    },

    ios: {
      ...config.ios,
      bundleIdentifier: iosBundleId,
      supportsTablet: true,
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        UIBackgroundModes: ["audio"],
      },
    },

    android: {
      ...config.android,
      package: androidPackage,
      permissions: [
        "FOREGROUND_SERVICE",
        "FOREGROUND_SERVICE_MEDIA_PLAYBACK",
      ],
      adaptiveIcon: {
        backgroundColor: "#ffffff",
        foregroundImage: "./assets/icons/adaptive-icon.png",
        backgroundImage: "./assets/icons/adaptive-icon.png",
        monochromeImage: "./assets/icons/adaptive-icon.png",
      },
    },

    runtimeVersion: {
      policy: "fingerprint",
    },

    updates: {
      url: `https://u.expo.dev/${PROJECT_ID}`,
    },

    extra: {
      ...config.extra,
      router: {},
      eas: {
        projectId: PROJECT_ID,
      },
      appEnv,
      apiUrl: process.env.EXPO_PUBLIC_API_URL,
      sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
      sentryOrg: process.env.EXPO_PUBLIC_SENTRY_ORG,
      sentryProject: process.env.EXPO_PUBLIC_SENTRY_PROJECT,
      vexoProjectId: process.env.EXPO_PUBLIC_VEXO_PROJECT_ID,
    },

    owner: OWNER,
  };

  return withSentry(expoConfig, {
    url: "https://sentry.io/",
    project: process.env.EXPO_PUBLIC_SENTRY_PROJECT,
    organization: process.env.EXPO_PUBLIC_SENTRY_ORG,
  });
};
