import { ConfigContext, ExpoConfig } from "expo/config";
import { withSentry } from "@sentry/react-native/expo";
import { version } from "./package.json";
import { getMobileBuildEnv, type AppEnv } from "@sd/env";
import path from "path";

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

type ExpoConfigWithAutolinking = ExpoConfig & {
  autolinking?: {
    searchPaths?: string[];
  };
};

export default ({ config }: ConfigContext): ExpoConfig => {
  const buildEnv = getMobileBuildEnv(process.env);
  const appEnv = buildEnv.APP_ENV;

  const { name, iosBundleId, androidPackage, scheme } = ids(appEnv);

  const expoConfig: ExpoConfigWithAutolinking = {
    ...config,
    name,
    slug: "salafi-durus",
    scheme,
    version,

    // autolinking: {
    //   searchPaths: [
    //     path.resolve(__dirname, "../../node_modules"),
    //     path.resolve(__dirname, "./node_modules"),
    //   ],
    // },

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
      "react-native-keyboard-controller",
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
      [
        "@sentry/react-native/expo",
        {
          url: "https://sentry.io/",
          project: buildEnv.EXPO_PUBLIC_SENTRY_PROJECT,
          organization: buildEnv.EXPO_PUBLIC_SENTRY_ORG,
        },
      ],
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
      },
    },

    android: {
      ...config.android,
      package: androidPackage,
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
      apiUrl: buildEnv.EXPO_PUBLIC_API_URL,
      sentryDsn: buildEnv.EXPO_PUBLIC_SENTRY_DSN,
      sentryOrg: buildEnv.EXPO_PUBLIC_SENTRY_ORG,
      sentryProject: buildEnv.EXPO_PUBLIC_SENTRY_PROJECT,
      vexoProjectId: buildEnv.EXPO_PUBLIC_VEXO_PROJECT_ID,
    },

    owner: OWNER,
  };

  return withSentry(expoConfig, {
    url: "https://sentry.io/",
    project: buildEnv.EXPO_PUBLIC_SENTRY_PROJECT,
    organization: buildEnv.EXPO_PUBLIC_SENTRY_ORG,
  });
};
