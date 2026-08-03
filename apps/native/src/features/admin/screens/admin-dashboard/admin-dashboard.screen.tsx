import type { AppActions, AppSubjectType } from "@sd/core-contracts";

import { Column, ScrollView } from "@expo/ui";
import { useAbility } from "@sd/domain-account";
import { useUnistyles } from "react-native-unistyles";

import { useAuth } from "@/core/auth/use-auth";
import { useTranslation } from "@/core/i18n/use-translation";
import { NativeButton, NativeScreenHost, NativeStateView, NativeText } from "@/shared/ui";

type AdminDashboardScreenProps = {
  onNavigateToListings?: () => void;
  onNavigateToScholars?: () => void;
  onNavigateToAccess?: () => void;
};

type AdminCard = {
  key: string;
  title: string;
  subtitle: string;
  onPress?: () => void;
  icon: "play" | "settings";
  action: AppActions;
  subject: AppSubjectType;
};

export function AdminDashboardScreen({
  onNavigateToListings,
  onNavigateToScholars,
}: AdminDashboardScreenProps) {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const { isAuthenticated } = useAuth();
  const { ability, isLoading } = useAbility({ isAuthenticated });

  const cards: AdminCard[] = [
    {
      key: "listings",
      title: t("navigation.subnav.admin.listings", "Listings"),
      subtitle: t("admin.manageAudios", "Manage audio content"),
      onPress: onNavigateToListings,
      icon: "play",
      action: "read",
      subject: "Listing",
    },
    {
      key: "scholars",
      title: t("navigation.admin.scholars", "Scholars"),
      subtitle: t("admin.manageSeries", "Manage scholars & series"),
      onPress: onNavigateToScholars,
      icon: "settings",
      action: "read",
      subject: "Scholar",
    },
  ];

  const visibleCards = isLoading
    ? []
    : cards.filter((card) => ability.can(card.action, card.subject));

  return (
    <NativeScreenHost testID="admin-dashboard-host">
      <ScrollView showsIndicators={false} style={{ width: "100%" }}>
        <Column
          spacing={theme.spacing.component.gapLg}
          style={{
            padding: theme.spacing.layout.pageX,
            width: "100%",
          }}
        >
          {isLoading ? (
            <NativeStateView kind="loading" title={t("admin.dashboard.loading", "Loading…")} />
          ) : visibleCards.length === 0 ? (
            <NativeStateView
              kind="empty"
              title={t("admin.dashboard.noAccess", "You don't have any admin access.")}
            />
          ) : (
            visibleCards.map((card) => (
              <Column key={card.key} spacing={theme.spacing.scale.xs} style={{ width: "100%" }}>
                <NativeButton
                  label={card.title}
                  icon={card.icon}
                  onPress={card.onPress}
                  variant="surface"
                  fullWidth
                  testID={`admin-dashboard-${card.key}`}
                />
                <NativeText variant="bodySm" colorRole="muted">
                  {card.subtitle}
                </NativeText>
              </Column>
            ))
          )}
        </Column>
      </ScrollView>
    </NativeScreenHost>
  );
}
