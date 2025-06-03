import { DashboardShell } from "@/components/dashboard-shell"
import { TreasuryOverview } from "@/components/treasury-overview"
import { TreasuryAllocation } from "@/components/treasury-allocation"
import { TreasuryHistory } from "@/components/treasury-history"
import { TreasuryActions } from "@/components/treasury-actions"

export default function TreasuryPage() {
  return (
    <DashboardShell pageTitle="Treasury">
      <div className="flex flex-col gap-8">
        <TreasuryOverview />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <TreasuryAllocation />
          </div>
          <div className="space-y-8">
            <TreasuryActions />
            <TreasuryHistory />
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
