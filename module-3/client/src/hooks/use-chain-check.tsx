import { useEffect } from "react";
import { useAccount, useSwitchChain } from "wagmi";
import { sepolia } from "wagmi/chains";
import { toast } from "@/hooks/use-toast";

export const useChainCheck = () => {
  const { switchChain } = useSwitchChain();
  const { isConnected, chain } = useAccount();

  useEffect(() => {
    if (isConnected && chain?.id !== sepolia.id) {
      toast({
        title: "Wrong network",
        description: "Please switch to Sepolia",
        variant: "destructive",
      });

      switchChain({
        chainId: sepolia.id,
      });
    }
  }, [isConnected, chain, switchChain]);
};
