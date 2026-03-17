/* eslint-disable @typescript-eslint/no-explicit-any */
// Ambient declarations for react-native-unistyles native component subpaths.
// These subpaths have no "types" entry in the package exports map, so TypeScript
// cannot resolve them. Declaring them here lets the web build compile code from
// @sd/ui-mobile that imports these subpaths.

declare module "react-native-unistyles/components/native/View" {
  export const View: any;
}
declare module "react-native-unistyles/components/native/Text" {
  export const Text: any;
}
declare module "react-native-unistyles/components/native/Pressable" {
  export const Pressable: any;
}
declare module "react-native-unistyles/components/native/TextInput" {
  export const TextInput: any;
}
declare module "react-native-unistyles/components/native/ScrollView" {
  export const ScrollView: any;
}
declare module "react-native-unistyles/components/native/Image" {
  export const Image: any;
}
declare module "react-native-unistyles/components/native/SafeAreaView" {
  export const SafeAreaView: any;
}
declare module "react-native-unistyles/components/native/FlatList" {
  export const FlatList: any;
}
