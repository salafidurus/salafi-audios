import type { ButtonHTMLAttributes } from "react";
import styles from "./button.module.css";

type ButtonVariant = "primary" | "surface" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg" | "icon";

export type ButtonDesktopWebProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

function cx(...values: Array<string | undefined | false>) {
  return values.filter(Boolean).join(" ");
}

export function ButtonDesktopWeb({
  variant = "surface",
  size = "md",
  className,
  type,
  ...props
}: ButtonDesktopWebProps) {
  return (
    <button
      type={type ?? "button"}
      className={cx(styles.button, styles[`variant-${variant}`], styles[`size-${size}`], className)}
      {...props}
    />
  );
}
