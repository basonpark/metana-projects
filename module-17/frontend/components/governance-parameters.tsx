import { Settings } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { InfoIcon } from "lucide-react"

export function GovernanceParameters() {
  return (
    <Card className="overflow-hidden border-none shadow-xl bg-gradient-to-br from-card to-card/80">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-muted/20">
        <div className="space-y-1">
          <CardTitle className="font-heading text-xl">Governance Parameters</CardTitle>
          <CardDescription>Current DAO configuration</CardDescription>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <Settings className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid gap-6">
          <div className="grid grid-cols-2 gap-6">
            <ParameterItem
              name="Quorum"
              value="4% of total supply"
              description="Minimum participation required for a proposal to pass"
              detail="Currently 2,500,000 GOV tokens"
            />
            <ParameterItem
              name="Proposal Threshold"
              value="0 GOV"
              description="Minimum tokens required to submit a proposal"
              detail="Any token holder can propose"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <ParameterItem
              name="Voting Delay"
              value="1 day (7,200 blocks)"
              description="Time between proposal creation and voting start"
              detail="Allows time for discussion"
            />
            <ParameterItem
              name="Voting Period"
              value="3 days (21,600 blocks)"
              description="Duration of the voting window"
              detail="Ends May 15, 2023 for active proposals"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <ParameterItem
              name="Timelock Delay"
              value="2 days (14,400 blocks)"
              description="Delay before execution after proposal passes"
              detail="Security measure for emergency response"
            />
            <ParameterItem
              name="Execution Period"
              value="7 days (50,400 blocks)"
              description="Time window to execute a passed proposal"
              detail="After timelock, before expiration"
            />
          </div>

          <div className="mt-2 rounded-lg bg-muted/50 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 mt-0.5">
                <InfoIcon className="h-3.5 w-3.5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Governance Contract</p>
                <p className="text-xs text-muted-foreground mt-1">MyGovernor: 0x8Fc3...7Fa2</p>
                <p className="text-xs text-muted-foreground">Timelock: 0x7Bc9...9Ad1</p>
                <p className="text-xs text-muted-foreground">Token: 0x9Ac2...2Fb3</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ParameterItem({
  name,
  value,
  description,
  detail,
}: {
  name: string
  value: string
  description: string
  detail: string
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <p className="text-sm font-medium text-muted-foreground">{name}</p>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <InfoIcon className="h-3.5 w-3.5 text-muted-foreground/70 cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">{description}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <p className="text-base font-medium">{value}</p>
      <p className="text-xs text-muted-foreground">{detail}</p>
    </div>
  )
}
