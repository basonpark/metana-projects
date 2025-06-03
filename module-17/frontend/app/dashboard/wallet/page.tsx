import { DashboardShell } from "@/components/dashboard-shell"
import { WalletOverview } from "@/components/wallet-overview"
import { TokenBalances } from "@/components/token-balances"
import { VotingPower } from "@/components/voting-power"
import { TransactionHistory } from "@/components/transaction-history"

export default function WalletPage() {
  return (
    <DashboardShell pageTitle="Wallet">
      <div className="flex flex-col gap-8">
        <WalletOverview />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <TokenBalances />
            <TransactionHistory />
          </div>
          <div>
            <VotingPower />
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
