import { Pressable, ScrollView, Text, View } from "react-native";
import { useTranslation } from "@/core/i18n/use-translation";
import { useAccountScreen } from "@sd/domain-account";
import { LanguageSwitch, ContentLanguageToggle } from "@/features/i18n";
import { useAdminPermissions } from "@/features/admin/hooks/use-admin-permissions";

export type AccountScreenProps = {
  onNavigateToProfile?: () => void;
  onNavigateToLegal?: () => void;
  onNavigateToAdmin?: () => void;
  onSignOut?: () => void;
};

export function AccountScreen({
  onNavigateToProfile,
  onNavigateToLegal,
  onNavigateToAdmin,
  onSignOut,
}: AccountScreenProps) {
  const { profile, isFetching } = useAccountScreen();
  const { t } = useTranslation();
  const { hasAnyPermission } = useAdminPermissions();

  if (isFetching) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>{t("common.loading", "Loading account…")}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold" }}>{t("account.title", "Account")}</Text>
      {profile ? (
        <View style={{ marginTop: 16, flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View>
            <Text style={{ fontSize: 16, fontWeight: "600" }}>
              {profile.displayName || t("account.defaultUser", "User")}
            </Text>
            <Text style={{ fontSize: 13, color: "#666" }}>{profile.email}</Text>
          </View>
        </View>
      ) : null}
      <View style={{ marginTop: 24, gap: 8 }}>
        {hasAnyPermission && (
          <Pressable
            onPress={onNavigateToAdmin}
            style={{
              padding: 12,
              borderWidth: 1,
              borderColor: "#3b82f6",
              borderRadius: 8,
              backgroundColor: "#eff6ff",
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: "600", color: "#3b82f6" }}>
              {t("account.admin", "Admin")}
            </Text>
          </Pressable>
        )}
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
      <View style={{ marginTop: 24, gap: 16 }}>
        <View>
          <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>
            {t("account.language", "Language")}
          </Text>
          <LanguageSwitch />
        </View>
        <ContentLanguageToggle />
      </View>
    </ScrollView>
  );
}
