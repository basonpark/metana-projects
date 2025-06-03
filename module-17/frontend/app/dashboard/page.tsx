import { DashboardShell } from "@/components/dashboard-shell";
import { ProposalList } from "@/components/proposal-list";
import { UserStats } from "@/components/user-stats";
import { GovernanceParameters } from "@/components/governance-parameters";
import { NetworkStats } from "@/components/network-stats";
import { RecentActivity } from "@/components/recent-activity";

export default function DashboardPage() {
  return (
    <DashboardShell>
      <div className="flex flex-col gap-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <UserStats />
          <GovernanceParameters />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ProposalList />
          </div>
          <div className="space-y-8">
            <NetworkStats />
            <RecentActivity />
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
