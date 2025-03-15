// nonce.ts - handles transaction nonce management
import { getCurrentNetworkRPC } from './network';

// in-memory nonce cache for optimistic nonce management
const nonceCache: Record<string, number> = {};

/**
 * gets the current nonce for an address
 */
export async function getCurrentNonce(address: string): Promise<number> {
  // first check if we have a pending nonce in our cache
  if (nonceCache[address] !== undefined) {
    return nonceCache[address];
  }
  
  // otherwise fetch from the network
  const nonce = await fetchNonceFromNetwork(address);
  
  // cache the nonce
  nonceCache[address] = nonce;
  
  return nonce;
}

/**
 * increments the nonce for an address (used after sending a transaction)
 */
export function incrementNonce(address: string): void {
  // if we don't have a cached nonce, this is a no-op
  if (nonceCache[address] === undefined) return;
  
  // increment the cached nonce
  nonceCache[address]++;
}

/**
 * resets the nonce cache for an address (useful if a transaction fails)
 */
export function resetNonceCache(address: string): void {
  delete nonceCache[address];
}

/**
 * fetches the current nonce from the network
 */
async function fetchNonceFromNetwork(address: string): Promise<number> {
  const response = await fetch(getCurrentNetworkRPC(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_getTransactionCount',
      params: [address, 'pending'],
      id: new Date().getTime(),
    }),
  });
  
  const data = await response.json();
  
  // convert hex nonce to number
  return parseInt(data.result, 16);
} 