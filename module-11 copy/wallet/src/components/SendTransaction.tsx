import React, { useState, useEffect } from "react";
import { Wallet } from "../lib/wallet";
import {
  createTransaction,
  signTransaction,
  sendTransaction,
} from "../lib/transactions";
import { estimateGas, applyGasBuffer, formatGasToGwei } from "../lib/gas";
import { getCurrentChainId, getTransactionUrl } from "../lib/network";
import { etherToWei, shortenAddress } from "../lib/utils";

// Icons
const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);
const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);
const SendIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
);
const CheckCircleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

// Loading spinner component
const LoadingSpinner = () => <div className="loading-spinner"></div>;

interface SendTransactionProps {
  wallet: Wallet;
  balance: string;
  onClose: () => void;
  onSuccess: () => void;
}

const SendTransaction: React.FC<SendTransactionProps> = ({
  wallet,
  balance,
  onClose,
  onSuccess,
}) => {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [gasOption, setGasOption] = useState(2); // 1=slow, 2=average, 3=fast
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [estimatedFee, setEstimatedFee] = useState("0.0");
  const [isSending, setIsSending] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [addressError, setAddressError] = useState("");
  const [amountError, setAmountError] = useState("");
  const [addressValid, setAddressValid] = useState(false);

  // Gas price options (these would be fetched from the network in a real app)
  const gasPrices = {
    slow: "0x5D21DBA00", // 25 Gwei
    average: "0x6FC23AC00", // 30 Gwei
    fast: "0x9502F9000", // 40 Gwei
  };

  useEffect(() => {
    validateAddress();
    validateAmount();
    estimateTransactionFee();
  }, [recipient, amount, gasOption]);

  const validateAddress = () => {
    if (!recipient) {
      setAddressError("");
      setAddressValid(false);
      return;
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(recipient)) {
      setAddressError("Invalid Ethereum address");
      setAddressValid(false);
    } else {
      setAddressError("");
      setAddressValid(true);
    }
  };

  const validateAmount = () => {
    if (!amount) {
      setAmountError("");
      return;
    }

    const amountValue = parseFloat(amount);
    const balanceEth = parseInt(balance, 16) / 1e18;

    if (isNaN(amountValue) || amountValue <= 0) {
      setAmountError("Amount must be greater than 0");
    } else if (amountValue > balanceEth) {
      setAmountError("Insufficient balance");
    } else {
      setAmountError("");
    }
  };

  const estimateTransactionFee = async () => {
    if (!addressValid || !amount) return;

    try {
      // Simplified gas estimation
      const gasLimit = "0x5208"; // 21,000 gas (standard ETH transfer)
      const gasPrice = getSelectedGasPrice();

      // Calculate fee = gasLimit * gasPrice
      const fee = (parseInt(gasLimit, 16) * parseInt(gasPrice, 16)) / 1e18;
      setEstimatedFee(fee.toFixed(6));
    } catch (error) {
      console.error("Error estimating fee:", error);
    }
  };

  const getSelectedGasPrice = () => {
    switch (gasOption) {
      case 1:
        return gasPrices.slow;
      case 3:
        return gasPrices.fast;
      default:
        return gasPrices.average;
    }
  };

  const handleMaxAmount = () => {
    // Set max amount (subtracting estimated fee)
    const balanceEth = parseInt(balance, 16) / 1e18;
    const maxAmount = Math.max(
      balanceEth - parseFloat(estimatedFee),
      0
    ).toFixed(4);
    setAmount(maxAmount);
  };

  const toggleAdvanced = () => {
    setShowAdvanced(!showAdvanced);
  };

  const isFormValid = () => {
    return addressValid && amount && !amountError;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) return;

    setIsSending(true);
    try {
      // Create and send transaction
      const tx = await createTransaction(
        wallet,
        recipient,
        etherToWei(amount),
        "0x", // data
        getSelectedGasPrice(), // gas price
        "0x5208", // gas limit
        getCurrentChainId()
      );

      const signedTx = signTransaction(wallet, tx);
      const hash = await sendTransaction(signedTx);

      setTxHash(hash);
      onSuccess();
    } catch (error) {
      console.error("Transaction failed:", error);
      // You could show an error message here
    } finally {
      setIsSending(false);
    }
  };

  const shortenTxHash = (hash: string) => {
    return hash.substring(0, 10) + "..." + hash.substring(hash.length - 8);
  };

  return (
    <div className="send-container glass-effect">
      <div className="send-header flex items-center justify-between">
        <h2>Send Transaction</h2>
        <button className="icon-button" onClick={onClose}>
          <CloseIcon />
        </button>
      </div>

      {!txHash ? (
        <form onSubmit={handleSubmit} className="send-form">
          <div className="input-group">
            <label htmlFor="recipient">Recipient Address</label>
            <div className="input-with-icon flex items-center relative">
              <input
                id="recipient"
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="0x..."
                className={addressError ? "error" : ""}
              />
              {addressValid && (
                <div className="valid-icon absolute right-3">
                  <CheckIcon />
                </div>
              )}
            </div>
            {addressError && (
              <div className="error-message">{addressError}</div>
            )}
          </div>

          <div className="input-group">
            <label htmlFor="amount">Amount (ETH)</label>
            <div className="amount-input-container flex">
              <input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                step="0.001"
                min="0"
                className={amountError ? "error" : ""}
              />
              <button
                type="button"
                className="max-button secondary-button"
                onClick={handleMaxAmount}
              >
                MAX
              </button>
            </div>
            {amountError && <div className="error-message">{amountError}</div>}
            <div className="balance-display text-sm mt-1">
              Balance: {(parseInt(balance, 16) / 1e18).toFixed(4)} ETH
            </div>
          </div>

          <div className="gas-settings-container glass-effect">
            <div className="gas-header flex items-center justify-between">
              <span>Gas Settings</span>
              <button
                type="button"
                className="toggle-button secondary-button"
                onClick={toggleAdvanced}
              >
                {showAdvanced ? "Basic" : "Advanced"}
              </button>
            </div>

            {!showAdvanced ? (
              <div className="gas-slider-container mt-4">
                <div className="gas-labels flex justify-between mb-2">
                  <span>Slow</span>
                  <span>Average</span>
                  <span>Fast</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="3"
                  value={gasOption}
                  onChange={(e) => setGasOption(parseInt(e.target.value))}
                  className="gas-slider w-full"
                />
                <div className="gas-estimate mt-2">
                  Estimated Fee: {estimatedFee} ETH
                </div>
              </div>
            ) : (
              <div className="advanced-gas-container mt-4">
                <div className="input-group">
                  <label htmlFor="gasPrice">Gas Price (Gwei)</label>
                  <input
                    id="gasPrice"
                    type="number"
                    value={(parseInt(getSelectedGasPrice(), 16) / 1e9).toFixed(
                      1
                    )}
                    readOnly
                    disabled
                  />
                </div>
                <div className="input-group mb-0">
                  <label htmlFor="gasLimit">Gas Limit</label>
                  <input
                    id="gasLimit"
                    type="number"
                    value="21000"
                    readOnly
                    disabled
                  />
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="send-button primary-button w-full mt-4"
            disabled={isSending || !isFormValid()}
          >
            {isSending ? (
              <>
                <LoadingSpinner />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <SendIcon />
                <span>Send Transaction</span>
              </>
            )}
          </button>
        </form>
      ) : (
        <div className="success-container flex flex-col items-center justify-center py-6">
          <div className="success-icon text-success-color mb-4">
            <CheckCircleIcon />
          </div>
          <h3>Transaction Sent!</h3>
          <div className="tx-hash flex flex-col items-center mt-4">
            <span className="mb-2">{shortenTxHash(txHash)}</span>
            <button
              className="view-tx-button secondary-button"
              onClick={() => window.open(getTransactionUrl(txHash))}
            >
              View on Explorer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SendTransaction;
