import DashboardShell from "@/components/dashboard/dashboard-shell";

export const metadata = {
  title: "Workspace",
};

export default function DashboardLayout({ children }) {
  return <DashboardShell>{children}</DashboardShell>;
}
