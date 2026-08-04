import { NativeScreenHost, NativeText } from "@/shared/ui";

type Props = {
  description: string;
  title: string;
};

export function PlaceholderRouteScreen({ description, title }: Props) {
  return (
    <NativeScreenHost style={{ justifyContent: "center", alignItems: "center" }}>
      <NativeText variant="titleLg" colorRole="strong">
        {title}
      </NativeText>
      <NativeText variant="bodyMd" colorRole="muted">
        {description}
      </NativeText>
    </NativeScreenHost>
  );
}
