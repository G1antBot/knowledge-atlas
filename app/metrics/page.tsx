import { redirect } from "next/navigation";

export default function LegacyMetricsRedirect() {
  redirect("/projects");
}
