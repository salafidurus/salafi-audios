import type { AppActions, AppSubjectType } from "@sd/core-contracts";

import { useAbility } from "@sd/domain-account";
import { Pressable, ScrollView, Text } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { useAuth } from "@/core/auth/use-auth";
import { useTranslation } from "@/core/i18n/use-translation";
import { EmptyState } from "@/shared/components/EmptyState/EmptyState";

type AdminDashboardScreenProps = {
  onNavigateToListings?: () => void;
  onNavigateToScholars?: () => void;
  onNavigateToPermissions?: () => void;
};

type AdminCard = {
  key: string;
  title: string;
  subtitle: string;
  onPress?: () => void;
  cardStyle: (typeof styles)["cardListings"] | (typeof styles)["cardScholars"];
  action: AppActions;
  subject: AppSubjectType;
};

export function AdminDashboardScreen({
  onNavigateToListings,
  onNavigateToScholars,
}: AdminDashboardScreenProps) {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { ability, isLoading } = useAbility({ isAuthenticated });

  const cards: AdminCard[] = [
    {
      key: "listings",
      title: t("navigation.subnav.admin.listings", "Listings"),
      subtitle: t("admin.manageAudios", "Manage audio content"),
      onPress: onNavigateToListings,
      cardStyle: styles.cardListings,
      action: "read",
      subject: "Listing",
    },
    {
      key: "scholars",
      title: t("navigation.admin.scholars", "Scholars"),
      subtitle: t("admin.manageSeries", "Manage scholars & series"),
      onPress: onNavigateToScholars,
      cardStyle: styles.cardScholars,
      action: "read",
      subject: "Scholar",
    },
  ];

  if (isLoading) {
    return <EmptyState variant="loading" message={t("admin.dashboard.loading", "Loading…")} />;
  }

  const visibleCards = cards.filter((card) => ability.can(card.action, card.subject));

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t("admin.dashboard.title", "Admin Dashboard")}</Text>

      {visibleCards.length === 0 ? (
        <EmptyState
          message={t("admin.dashboard.noPermissions", "You don't have any admin permissions.")}
        />
      ) : (
        visibleCards.map((card) => (
          <Pressable key={card.key} onPress={card.onPress} style={[styles.card, card.cardStyle]}>
            <Text style={styles.cardTitle}>{card.title}</Text>
            <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
          </Pressable>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.surface.canvas,
  },
  content: {
    padding: theme.spacing.scale.lg,
    paddingBottom: theme.spacing.scale["4xl"],
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: theme.spacing.scale["2xl"],
    color: theme.colors.content.strong,
  },
  card: {
    padding: theme.spacing.scale.lg,
    marginBottom: theme.spacing.scale.md,
    backgroundColor: theme.colors.surface.subtle,
    borderRadius: theme.radius.scale.md,
    borderStartWidth: 4,
  },
  cardListings: {
    borderStartColor: theme.colors.state.danger,
  },
  cardScholars: {
    borderStartColor: theme.colors.state.success,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: theme.spacing.scale.xs,
    color: theme.colors.content.strong,
  },
  cardSubtitle: {
    fontSize: 13,
    color: theme.colors.content.muted,
  },
}));
