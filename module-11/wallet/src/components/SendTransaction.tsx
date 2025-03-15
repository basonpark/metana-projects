import { useState } from "react";
import { Wallet } from "../lib/wallet";
import {
  createTransaction,
  signTransaction,
  sendTransaction,
} from "../lib/transactions";
import { estimateGas, applyGasBuffer, formatGasToGwei } from "../lib/gas";
import { getCurrentChainId, getTransactionUrl } from "../lib/network";
import { etherToWei } from "../lib/utils";

interface SendTransactionProps {
  wallet: Wallet;
  onTransactionComplete: (tx: any) => void;
}

export default function SendTransaction({
  wallet,
  onTransactionComplete,
}: SendTransactionProps) {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [gasPrice, setGasPrice] = useState("");
  const [customGasLimit, setCustomGasLimit] = useState("");
  const [useCustomGas, setUseCustomGas] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [txDetails, setTxDetails] = useState<any>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  // steps in the transaction process for UI
  const steps = [
    "Preparing Transaction",
    "Estimating Gas",
    "Creating Raw Transaction",
    "Signing Transaction",
    "Broadcasting Transaction",
    "Transaction Complete",
  ];

  async function handleSendTransaction() {
    if (!recipient || !amount) {
      setError("Recipient address and amount are required");
      return;
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(recipient)) {
      setError("Invalid Ethereum address format");
      return;
    }

    try {
      setError("");
      setIsLoading(true);
      setCurrentStep(0);
      setTxHash(null);

      // prepare transaction data
      const valueInWei = etherToWei(amount);

      // step 1: estimate gas if not using custom
      setCurrentStep(1);
      let finalGasPrice = "0x";
      let finalGasLimit = "0x";

      if (useCustomGas) {
        if (gasPrice) {
          // convert gwei to wei and to hex
          const gasPriceWei = Math.floor(parseFloat(gasPrice) * 1e9);
          finalGasPrice = "0x" + gasPriceWei.toString(16);
        }

        if (customGasLimit) {
          finalGasLimit = "0x" + parseInt(customGasLimit).toString(16);
        }
      }

      // step 2: create the transaction
      setCurrentStep(2);
      const tx = await createTransaction(
        wallet,
        recipient,
        valueInWei,
        "0x", // no data for simple transfers
        finalGasPrice,
        finalGasLimit,
        getCurrentChainId()
      );

      // step 3: sign the transaction
      setCurrentStep(3);
      const signedTx = signTransaction(wallet, tx);

      // save tx details for UI
      setTxDetails({
        from: wallet.address,
        to: recipient,
        value: amount,
        gasPrice: formatGasToGwei(tx.gasPrice) + " Gwei",
        gasLimit: parseInt(tx.gasLimit, 16).toString(),
        nonce: parseInt(tx.nonce, 16).toString(),
        signedTx: signedTx.substring(0, 66) + "...", // truncate for display
      });

      // step 4: broadcast the transaction
      setCurrentStep(4);
      const hash = await sendTransaction(signedTx);
      setTxHash(hash);

      // step 5: transaction complete
      setCurrentStep(5);

      // notify parent component
      onTransactionComplete({
        hash,
        from: wallet.address,
        to: recipient,
        value: amount,
        timestamp: new Date().toISOString(),
      });

      // reset form
      setRecipient("");
      setAmount("");
    } catch (e: any) {
      console.error("Transaction failed", e);
      setError(e.message || "Transaction failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Send Transaction</h2>

      {isLoading ? (
        <div className="space-y-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            ></div>
          </div>

          <p className="text-center font-medium">{steps[currentStep]}</p>

          {txDetails && currentStep >= 3 && (
            <div className="mt-4 bg-gray-50 p-4 rounded-md">
              <h3 className="text-md font-medium mb-2">Transaction Details</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">From:</span> {txDetails.from}
                </div>
                <div>
                  <span className="font-medium">To:</span> {txDetails.to}
                </div>
                <div>
                  <span className="font-medium">Value:</span> {txDetails.value}{" "}
                  ETH
                </div>
                <div>
                  <span className="font-medium">Gas Price:</span>{" "}
                  {txDetails.gasPrice}
                </div>
                <div>
                  <span className="font-medium">Gas Limit:</span>{" "}
                  {txDetails.gasLimit}
                </div>
                <div>
                  <span className="font-medium">Nonce:</span> {txDetails.nonce}
                </div>
                <div>
                  <div className="font-medium">Signed Transaction:</div>
                  <div className="font-mono text-xs mt-1 break-all">
                    {txDetails.signedTx}
                  </div>
                </div>
              </div>
            </div>
          )}

          {txHash && (
            <div className="mt-4 bg-green-50 p-4 rounded-md border border-green-200">
              <h3 className="text-md font-medium text-green-800 mb-2">
                Transaction Sent!
              </h3>
              <p className="text-sm text-green-600 mb-2">
                Transaction has been successfully broadcast to the network.
              </p>
              <div className="flex items-center">
                <span className="text-sm font-medium mr-2">
                  Transaction Hash:
                </span>
                <code className="text-xs bg-green-100 px-2 py-1 rounded">
                  {txHash.substring(0, 12)}...{txHash.substring(58)}
                </code>
                <a
                  href={getTransactionUrl(txHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                  </svg>
                </a>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recipient Address
            </label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="0x..."
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount (ETH)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.01"
              step="0.001"
              min="0"
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <button
              type="button"
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              <span>{isAdvancedOpen ? "Hide" : "Show"} Advanced Options</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`ml-1 h-4 w-4 transition-transform ${
                  isAdvancedOpen ? "rotate-180" : ""
                }`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {isAdvancedOpen && (
              <div className="mt-3 bg-gray-50 p-3 rounded-md">
                <div className="mb-3">
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id="use-custom-gas"
                      checked={useCustomGas}
                      onChange={(e) => setUseCustomGas(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="use-custom-gas"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Use Custom Gas Settings
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">
                    Enable this to manually set gas price and gas limit. If
                    disabled, they will be estimated automatically.
                  </p>
                </div>

                {useCustomGas && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gas Price (Gwei)
                      </label>
                      <input
                        type="number"
                        value={gasPrice}
                        onChange={(e) => setGasPrice(e.target.value)}
                        placeholder="5"
                        step="0.1"
                        min="0"
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gas Limit
                      </label>
                      <input
                        type="number"
                        value={customGasLimit}
                        onChange={(e) => setCustomGasLimit(e.target.value)}
                        placeholder="21000"
                        step="1000"
                        min="21000"
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <button
            onClick={handleSendTransaction}
            disabled={!recipient || !amount}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send Transaction
          </button>
        </div>
      )}
    </div>
  );
}
