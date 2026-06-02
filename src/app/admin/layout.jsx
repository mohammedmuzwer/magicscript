import AdminShell from "@/components/admin/admin-shell";

export const metadata = { title: "Admin Console" };

export default function AdminLayout({ children }) {
  return <AdminShell>{children}</AdminShell>;
}
