import { routes } from "@sd/core-contracts";
import { permanentRedirect } from "next/navigation";

export const metadata = {
  title: "Scholars",
};

export default function ScholarsPage() {
  permanentRedirect(routes.explore.scholar);
}
