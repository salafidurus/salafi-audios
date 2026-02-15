import type { ButtonHTMLAttributes } from "react";
import styles from "./button.module.css";

type ButtonVariant = "primary" | "surface" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg" | "icon";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

function cx(...values: Array<string | undefined | false>) {
  return values.filter(Boolean).join(" ");
}

export function Button({
  variant = "surface",
  size = "md",
  className,
  type,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type ?? "button"}
      className={cx(styles.button, styles[`variant-${variant}`], styles[`size-${size}`], className)}
      {...props}
    />
  );
}
