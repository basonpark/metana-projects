import { ProposalList } from "@/components/proposal-list"
import { DashboardShell } from "@/components/dashboard-shell"
import { ProposalFilters } from "@/components/proposal-filters"
import { ProposalStats } from "@/components/proposal-stats"

export default function ProposalsPage() {
  return (
    <DashboardShell pageTitle="Proposals">
      <div className="flex flex-col gap-8">
        <ProposalStats />
        <ProposalFilters />
        <ProposalList showFilters={false} />
      </div>
    </DashboardShell>
  )
}
