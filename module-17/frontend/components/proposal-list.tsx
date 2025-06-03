"use client"

import { cn, truncateAddress } from "@/lib/utils"
import { useState, useEffect, useMemo } from "react"
import { Clock, FileText, Filter, ThumbsDown, ThumbsUp, X, Check, Search, Loader2, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ProposalDialog } from "@/components/proposal-dialog"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { motion, AnimatePresence } from "framer-motion"
import { useAccount, usePublicClient, useReadContract } from "wagmi"
import { decodeEventLog, parseAbiItem, Address, Abi } from "viem"
import { contracts, targetChainId, myGovernorABI } from "@/config/contracts"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// --- Types ---

enum ProposalState {
  Pending,      // 0
  Active,       // 1
  Canceled,     // 2
  Defeated,     // 3
  Succeeded,    // 4
  Queued,       // 5
  Expired,      // 6
  Executed      // 7
}

interface FetchedProposalData {
  proposalId: bigint
  proposer: Address
  targets: readonly Address[]
  values: readonly bigint[]
  signatures: readonly string[]
  calldatas: readonly `0x${string}`[]
  voteStart: bigint
  voteEnd: bigint
  description: string
}

interface ProposalDetails {
  state: ProposalState
  votesFor: bigint
  votesAgainst: bigint
  votesAbstain: bigint
}

export interface Proposal extends FetchedProposalData, Partial<ProposalDetails> {
  title?: string
  status?: keyof typeof ProposalState | 'Unknown' | 'Error' | 'Loading'
  totalVotes?: bigint
}

// --- ABI Fragments ---

const proposalCreatedEventAbi = parseAbiItem(
  'event ProposalCreated(uint256 proposalId, address proposer, address[] targets, uint256[] values, string[] signatures, bytes[] calldatas, uint256 voteStart, uint256 voteEnd, string description)'
)

// --- Helper Components ---

// Component to fetch details for a single proposal using hooks
function ProposalDetailsFetcher({ 
  proposalId, 
  onDetailsFetched 
}: { 
  proposalId: bigint;
  onDetailsFetched: (details: ProposalDetails | null) => void;
}) {
  const { chainId, isConnected } = useAccount();
  const governorAddress = contracts.myGovernor.address;

  const { data: stateData, error: stateError, isLoading: isLoadingState } = useReadContract({
    address: governorAddress,
    abi: myGovernorABI as Abi, // Cast ABI to Abi type
    functionName: 'state',
    args: [proposalId],
    chainId: targetChainId,
    query: { enabled: isConnected && chainId === targetChainId },
  });

  const { data: votesData, error: votesError, isLoading: isLoadingVotes } = useReadContract({
    address: governorAddress,
    abi: myGovernorABI as Abi, // Cast ABI to Abi type
    functionName: 'proposalVotes',
    args: [proposalId],
    chainId: targetChainId,
    query: { enabled: isConnected && chainId === targetChainId },
  });

  useEffect(() => {
    // Only proceed if not loading and connected to the correct chain
    if (!isLoadingState && !isLoadingVotes && isConnected && chainId === targetChainId) {
        if (stateError || votesError) {
          console.error(`Error fetching details for proposal ${proposalId}:`, stateError || votesError);
          onDetailsFetched(null); // Signal error by passing null
          return;
        }

        if (stateData !== undefined && votesData !== undefined) {
            const [againstVotes, forVotes, abstainVotes] = votesData as [bigint, bigint, bigint]; // Correct order based on Governor.sol?
            // *** IMPORTANT: Verify the order of votes returned by proposalVotes function in your specific Governor contract ABI ***
            // OpenZeppelin standard (as of recent versions) is: againstVotes, forVotes, abstainVotes
            onDetailsFetched({
                state: stateData as ProposalState,
                votesFor: forVotes, // Ensure mapping is correct
                votesAgainst: againstVotes,
                votesAbstain: abstainVotes,
            });
        } else {
             // This case might occur if query is disabled or data is unexpectedly undefined
             console.warn(`Undefined state or votes data for proposal ${proposalId}`);
             onDetailsFetched(null); // Treat as error or loading state
        }
    }
    // Dependency array includes loading states and errors to re-evaluate when they change
  }, [stateData, votesData, stateError, votesError, isLoadingState, isLoadingVotes, proposalId, onDetailsFetched, isConnected, chainId]);

  // This component doesn't render anything itself
  return null;
}

// --- Main Component ---

