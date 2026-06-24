import { ScrollView, Text, TextInput, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { useAccountProfile } from "@sd/domain-account";

export type AccountProfileScreenProps = {
  onBack?: () => void;
};

export function AccountProfileScreen(_props: AccountProfileScreenProps) {
  const { data: profile, isFetching } = useAccountProfile();
  const { theme } = useUnistyles();

  if (isFetching) {
    return (
      <View style={styles.centered}>
        <Text style={styles.statusText}>Loading profile...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.centered}>
        <Text style={styles.statusText}>Profile not available</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Edit Profile</Text>
      <View style={styles.form}>
        <View style={styles.field}>
          <Text style={styles.label}>Display Name</Text>
          <TextInput
            defaultValue={profile.displayName || ""}
            placeholder="Your display name"
            placeholderTextColor={theme.colors.content.muted}
            style={styles.input}
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            defaultValue={profile.email}
            editable={false}
            style={[styles.input, styles.inputDisabled]}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create((theme) => ({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  statusText: {
    color: theme.colors.content.default,
  },
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: theme.spacing.layout.pageX,
    paddingVertical: theme.spacing.layout.pageY,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.content.strong,
  },
  form: {
    marginTop: theme.spacing.scale.xl,
    gap: theme.spacing.component.gapLg,
  },
  field: {
    gap: theme.spacing.scale.xs,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.content.default,
  },
  input: {
    paddingVertical: theme.spacing.scale.sm,
    paddingHorizontal: theme.spacing.scale.md,
    borderWidth: theme.border.width.default,
    borderColor: theme.colors.border.default,
    borderRadius: theme.radius.scale.sm,
    fontSize: 14,
    color: theme.colors.content.default,
  },
  inputDisabled: {
    backgroundColor: theme.colors.surface.subtle,
  },
}));
