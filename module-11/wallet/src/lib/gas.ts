// gas.ts - gas estimation and management
import { getCurrentNetworkRPC } from './network';

// transaction estimation interface for gas calculation
export interface TransactionEstimate {
  from: string;
  to: string;
  value: string;
  data: string;
}

/**
 * estimates gas for a transaction
 */
export async function estimateGas(tx: TransactionEstimate): Promise<string> {
  const response = await fetch(getCurrentNetworkRPC(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_estimateGas',
      params: [tx],
      id: new Date().getTime(),
    }),
  });
  
  const data = await response.json();
  
  if (data.error) {
    // if estimation fails, return a safe default
    console.error('Gas estimation failed:', data.error);
    return '0x5208'; // 21,000 gas (standard eth transfer)
  }
  
  return data.result;
}

/**
 * applies a buffer to gas estimation for safety
 */
export function applyGasBuffer(gasEstimate: string, bufferPercent: number = 10): string {
  // parse the gas estimate
  const gasValue = parseInt(gasEstimate, 16);
  
  // calculate buffered gas (add percentage)
  const bufferedGas = Math.ceil(gasValue * (1 + bufferPercent / 100));
  
  // convert back to hex
  return '0x' + bufferedGas.toString(16);
}

/**
 * formats gas price to gwei for display
 */
export function formatGasToGwei(gasHex: string): string {
  // convert hex gas price to a decimal number
  const gasWei = parseInt(gasHex, 16);
  
  // convert wei to gwei (1 gwei = 10^9 wei)
  const gasGwei = gasWei / 1e9;
  
  // format to 2 decimal places
  return gasGwei.toFixed(2);
} 