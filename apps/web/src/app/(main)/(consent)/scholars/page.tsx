import { permanentRedirect } from "next/navigation";
import { routes } from "@sd/core-contracts";

export const metadata = {
  title: "Scholars",
};

export default function ScholarsPage() {
  permanentRedirect(routes.explore.scholar);
}
