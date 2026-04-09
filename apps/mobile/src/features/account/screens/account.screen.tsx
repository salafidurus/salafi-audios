import { View, Text, Pressable, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LOCALES, type Locale } from "@sd/core-i18n";
import { useAccountScreen } from "@sd/domain-account";
import { changeLocale } from "../../../core/i18n/i18n";

export type AccountScreenProps = {
  onNavigateToProfile?: () => void;
  onNavigateToLegal?: () => void;
  onSignOut?: () => void;
};

export function AccountScreen({
  onNavigateToProfile,
  onNavigateToLegal,
  onSignOut,
}: AccountScreenProps) {
  const { profile, isFetching } = useAccountScreen();
  const { t, i18n } = useTranslation();

  const handleLocaleChange = async (locale: Locale) => {
    await changeLocale(locale);
  };

  if (isFetching) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>{t("common.loading", "Loading account...")}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold" }}>{t("account.title", "Account")}</Text>
      {profile && (
        <View style={{ marginTop: 16, flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View>
            <Text style={{ fontSize: 16, fontWeight: "600" }}>
              {profile.displayName || t("account.defaultUser", "User")}
            </Text>
            <Text style={{ fontSize: 13, color: "#666" }}>{profile.email}</Text>
          </View>
        </View>
      )}
      <View style={{ marginTop: 24, gap: 8 }}>
        <Pressable
          onPress={onNavigateToProfile}
          style={{
            padding: 12,
            borderWidth: 1,
            borderColor: "#e5e5e5",
            borderRadius: 8,
            backgroundColor: "#fff",
          }}
        >
          <Text style={{ fontSize: 15 }}>{t("account.editProfile", "Edit Profile")}</Text>
        </Pressable>
        <Pressable
          onPress={onNavigateToLegal}
          style={{
            padding: 12,
            borderWidth: 1,
            borderColor: "#e5e5e5",
            borderRadius: 8,
            backgroundColor: "#fff",
          }}
        >
          <Text style={{ fontSize: 15 }}>{t("account.legal", "Legal")}</Text>
        </Pressable>
        <Pressable
          onPress={onSignOut}
          style={{
            padding: 12,
            borderWidth: 1,
            borderColor: "#e5e5e5",
            borderRadius: 8,
            backgroundColor: "#fff",
          }}
        >
          <Text style={{ fontSize: 15, color: "#dc2626" }}>{t("account.signOut", "Sign Out")}</Text>
        </Pressable>
      </View>
      <View style={{ marginTop: 24 }}>
        <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>
          {t("account.language", "Language")}
        </Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {SUPPORTED_LOCALES.map((locale) => (
            <Pressable
              key={locale}
              onPress={() => handleLocaleChange(locale)}
              style={{
                padding: 10,
                borderWidth: 1,
                borderColor: i18n.language === locale ? "#000" : "#e5e5e5",
                borderRadius: 8,
                backgroundColor: i18n.language === locale ? "#000" : "#fff",
              }}
            >
              <Text style={{ fontSize: 14, color: i18n.language === locale ? "#fff" : "#000" }}>
                {locale === "en" ? "English" : "العربية"}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
