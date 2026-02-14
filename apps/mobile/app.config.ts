import type { ConfigContext, ExpoConfig } from "expo/config";
import { version } from "./package.json";
import { getMobileBuildEnv, type AppEnv } from "@sd/env";

const OWNER = "basmalabs";
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

export default ({ config }: ConfigContext): ExpoConfig => {
  const buildEnv = getMobileBuildEnv(process.env);
  const appEnv = buildEnv.APP_ENV;

  const { name, iosBundleId, androidPackage, scheme } = ids(appEnv);

  return {
    ...config,
    name,
    slug: "salafi-durus",
    scheme,
    version,

    newArchEnabled: true,
    platforms: ["ios", "android"],
    orientation: "default",

    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
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
    ],

    experiments: {
      typedRoutes: true,
      tsconfigPaths: true,
    },

    userInterfaceStyle: "automatic",
    assetBundlePatterns: ["**/*"],

    icon: "./assets/images/icon.png",
    splash: {
      image: "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
      dark: {
        image: "./assets/images/splash-icon.png",
        backgroundColor: "#000000",
      },
    },

    ios: {
      ...config.ios,
      bundleIdentifier: iosBundleId,
      supportsTablet: true,
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },

    android: {
      ...config.android,
      package: androidPackage,
      edgeToEdgeEnabled: true,
      adaptiveIcon: {
        backgroundColor: "#ffffff",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png",
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
      apiUrl: buildEnv.EXPO_PUBLIC_API_URL,
    },

    owner: OWNER,
  };
};
