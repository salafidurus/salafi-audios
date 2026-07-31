import { Host } from "@expo/ui";
import { Alert, Button, Text } from "@expo/ui/swift-ui";

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
  return (
    <Host matchContents>
      <Alert
        title={title}
        isPresented={visible}
        onIsPresentedChange={(isPresented) => {
          if (!isPresented) onDismiss();
        }}
      >
        {/* SwiftUI requires an anchor view for the alert even though visibility
            here is fully controlled externally — this trigger is never pressed
            by the user (the real "Sign Out" row lives in the calling screen). */}
        <Alert.Trigger>
          <Button label="" onPress={() => undefined} />
        </Alert.Trigger>
        <Alert.Actions>
          <Button
            label={confirmLabel}
            role={destructive ? "destructive" : undefined}
            onPress={onConfirm}
          />
          <Button label={cancelLabel} role="cancel" onPress={onDismiss} />
        </Alert.Actions>
        <Alert.Message>
          <Text>{message}</Text>
        </Alert.Message>
      </Alert>
    </Host>
  );
}
