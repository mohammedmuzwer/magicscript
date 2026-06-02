import { redirect } from "next/navigation";

// Workspace concept is hidden for now — land directly on the Generation Studio.
export default function DashboardHome() {
  redirect("/dashboard/generate");
}
