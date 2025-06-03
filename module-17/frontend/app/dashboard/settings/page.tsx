import { DashboardShell } from "@/components/dashboard-shell"
import { SettingsGeneral } from "@/components/settings-general"
import { SettingsNotifications } from "@/components/settings-notifications"
import { SettingsSecurity } from "@/components/settings-security"

export default function SettingsPage() {
  return (
    <DashboardShell pageTitle="Settings">
      <div className="flex flex-col gap-8">
        <SettingsGeneral />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <SettingsNotifications />
          <SettingsSecurity />
        </div>
      </div>
    </DashboardShell>
  )
}
