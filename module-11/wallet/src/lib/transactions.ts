// transactions.ts - create, sign, and broadcast transactions
import { keccak256 } from 'js-sha3';
import { RLP } from './rlp-adapter';
import { ec as EC } from 'elliptic';
import { Wallet } from './wallet';
import { getCurrentNonce } from './nonce';
import { estimateGas } from './gas';
import { bytesToHex, hexToBytes, numberToHex } from './utils';

const ec = new EC('secp256k1');

// transaction interface defines the structure of our transaction
export interface Transaction {
  nonce: string;          // account transaction count
  gasPrice: string;       // price per gas unit in wei
  gasLimit: string;       // maximum gas allowed
  to: string;             // recipient address
  value: string;          // amount to send in wei
  data: string;           // transaction data (for contract calls)
  chainId: number;        // network chain id
}

/**
 * creates a transaction object with the given parameters
 * handles nonce retrieval and gas estimation
 */
export async function createTransaction(
  wallet: Wallet,
  to: string,
  value: string,
  data: string = '0x',
  gasPrice: string = '0x',
  gasLimit: string = '0x',
  chainId: number = 1
): Promise<Transaction> {
  // get the current nonce for the wallet address
  const nonce = await getCurrentNonce(wallet.address);
  
  // if gas price not provided, estimate it
  const finalGasPrice = gasPrice === '0x' 
    ? await getGasPrice() 
    : gasPrice;
  
  // if gas limit not provided, estimate it
  const finalGasLimit = gasLimit === '0x'
    ? await estimateGas({
        from: wallet.address,
        to,
        value,
        data,
      })
    : gasLimit;
  
  return {
    nonce: numberToHex(nonce),
    gasPrice: finalGasPrice,
    gasLimit: finalGasLimit,
    to,
    value,
    data,
    chainId,
  };
}

/**
 * signs a transaction with the wallet's private key
 * follows eip-155 for replay protection
 */
export function signTransaction(wallet: Wallet, transaction: Transaction): string {
  // prepare transaction for signing according to eip-155
  const txForSigning = [
    hexToBytes(transaction.nonce),
    hexToBytes(transaction.gasPrice),
    hexToBytes(transaction.gasLimit),
    hexToBytes(transaction.to),
    hexToBytes(transaction.value),
    hexToBytes(transaction.data),
    transaction.chainId,
    0, // v
    0  // s
  ];
  
  // encode with rlp (recursive length prefix)
  const rlpEncoded = RLP.encode(txForSigning);
  
  // hash the encoded transaction
  const txHash = keccak256(rlpEncoded);
  
  // sign the hash with the private key
  const privateKeyHex = wallet.privateKey.startsWith('0x') ? wallet.privateKey.slice(2) : wallet.privateKey;
  const keyPair = ec.keyFromPrivate(privateKeyHex);
  const signature = keyPair.sign(txHash, { canonical: true });
  
  // extract signature components
  const r = signature.r.toString(16).padStart(64, '0');
  const s = signature.s.toString(16).padStart(64, '0');
  
  // calculate v based on chain id according to eip-155
  const v = signature.recoveryParam + 35 + transaction.chainId * 2;
  
  // construct the signed transaction
  const signedTx = [
    hexToBytes(transaction.nonce),
    hexToBytes(transaction.gasPrice),
    hexToBytes(transaction.gasLimit),
    hexToBytes(transaction.to),
    hexToBytes(transaction.value),
    hexToBytes(transaction.data),
    v,
    hexToBytes('0x' + r),
    hexToBytes('0x' + s)
  ];
  
  // encode the final signed transaction
  const signedRlpEncoded = RLP.encode(signedTx);
  
  // return the hex string prefixed with 0x
  return '0x' + bytesToHex(signedRlpEncoded);
}

/**
 * sends a signed transaction to the network
 */
export async function sendTransaction(signedTx: string): Promise<string> {
  // make a direct request to the ethereum node
  const response = await fetch(getCurrentNetworkRPC(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_sendRawTransaction',
      params: [signedTx],
      id: new Date().getTime(),
    }),
  });
  
  const data = await response.json();
  
  if (data.error) {
    throw new Error(`Transaction failed: ${data.error.message}`);
  }
  
  // return the transaction hash
  return data.result;
}

/**
 * fetches the current gas price from the network
 */
async function getGasPrice(): Promise<string> {
  const response = await fetch(getCurrentNetworkRPC(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_gasPrice',
      params: [],
      id: new Date().getTime(),
    }),
  });
  
  const data = await response.json();
  return data.result;
}

/**
 * gets current network rpc endpoint
 */
function getCurrentNetworkRPC(): string {
  // this would normally come from a network.ts file
  // for now we'll use sepolia testnet
  return 'https://rpc.sepolia.org';
} 