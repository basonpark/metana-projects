import { getCurrentNetworkRPC } from "./network";

/**
 * Fetches the balance of an Ethereum address from the current network
 * input address, returns balance in hex
 */
export async function getBalance(address: string): Promise<string> {
  try {
    const rpcUrl = getCurrentNetworkRPC();
    
    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_getBalance",
        params: [address, "latest"],
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      console.error("RPC error:", data.error);
      throw new Error(data.error.message || "Failed to fetch balance");
    }

    return data.result || "0x0";
  } catch (error) {
    console.error("Failed to fetch balance:", error);
    return "0x0"; // Return 0 balance on error
  }
}

/**
 * Formats a hex string balance to a human-readable ETH value
 * @param hexBalance The balance in hex string format (e.g. 0x123)
 * @returns The balance in ETH as a string (e.g. "0.05")
 */
export function formatBalance(hexBalance: string): string {
  // Convert hex string to BigInt
  const balanceWei = BigInt(hexBalance);
  
  // Convert wei to ETH (1 ETH = 10^18 wei)
  const balanceEth = Number(balanceWei) / 1e18;
  
  // Format to 4 decimal places
  return balanceEth.toFixed(4);
} 