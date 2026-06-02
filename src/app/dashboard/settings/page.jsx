import ApiKeyManagementDesk from "@/components/ApiKeyManagement";

export const metadata = { title: "API Keys — Magic Script" };

export default function SettingsPage() {
  return (
    <div className="py-2">
      <ApiKeyManagementDesk />
    </div>
  );
}
