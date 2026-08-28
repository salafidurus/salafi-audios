import { Host } from "@expo/ui";
import { AlertDialog, TextButton, Text } from "@expo/ui/jetpack-compose";
import { useUnistyles } from "react-native-unistyles";

/** Provides the native shared components ConfirmDialog ConfirmDialog.android module responsibility. */
/** Describes the ConfirmDialogProps native type contract and behavior. */
export type ConfirmDialogProps = {
  visible: boolean;
  onDismiss: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  destructive?: boolean;
};

/** Describes the ConfirmDialog native function contract and behavior. */
export function ConfirmDialog({
  visible,
  onDismiss,
  onConfirm,
  title,
  message,
  confirmLabel,
  cancelLabel,
  destructive = false,
}: ConfirmDialogProps) {
  const { theme } = useUnistyles();

  if (!visible) return null;

  return (
    <Host matchContents>
      <AlertDialog
        onDismissRequest={onDismiss}
        colors={{
          containerColor: theme.colors.surface.elevated,
          titleContentColor: theme.colors.content.strong,
          textContentColor: theme.colors.content.default,
        }}
      >
        <AlertDialog.Title>
          <Text color={theme.colors.content.strong}>{title}</Text>
        </AlertDialog.Title>
        <AlertDialog.Text>
          <Text color={theme.colors.content.default}>{message}</Text>
        </AlertDialog.Text>
        <AlertDialog.DismissButton>
          <TextButton onClick={onDismiss}>
            <Text color={theme.colors.content.default}>{cancelLabel}</Text>
          </TextButton>
        </AlertDialog.DismissButton>
        <AlertDialog.ConfirmButton>
          <TextButton onClick={onConfirm}>
            <Text color={destructive ? theme.colors.state.danger : theme.colors.action.primary}>
              {confirmLabel}
            </Text>
          </TextButton>
        </AlertDialog.ConfirmButton>
      </AlertDialog>
    </Host>
  );
}
