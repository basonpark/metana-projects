
// supported networks
export const networks = {
  sepolia: {
    name: 'Sepolia Testnet',
    chainId: 11155111,
    rpc: 'https://rpc.sepolia.org',
    blockExplorer: 'https://sepolia.etherscan.io',
    symbol: 'ETH',
  }
};

// current network (default to sepolia)
let currentNetwork = 'sepolia';

/**
 * gets the rpc endpoint for the current network
 */
export function getCurrentNetworkRPC(): string {
  return networks[currentNetwork].rpc;
}

/**
 * gets the chain id for the current network
 */
export function getCurrentChainId(): number {
  return networks[currentNetwork].chainId;
}

/**
 * gets the block explorer url for the current network
 */
export function getBlockExplorer(): string {
  return networks[currentNetwork].blockExplorer;
}

/**
 * changes the current network
 */
export function setNetwork(network: string): void {
  if (!networks[network]) {
    throw new Error(`Network ${network} not supported`);
  }
  
  currentNetwork = network;
}

/**
 * gets transaction url on block explorer
 */
export function getTransactionUrl(txHash: string): string {
  return `${getBlockExplorer()}/tx/${txHash}`;
}

/**
 * gets address url on block explorer
 */
export function getAddressUrl(address: string): string {
  return `${getBlockExplorer()}/address/${address}`;
} 