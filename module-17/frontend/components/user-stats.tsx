'use client';

import { useState, useEffect } from 'react';
import { Wallet } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatUnits, parseUnits, isAddress } from 'viem';
import { contracts, targetChainId } from '@/config/contracts';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from 'lucide-react';

const truncateAddress = (address: string | undefined) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export function UserStats() {
  const { address, isConnected, chainId } = useAccount();
  const [delegateAddress, setDelegateAddress] = useState('');
  const [isValidDelegateAddress, setIsValidDelegateAddress] = useState(false);

  useEffect(() => {
    setIsValidDelegateAddress(isAddress(delegateAddress));
  }, [delegateAddress]);

  const { data: balanceData, isLoading: isLoadingBalance, error: balanceError } = useReadContract({
    address: contracts.governanceToken.address,
    abi: contracts.governanceToken.abi,
    functionName: 'balanceOf',
    args: [address!],
    chainId: targetChainId,
    query: {
      enabled: isConnected && !!address,
    }
  });

  const { data: votesData, isLoading: isLoadingVotes, error: votesError } = useReadContract({
    address: contracts.governanceToken.address,
    abi: contracts.governanceToken.abi,
    functionName: 'getVotes',
    args: [address!],
    chainId: targetChainId,
    query: {
      enabled: isConnected && !!address,
    }
  });

  const { data: currentDelegate, isLoading: isLoadingDelegate, error: delegateError, refetch: refetchDelegate } = useReadContract({
    address: contracts.governanceToken.address,
    abi: contracts.governanceToken.abi,
    functionName: 'delegates',
    args: [address!],
    chainId: targetChainId,
    query: {
      enabled: isConnected && !!address,
    }
  });

  const { data: delegateHash, error: delegateWriteError, isPending: isDelegating, writeContract } = useWriteContract();

  const { isLoading: isConfirmingDelegation, isSuccess: isDelegationSuccess, error: delegationReceiptError } = useWaitForTransactionReceipt({ 
    hash: delegateHash, 
  });

  useEffect(() => {
    if (isDelegationSuccess) {
      refetchDelegate();
      setDelegateAddress(''); 
    }
  }, [isDelegationSuccess, refetchDelegate]);

  const handleDelegate = () => {
    if (!isValidDelegateAddress) return;
    writeContract({
      address: contracts.governanceToken.address,
      abi: contracts.governanceToken.abi,
      functionName: 'delegate',
      args: [delegateAddress as `0x${string}`],
      chainId: targetChainId,
    });
  };

  const isWrongNetwork = isConnected && chainId !== targetChainId;
  const isLoading = isLoadingBalance || isLoadingVotes || isLoadingDelegate;
  const hasError = balanceError || votesError || delegateError || delegateWriteError || delegationReceiptError;

  const formattedBalance = balanceData !== undefined ? formatUnits(balanceData as bigint, 18) : '0'; 
  const formattedVotes = votesData !== undefined ? formatUnits(votesData as bigint, 18) : '0';
  const isSelfDelegated = currentDelegate === address;
  const delegationStatus = currentDelegate ? (isSelfDelegated ? 'Self-delegated' : `Delegated to ${truncateAddress(currentDelegate as string)}`) : 'Not delegated';

  return (
    <Card className="overflow-hidden border-none shadow-xl bg-gradient-to-br from-card to-card/80">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-muted/20">
        <div className="space-y-1">
          <CardTitle className="font-heading text-xl">Governance Stats</CardTitle>
          <CardDescription>Your voting power and token balance</CardDescription>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <Wallet className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {!isConnected ? (
          <p className="text-center text-muted-foreground">Please connect your wallet to view your stats.</p>
        ) : isWrongNetwork ? (
           <Alert variant="destructive">
            <AlertTitle>Wrong Network</AlertTitle>
            <AlertDescription>
              Please switch to the Hardhat network (Chain ID: {targetChainId}) in your wallet.
            </AlertDescription>
          </Alert>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2 text-muted-foreground">Loading stats...</p>
          </div>
        ) : hasError ? (
           <Alert variant="destructive">
            <AlertTitle>Error Loading Data</AlertTitle>
            <AlertDescription>
              Could not load governance stats. Please try again later.
              {/* Optional: Display specific error message */} 
              {/* <pre className="mt-2 text-xs">{hasError.message}</pre> */} 
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">Connected Wallet</p>
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/20">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                  </div>
                </div>
                <p className="text-lg font-medium break-all">{truncateAddress(address)}</p>
                {/* <p className="text-xs text-muted-foreground">Connected 3 days ago</p> */}
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Token Balance</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-lg font-medium">{parseFloat(formattedBalance).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 4})} GOV</p>
                  {/* <span className="text-xs text-green-500">+125 (30d)</span> */} {/* Placeholder */} 
                </div>
                {/* <p className="text-xs text-muted-foreground">≈ $3,750 USD</p> */}{/* Placeholder */} 
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Voting Power</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-lg font-medium">{parseFloat(formattedVotes).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 4})} votes</p>
                  {/* <span className="text-xs text-muted-foreground">0.05% of total</span> */} {/* Placeholder */} 
                </div>
                {/* <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-primary" style={{ width: "0.05%" }} />
                </div> */}{/* Placeholder */} 
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Delegation Status</p>
                <p className="text-lg font-medium">{delegationStatus}</p>
                 {/* <p className="text-xs text-muted-foreground">Since Apr 15, 2023</p> */}{/* Placeholder */} 
              </div>
            </div>

            {/* Placeholder Voting History - Needs separate logic/data */}
            {/* <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Voting History</p>
              <div className="flex items-center justify-between text-xs">
                <span>Participation Rate</span>
                <span className="font-medium">78%</span>
              </div>
              <Progress value={78} className="h-1.5" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>27 votes cast</span>
                <span>35 total proposals</span>
              </div>
            </div> */}

            {/* Delegation Section */} 
            <div className="space-y-3 pt-4 border-t border-muted/20">
               <p className="text-sm font-medium text-muted-foreground">Manage Delegation</p>
               <div className="flex flex-col sm:flex-row gap-3">
                  <Input 
                    placeholder="Delegate address (e.g., 0x... or ENS name)" 
                    value={delegateAddress}
                    onChange={(e) => setDelegateAddress(e.target.value)}
                    disabled={isDelegating || isConfirmingDelegation}
                    className='flex-1'
                  />
                  <Button 
                    onClick={handleDelegate}
                    disabled={!isValidDelegateAddress || isDelegating || isConfirmingDelegation}
                    className="w-full sm:w-auto"
                  >
                    {(isDelegating || isConfirmingDelegation) ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Delegate Votes
                  </Button>
                </div>
                {/* Display transaction status */} 
                {delegateHash && (
                    <p className="text-xs text-muted-foreground">Delegation submitted (Tx: {truncateAddress(delegateHash)}). Waiting for confirmation...</p>
                )}
                {isDelegationSuccess && (
                    <p className="text-xs text-green-600">Delegation successful!</p>
                )}
                {(delegateWriteError || delegationReceiptError) && (
                  <p className="text-xs text-red-600">Delegation Error: {
                    // Explicitly get error message with fallback
                    (() => {
                      const error = delegateWriteError || delegationReceiptError;
                      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
                      const message = (error as any)?.message || 'An unknown error occurred.';
                      return message.substring(0, 100) + (message.length > 100 ? '...' : '');
                    })()
                  }</p>
                )}
            </div>
            
            {/* Claim Rewards Button - Disabled */}
            <div className="pt-4 border-t border-muted/20">
              <Button 
                className="w-full shadow-lg shadow-primary/20 bg-gradient-to-r from-primary to-primary/90" 
                disabled={true} // Disabled as no function exists in current contracts
                title="Reward claiming functionality not implemented yet"
              >
                Claim Rewards (Not Implemented)
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
