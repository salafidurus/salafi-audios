import "intl-pluralrules";
import "./src/core/styles/unistyles";
import * as WebBrowser from "expo-web-browser";
import "expo-router/entry";

// Complete any active Expo WebBrowser auth session redirect when the app launches or handles a deep-link callback.
// This clears internal redirect handlers and prevents "WebBrowser auth session in an invalid state" errors.
WebBrowser.maybeCompleteAuthSession();
