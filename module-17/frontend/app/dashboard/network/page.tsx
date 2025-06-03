import { DashboardShell } from "@/components/dashboard-shell"
import { NetworkOverview } from "@/components/network-overview"
import { NetworkNodes } from "@/components/network-nodes"
import { NetworkMetrics } from "@/components/network-metrics"

export default function NetworkPage() {
  return (
    <DashboardShell pageTitle="Network">
      <div className="flex flex-col gap-8">
        <NetworkOverview />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <NetworkNodes />
          </div>
          <div>
            <NetworkMetrics />
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
