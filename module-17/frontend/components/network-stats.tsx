import { Activity, BarChart } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export function NetworkStats() {
  return (
    <Card className="overflow-hidden border-none shadow-xl bg-gradient-to-br from-card to-card/80">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-muted/20">
        <div className="space-y-1">
          <CardTitle className="font-heading text-xl">Network Stats</CardTitle>
          <CardDescription>Current blockchain metrics</CardDescription>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <BarChart className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Gas Price</span>
              <span className="text-sm font-medium">25 Gwei</span>
            </div>
            <div className="flex items-center gap-2">
              <Progress value={25} max={100} className="h-1.5" />
              <span className="text-xs text-muted-foreground">Low</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Block Height</span>
              <span className="text-sm font-medium">16,842,753</span>
            </div>
            <p className="text-xs text-muted-foreground">Last block: 12 seconds ago</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-sm font-medium text-muted-foreground">GOV Price</span>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-medium">$3.24</span>
                <span className="text-xs text-green-500">+2.4%</span>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-sm font-medium text-muted-foreground">Market Cap</span>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-medium">$162M</span>
                <span className="text-xs text-green-500">+1.8%</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-muted/50 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Recent Transactions</span>
            </div>
            <div className="space-y-2">
              {[
                { type: "Vote", time: "2m ago", hash: "0x71C...1F3d" },
                { type: "Delegate", time: "15m ago", hash: "0x8Fc...3Fa2" },
                { type: "Transfer", time: "1h ago", hash: "0x7Bc...9Ad1" },
              ].map((tx, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Activity className="h-3 w-3 text-primary" />
                    <span>{tx.type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{tx.time}</span>
                    <span className="font-mono">{tx.hash}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