export function ProposalList() {
  const { address, isConnected, chainId } = useAccount()
  const publicClient = usePublicClient({ chainId: targetChainId })
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [isLoadingLogs, setIsLoadingLogs] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortOrder, setSortOrder] = useState("newest")
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null)

  const governorAddress = contracts.myGovernor.address
  const isWrongNetwork = isConnected && chainId !== targetChainId

  // --- Fetch ProposalCreated Logs --- 
  useEffect(() => {
    if (!publicClient || !isConnected || isWrongNetwork) {
       if (isConnected && !isWrongNetwork && !publicClient) {
         // Public client might still be initializing
         setIsLoadingLogs(true); 
       } else {
         setIsLoadingLogs(false);
       }
       setProposals([]); // Clear proposals if not connected/wrong network or no client
       setError(null); // Clear errors
       return;
    }

    let isMounted = true;
    setIsLoadingLogs(true);
    setError(null);
    setProposals([]); // Clear previous proposals before fetching new ones

    const fetchLogs = async () => {
      try {
        console.log('Fetching logs for ProposalCreated...');
        const logs = await publicClient.getLogs({
          address: governorAddress,
          event: proposalCreatedEventAbi,
          fromBlock: 0n, // Fetch from the beginning (adjust if contract deployed later)
          toBlock: 'latest',
        });
        console.log(`Fetched ${logs.length} logs.`);

        if (!isMounted) return;

        const fetchedProposalsData: FetchedProposalData[] = logs.map((log) => {
           const decodedArgs = decodeEventLog({ 
             abi: [proposalCreatedEventAbi], // Pass ABI as an array
             data: log.data,
             topics: log.topics 
            });
           // Type assertion needed because decodeEventLog returns a generic structure
           const args = decodedArgs.args as unknown as FetchedProposalData; // Directly cast
            return { ...args, title: args.description }; // Use description as title for now
        });
        
        // Initialize proposals with fetched data and 'Loading' status for details
        // Sort by proposalId descending (newest first) initially
        const initialProposals = fetchedProposalsData
            .map(p => ({ ...p, status: 'Loading' } as Proposal))
            .sort((a, b) => Number(b.proposalId - a.proposalId));
            
        setProposals(initialProposals);
        console.log('Initial proposals set:', initialProposals);
        
      } catch (err: any) {
        console.error('Error fetching proposal logs:', err);
        if (isMounted) {
          setError(err.shortMessage || err.message || 'Failed to fetch proposal logs.');
          setProposals([]); // Clear proposals on error
        }
      } finally {
        if (isMounted) {
          setIsLoadingLogs(false);
        }
      }
    };

    fetchLogs();

    return () => {
      isMounted = false;
      console.log('ProposalList logs effect cleanup.');
    };
  // Rerun effect if connection status, network, or public client changes
  }, [publicClient, governorAddress, isConnected, isWrongNetwork, chainId]);

  // --- Callback to update proposal details when fetched by ProposalDetailsFetcher ---
  const handleDetailsFetched = (proposalId: bigint, details: ProposalDetails | null) => {
      setProposals(prevProposals => 
          prevProposals.map(p => {
              if (p.proposalId === proposalId) {
                  if (details) {
                    const totalVotes = details.votesFor + details.votesAgainst + details.votesAbstain;
                    const status = ProposalState[details.state] as keyof typeof ProposalState || 'Unknown'; // Map state enum to string status
                    console.log(`Details fetched for ${proposalId}: State=${status}, Votes=${totalVotes}`);
                    return { ...p, ...details, totalVotes, status };
                  } else {
                    // Handle error case for this specific proposal
                    console.error(`Failed to fetch details for proposal ${proposalId}. Setting status to Error.`);
                    return { ...p, status: 'Error' }; // Indicate error fetching details
                  }
              }
              return p;
          })
      );
  };

  // Filtering/Sorting logic will go here

  // Determine overall loading state (logs + details)
  const isLoading = isLoadingLogs || proposals.some(p => p.status === 'Loading')

  // --- Render Logic ---

  return (
    <Card className="lg:col-span-2 shadow-lg border-none bg-gradient-to-br from-card to-card/90">
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-4">
        {/* Display Content Based on State */}
        {!isConnected ? (
          <p className="text-center py-8 text-muted-foreground">Connect your wallet to view proposals.</p>
        ) : isWrongNetwork ? (
          <Alert variant="destructive" className="my-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Wrong Network</AlertTitle>
            <AlertDescription>Please switch to the correct network to view proposals.</AlertDescription>
          </Alert>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-3 text-muted-foreground">Loading proposals...</p>
          </div>
        ) : error ? (
          <Alert variant="destructive" className="my-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : proposals.length === 0 ? (
          <p className="text-center py-16 text-muted-foreground">No proposals found matching your criteria.</p>
        ) : (
          <motion.div layout className="space-y-4">
            <AnimatePresence>
              {proposals.map((proposal) => (
                <ProposalCard
                  key={proposal.proposalId.toString()}
                  proposal={proposal}
                  onSelect={() => setSelectedProposal(proposal)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        <div className="mb-4 flex flex-col md:flex-row md:items-center gap-4">
          {/* Search and Filter UI (Keep as is for now) */}
          <div className="flex-1 relative">
            <Input
              type="search"
              placeholder="Search proposals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 -mt-2.5 h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        {/* --- Render Fetcher components (don't render UI) --- */} 
        {proposals.map(p => (
            // Only render fetcher if status is 'Loading'
            p.status === 'Loading' && (
                <ProposalDetailsFetcher 
                    key={p.proposalId.toString()} 
                    proposalId={p.proposalId} 
                    onDetailsFetched={(details) => handleDetailsFetched(p.proposalId, details)} 
                />
            )
        ))}

        {/* Display Content Based on State (Update this section later) */} 
        {!isConnected ? (
          <p className="text-center py-8 text-muted-foreground">Connect your wallet to view proposals.</p>
        ) : isWrongNetwork ? (
          <Alert variant="destructive" className="my-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Wrong Network</AlertTitle>
            <AlertDescription>Please switch to the correct network to view proposals.</AlertDescription>
          </Alert>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-3 text-muted-foreground">Loading proposals...</p>
          </div>
        ) : error ? (
          <Alert variant="destructive" className="my-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : proposals.length === 0 && !isLoading ? ( // Added !isLoading check
          <p className="text-center py-16 text-muted-foreground">No proposals found matching your criteria.</p>
        ) : (
          <motion.div layout className="space-y-4">
            <AnimatePresence>
              {proposals.map((proposal) => (
                <ProposalCard
                  key={proposal.proposalId.toString()}
                  proposal={proposal}
                  onSelect={() => setSelectedProposal(proposal)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}

// --- Proposal Card Component ---

function ProposalCard({ proposal, onSelect }: { proposal: Proposal; onSelect: () => void }) {
  // Calculate percentages safely (handle potential division by zero if totalVotes is 0)
  const totalVotesNum = proposal.totalVotes ? Number(proposal.totalVotes) : 0
  const votesForNum = proposal.votesFor ? Number(proposal.votesFor) : 0
  const votesAgainstNum = proposal.votesAgainst ? Number(proposal.votesAgainst) : 0
  const votesAbstainNum = proposal.votesAbstain ? Number(proposal.votesAbstain) : 0

  const percFor = totalVotesNum > 0 ? (votesForNum / totalVotesNum) * 100 : 0;
  const percAgainst = totalVotesNum > 0 ? (votesAgainstNum / totalVotesNum) * 100 : 0;
  const percAbstain = totalVotesNum > 0 ? (votesAbstainNum / totalVotesNum) * 100 : 0;

  // Determine badge variant based on status
  const getStatusBadgeVariant = (status: Proposal['status']): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'Active': return 'default';      // Use default for Active
      case 'Succeeded': return 'default';   // Use default for Succeeded
      case 'Executed': return 'default';     // Use default for Executed
      case 'Pending': return 'secondary';   // Use secondary for Pending
      case 'Queued': return 'secondary';     // Use secondary for Queued
      case 'Loading': return 'secondary';   // Use secondary for Loading
      case 'Defeated': return 'destructive';
      case 'Canceled': return 'destructive';
      case 'Expired': return 'destructive';   // Use destructive for Expired
      case 'Error': return 'destructive'; 
      default: return 'outline';        // Use outline for Unknown/default
    }
  }

  return (
    <motion.div
      layout // Added layout prop
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "proposal-card border rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow",
        !['Active', 'Pending', 'Loading', 'Unknown'].includes(proposal.status || 'Unknown') && "opacity-70" // Dim non-active/pending
      )}
      onClick={onSelect}
      role="button" // Add role for accessibility
      tabIndex={0} // Make it focusable
      onKeyDown={(e) => e.key === 'Enter' && onSelect()} // Allow selection with Enter key
    >
      <div className="p-4 bg-card/50">
        <div className="flex justify-between items-start mb-2 gap-2">
          <h3 className="font-semibold flex-1 pr-2">{proposal.title || proposal.description || `Proposal #${proposal.proposalId.toString()}`}</h3> {/* Use title/description */}
          <Badge variant={getStatusBadgeVariant(proposal.status)} className="capitalize shrink-0">
            {/* Display status text consistently */} 
            {proposal.status === 'Loading' ? 'Loading...' : 
             proposal.status === 'Error' ? 'Error' : 
             proposal.status}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
          {/* Ensure proposer exists before truncating */}
          ID: {proposal.proposalId.toString()} {proposal.proposer ? `• Proposed by ${truncateAddress(proposal.proposer)}` : ''}
        </p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          {proposal.status === 'Active' || proposal.status === 'Pending' ? (
            <span>Status: {proposal.status || 'Loading...'}</span>
          ) : (
            <span>{proposal.status || 'Loading...'}</span>
          )}
          {/* Display Votes - Conditionally show if details are loaded */} 
          {proposal.status !== 'Unknown' && proposal.status !== 'Error' && proposal.status !== 'Loading' && proposal.totalVotes !== undefined && ( 
              <span className="text-muted-foreground">{totalVotesNum.toLocaleString()} total votes</span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
