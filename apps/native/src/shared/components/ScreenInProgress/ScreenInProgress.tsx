import { NativeText } from "@/shared/ui/native-text";

import { ScreenView } from "../ScreenView/ScreenView";

type ScreenInProgressProps = {
  title?: string;
  description?: string;
};

export function ScreenInProgress({
  title = "Coming Soon",
  description = "This feature is under development",
}: ScreenInProgressProps) {
  return (
    <ScreenView center>
      <NativeText variant="titleLg" colorRole="primary">
        {title}
      </NativeText>
      <NativeText variant="bodySm" colorRole="default">
        {description}
      </NativeText>
    </ScreenView>
  );
}
