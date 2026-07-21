import type { Metadata } from "next";
import { CookiePolicyScreen } from "@/features/legal/screens/cookie-policy.screen";

export const metadata: Metadata = {
  title: "Cookies Policy",
  description: "Our cookies policy and how we use cookies on our website.",
};

export default function CookiePolicyPage() {
  return <CookiePolicyScreen />;
}
