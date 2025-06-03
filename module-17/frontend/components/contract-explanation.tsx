"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CodeBlock } from "@/components/ui/code-block";

const governanceTokenCodeSnippet = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GovernanceToken is ERC20, ERC20Permit, ERC20Votes, Ownable {
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _initialSupply,
        address _initialHolder,
        address _initialOwner
    ) 
        ERC20(_name, _symbol) 
        ERC20Permit(_name)
        Ownable(_initialOwner)
    {
        _mint(_initialHolder, _initialSupply);
    }

    // ... additional functions like mint, delegate ...

    // The functions below are overrides required by Solidity.
    function _update(address from, address to, uint256 value) internal override(ERC20, ERC20Votes) {
        super._update(from, to, value);
    }

    function nonces(address owner) public view override(ERC20Permit, Nonces) returns (uint256) {
        return super.nonces(owner);
    }
}
`;

const myGovernorCodeSnippet = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";
import "@openzeppelin/contracts/interfaces/IERC165.sol";


contract MyGovernor is
    Governor,                 // Core governance logic
    GovernorSettings,         // Configurable voting settings (delay, period, threshold)
    GovernorCountingSimple,   // Simple yes/no/abstain voting
    GovernorVotes,            // Support for ERC20Votes tokens
    GovernorVotesQuorumFraction, // Quorum based on percentage of total supply
    GovernorTimelockControl   // Integration with TimelockController
{
    constructor(
        IVotes _token,             // The Governance Token
        TimelockController _timelock, // The Timelock contract
        uint256 _votingDelay,      // Blocks after proposal until voting starts
        uint256 _votingPeriod,     // Duration of the voting period in blocks
        uint256 _proposalThreshold, // Minimum voting power to create a proposal
        uint256 _quorumPercentage  // Minimum % of total supply needed to vote for quorum
    )
        Governor("MyGovernor")
        GovernorSettings(_votingDelay, _votingPeriod, _proposalThreshold)
        GovernorVotes(_token)
        GovernorVotesQuorumFraction(_quorumPercentage)
        GovernorTimelockControl(_timelock)
    {}

    // --- Overrides for settings and timelock --- 
    // (Example: Provide implementations or rely on defaults/inherited)
    
    function supportsInterface(bytes4 interfaceId) 
        public 
        view 
        override(Governor, GovernorTimelockControl, IERC165) 
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    // ... other functions related to proposal creation, execution, etc. ...
}
`;

export function ContractExplanation() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
      <div className="container px-4 md:px-6">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Our Smart Contracts
          </h2>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mt-4">
            Understand the backbone of our DAO's governance mechanism.
          </p>
        </div>
        <Tabs
          defaultValue="governance-token"
          className="w-full max-w-5xl mx-auto"
        >
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted p-1 rounded-lg">
            <TabsTrigger
              value="governance-token"
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md py-2"
            >
              Governance Token
            </TabsTrigger>
            <TabsTrigger
              value="governor"
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md py-2"
            >
              Governor Contract
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="governance-token"
            className="p-6 border rounded-lg bg-card"
          >
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div>
                <h3 className="font-heading text-xl font-semibold mb-4">
                  What it is
                </h3>
                <p className="text-card-foreground mb-4">
                  The <code>GovernanceToken.sol</code> contract defines the
                  ERC20 token that represents voting power in the DAO. Holding
                  this token grants users the ability to participate in
                  governance.
                </p>
                <h3 className="font-heading text-xl font-semibold mb-4">
                  Key Features
                </h3>
                <ul className="list-disc list-inside text-card-foreground space-y-2">
                  <li>
                    <strong>Standard ERC20:</strong> Functions like a normal
                    cryptocurrency token (transferable, viewable balances).
                  </li>
                  <li>
                    <strong>Voting Power (ERC20Votes):</strong> Tracks
                    historical token balances, ensuring votes are cast based on
                    the power held when a proposal started.
                  </li>
                  <li>
                    <strong>Gasless Approvals (ERC20Permit):</strong> Allows
                    users to approve actions via signatures instead of on-chain
                    transactions, improving user experience.
                  </li>
                  <li>
                    <strong>Ownable:</strong> Includes an owner role (typically
                    the deployer) who might have initial minting capabilities.
                  </li>
                </ul>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>GovernanceToken.sol</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    This contract defines the ERC20 token used for voting power
                    within the DAO. Key features include:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                    <li>Standard ERC20 functionality (transfer, approve).</li>
                    <li>
                      ERC20Votes extension for delegation and vote tracking.
                    </li>
                    <li>ERC20Permit for gasless approvals.</li>
                    <li>Ownable for minting control.</li>
                  </ul>
                  <CodeBlock
                    code={governanceTokenCodeSnippet}
                    language="solidity"
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent
            value="governor"
            className="p-6 border rounded-lg bg-card"
          >
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div>
                <h3 className="font-heading text-xl font-semibold mb-4">
                  What it is
                </h3>
                <p className="text-card-foreground mb-4">
                  The <code>MyGovernor.sol</code> contract is the brain of the
                  DAO. It manages the entire governance process, from proposal
                  creation through voting to final execution.
                </p>
                <h3 className="font-heading text-xl font-semibold mb-4">
                  Key Features
                </h3>
                <ul className="list-disc list-inside text-card-foreground space-y-2">
                  <li>
                    <strong>Proposal Lifecycle:</strong> Handles the progression
                    of proposals through various stages (Pending, Active,
                    Succeeded, Defeated, Queued, Executed).
                  </li>
                  <li>
                    <strong>Configurable Rules (GovernorSettings):</strong>{" "}
                    Allows setting the voting delay (time before voting starts),
                    voting period (duration of voting), and proposal threshold
                    (minimum tokens needed to create a proposal).
                  </li>
                  <li>
                    <strong>Token Voting (GovernorVotes):</strong> Links
                    directly to the <code>GovernanceToken</code> to check voting
                    power based on historical snapshots.
                  </li>
                  <li>
                    <strong>Quorum (GovernorVotesQuorumFraction):</strong>{" "}
                    Requires a minimum percentage of the total token supply to
                    vote for a proposal to be considered valid.
                  </li>
                  <li>
                    <strong>Execution Delay (GovernorTimelockControl):</strong>{" "}
                    Integrates with a Timelock contract to add a mandatory
                    waiting period between a proposal passing and its execution,
                    providing a safety window.
                  </li>
                  <li>
                    <strong>Simple Voting (GovernorCountingSimple):</strong>{" "}
                    Implements a straightforward Yes/No/Abstain voting
                    mechanism.
                  </li>
                </ul>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>MyGovernor.sol</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    This contract manages the entire governance process. Key
                    features include:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                    <li>Proposal creation, voting, and execution flow.</li>
                    <li>
                      Configurable voting delay, period, and proposal threshold.
                    </li>
                    <li>Simple counting module (For/Against/Abstain).</li>
                    <li>
                      Quorum requirement based on a fraction of total token
                      supply.
                    </li>
                    <li>
                      Integration with a TimelockController for delayed
                      execution.
                    </li>
                  </ul>
                  <CodeBlock code={myGovernorCodeSnippet} language="solidity" />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
