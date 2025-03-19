import React, { useState } from "react";
import { createWallet, importWallet, Wallet } from "../lib/wallet";

// Icons
const WarningIcon = () => (
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
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

const CheckIcon = () => (
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
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const LockIcon = () => (
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
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

const EthereumLogo = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="84"
    height="84"
    viewBox="0 0 64 64"
    fill="none"
    className="drop-shadow-lg"
  >
    <path d="M32 8L19 32L32 24V8Z" fill="#8A92B2" fillOpacity="0.6"></path>
    <path d="M32 8L45 32L32 24V8Z" fill="#62688F" fillOpacity="0.6"></path>
    <path d="M32 40L19 32L32 24V40Z" fill="#62688F"></path>
    <path d="M32 40L45 32L32 24V40Z" fill="#454A75"></path>
    <path d="M32 44L19 36L32 56V44Z" fill="#8A92B2"></path>
    <path d="M32 44L45 36L32 56V44Z" fill="#62688F"></path>
  </svg>
);

const ImportIcon = () => (
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
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="12" y1="18" x2="12" y2="12"></line>
    <line x1="9" y1="15" x2="15" y2="15"></line>
  </svg>
);

const EyeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const EyeOffIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
    <line x1="1" y1="1" x2="23" y2="23"></line>
  </svg>
);

interface OnboardingProps {
  onComplete: (wallet: Wallet) => void;
}

enum OnboardingStep {
  WELCOME,
  CREATE_OR_IMPORT,
  BACKUP_SEED,
  VERIFY_SEED,
  IMPORT_WALLET,
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState<OnboardingStep>(OnboardingStep.WELCOME);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [seedWordsToVerify, setSeedWordsToVerify] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [showSeed, setShowSeed] = useState(false);
  const [privateKey, setPrivateKey] = useState("");
  const [showKey, setShowKey] = useState(false);

  // Handle wallet creation
  const handleCreateWallet = () => {
    try {
      const newWallet = createWallet();
      setWallet(newWallet);
      setStep(OnboardingStep.BACKUP_SEED);
    } catch (err) {
      setError("Failed to create wallet. Please try again.");
      console.error(err);
    }
  };

  // Set up verification
  const prepareVerification = () => {
    if (!wallet?.mnemonic) return;

    // Get the seed phrase words
    const words = wallet.mnemonic.split(" ");

    // Choose 3 random words to verify
    const indicesToVerify: number[] = [];
    while (indicesToVerify.length < 3) {
      const randomIndex = Math.floor(Math.random() * words.length);
      if (!indicesToVerify.includes(randomIndex)) {
        indicesToVerify.push(randomIndex);
      }
    }

    // Sort indices in ascending order
    indicesToVerify.sort((a, b) => a - b);

    // Get the words at these indices
    const wordsToVerify = indicesToVerify.map((index) => ({
      index,
      word: words[index],
    }));

    // Store these words for verification
    setSeedWordsToVerify(wordsToVerify.map((item) => item.word));
    setStep(OnboardingStep.VERIFY_SEED);
  };

  // Handle seed verification
  const verifySeed = () => {
    // Compare selected words with words to verify
    const isCorrect = seedWordsToVerify.every(
      (word, index) => selectedWords[index] === word
    );

    if (isCorrect) {
      onComplete(wallet!);
    } else {
      setError("The words do not match. Please try again.");
      setSelectedWords([]);
    }
  };

  // Handle word selection for verification
  const handleWordSelect = (word: string) => {
    if (selectedWords.includes(word)) {
      // Remove if already selected
      setSelectedWords(selectedWords.filter((w) => w !== word));
    } else if (selectedWords.length < seedWordsToVerify.length) {
      // Add if not at max yet
      setSelectedWords([...selectedWords, word]);
    }
  };

  // Handle wallet import
  const handleImportWallet = () => {
    if (!privateKey) {
      setError("Please enter a private key");
      return;
    }

    try {
      const importedWallet = importWallet(privateKey);
      onComplete(importedWallet);
    } catch (err) {
      setError("Invalid private key. Please check and try again.");
      console.error(err);
    }
  };

  return (
    <div className="onboarding-container flex flex-col items-center justify-center min-h-screen p-6">
      <div className="logo-container flex flex-col items-center mb-20 fade-in">
        <div className="logo-animation mb-10">
          <EthereumLogo />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Ethereum Wallet
        </h1>
        <p className="text-gray-400 mt-6 text-lg tracking-wide">
          Secure • Simple • Powerful
        </p>
      </div>

      <div
        className="onboarding-card glass-effect glass-effect-enhanced w-full max-w-lg p-10 rounded-xl fade-in"
        style={{ animationDelay: "0.3s" }}
      >
        {/* Welcome Step */}
        {step === OnboardingStep.WELCOME && (
          <div className="stagger-fade-in">
            <h2 className="text-3xl font-bold text-center mb-14">Welcome!</h2>
            <p className="text-center mb-20 text-gray-300 text-lg leading-relaxed">
              Your journey to secure and easy cryptocurrency management starts
              here. Get ready to experience the future of finance.
            </p>
            <div className="flex justify-center mt-14">
              <button
                className="primary-button py-3 px-10 rounded-lg text-center font-medium pulse-animation"
                onClick={() => setStep(OnboardingStep.CREATE_OR_IMPORT)}
              >
                Get Started
              </button>
            </div>
          </div>
        )}

        {/* Create or Import Step */}
        {step === OnboardingStep.CREATE_OR_IMPORT && (
          <div className="stagger-fade-in">
            <h2 className="text-3xl font-bold text-center mb-16">
              Get Started
            </h2>

            <div className="option-buttons flex flex-col gap-8">
              <button
                className="option-button primary-button flex items-center p-5 mb-10 rounded-lg hover:scale-105 transition-transform glow-effect"
                onClick={handleCreateWallet}
              >
                <LockIcon />
                <div className="option-text ml-4 text-left">
                  <span className="option-title block font-bold text-lg">
                    Create New Wallet
                  </span>
                  <span className="option-description block text-sm opacity-80 mt-1">
                    Generate a new wallet with a secure seed phrase
                  </span>
                </div>
              </button>

              <button
                className="option-button secondary-button flex items-center p-5 rounded-lg hover:scale-105 transition-transform"
                onClick={() => setStep(OnboardingStep.IMPORT_WALLET)}
              >
                <ImportIcon />
                <div className="option-text ml-4 text-left">
                  <span className="option-title block font-bold text-lg">
                    Import Existing Wallet
                  </span>
                  <span className="option-description block text-sm opacity-80 mt-1">
                    Use your private key to access your wallet
                  </span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Backup Seed Step */}
        {step === OnboardingStep.BACKUP_SEED && wallet?.mnemonic && (
          <div className="fade-in">
            <div className="flex items-center justify-center gap-3 mb-10 text-amber-400">
              <WarningIcon />
              <h2 className="text-2xl font-bold">Important: Backup Required</h2>
            </div>

            <div className="bg-amber-400 bg-opacity-10 border border-amber-400 rounded-lg p-6 mb-12">
              <p className="text-amber-300 mb-4 font-medium">
                <strong>Write down these 12 words and keep them safe!</strong>
              </p>
              <p className="text-gray-400 text-sm leading-relaxed">
                This is your wallet&apos;s recovery phrase. Anyone with these
                words can access your funds. Do not share or store them
                digitally.
              </p>
            </div>

            <div className="seed-container relative bg-transparent p-8 rounded-lg mb-12">
              <div
                className={`seed-words ${
                  !showSeed ? "filter blur-sm" : "stagger-fade-in"
                }`}
              >
                <div className="flex flex-col space-y-6">
                  {/* Row 1 */}
                  <div className="flex space-x-5">
                    <div className="seed-word-container border border-gray-600 bg-gray-800 rounded-2xl p-3 text-center flex-1">
                      <div className="flex flex-col items-center">
                        <span className="text-gray-400 font-medium mb-1">
                          01.
                        </span>
                        <span className="font-medium text-white text-lg">
                          {wallet.mnemonic.split(" ")[0]}
                        </span>
                      </div>
                    </div>
                    <div className="seed-word-container border border-gray-600 bg-gray-800 rounded-2xl p-3 text-center flex-1">
                      <div className="flex flex-col items-center">
                        <span className="text-gray-400 font-medium mb-1">
                          05.
                        </span>
                        <span className="font-medium text-white text-lg">
                          {wallet.mnemonic.split(" ")[4]}
                        </span>
                      </div>
                    </div>
                    <div className="seed-word-container border border-gray-600 bg-gray-800 rounded-2xl p-3 text-center flex-1">
                      <div className="flex flex-col items-center">
                        <span className="text-gray-400 font-medium mb-1">
                          09.
                        </span>
                        <span className="font-medium text-white text-lg">
                          {wallet.mnemonic.split(" ")[8]}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Row 2 */}
                  <div className="flex space-x-5">
                    <div className="seed-word-container border border-gray-600 bg-gray-800 rounded-2xl p-3 text-center flex-1">
                      <div className="flex flex-col items-center">
                        <span className="text-gray-400 font-medium mb-1">
                          02.
                        </span>
                        <span className="font-medium text-white text-lg">
                          {wallet.mnemonic.split(" ")[1]}
                        </span>
                      </div>
                    </div>
                    <div className="seed-word-container border border-gray-600 bg-gray-800 rounded-2xl p-3 text-center flex-1">
                      <div className="flex flex-col items-center">
                        <span className="text-gray-400 font-medium mb-1">
                          06.
                        </span>
                        <span className="font-medium text-white text-lg">
                          {wallet.mnemonic.split(" ")[5]}
                        </span>
                      </div>
                    </div>
                    <div className="seed-word-container border border-gray-600 bg-gray-800 rounded-2xl p-3 text-center flex-1">
                      <div className="flex flex-col items-center">
                        <span className="text-gray-400 font-medium mb-1">
                          10.
                        </span>
                        <span className="font-medium text-white text-lg">
                          {wallet.mnemonic.split(" ")[9]}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Row 3 */}
                  <div className="flex space-x-5">
                    <div className="seed-word-container border border-gray-600 bg-gray-800 rounded-2xl p-3 text-center flex-1">
                      <div className="flex flex-col items-center">
                        <span className="text-gray-400 font-medium mb-1">
                          03.
                        </span>
                        <span className="font-medium text-white text-lg">
                          {wallet.mnemonic.split(" ")[2]}
                        </span>
                      </div>
                    </div>
                    <div className="seed-word-container border border-gray-600 bg-gray-800 rounded-2xl p-3 text-center flex-1">
                      <div className="flex flex-col items-center">
                        <span className="text-gray-400 font-medium mb-1">
                          07.
                        </span>
                        <span className="font-medium text-white text-lg">
                          {wallet.mnemonic.split(" ")[6]}
                        </span>
                      </div>
                    </div>
                    <div className="seed-word-container border border-gray-600 bg-gray-800 rounded-2xl p-3 text-center flex-1">
                      <div className="flex flex-col items-center">
                        <span className="text-gray-400 font-medium mb-1">
                          11.
                        </span>
                        <span className="font-medium text-white text-lg">
                          {wallet.mnemonic.split(" ")[10]}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Row 4 */}
                  <div className="flex space-x-5">
                    <div className="seed-word-container border border-gray-600 bg-gray-800 rounded-2xl p-3 text-center flex-1">
                      <div className="flex flex-col items-center">
                        <span className="text-gray-400 font-medium mb-1">
                          04.
                        </span>
                        <span className="font-medium text-white text-lg">
                          {wallet.mnemonic.split(" ")[3]}
                        </span>
                      </div>
                    </div>
                    <div className="seed-word-container border border-gray-600 bg-gray-800 rounded-2xl p-3 text-center flex-1">
                      <div className="flex flex-col items-center">
                        <span className="text-gray-400 font-medium mb-1">
                          08.
                        </span>
                        <span className="font-medium text-white text-lg">
                          {wallet.mnemonic.split(" ")[7]}
                        </span>
                      </div>
                    </div>
                    <div className="seed-word-container border border-gray-600 bg-gray-800 rounded-2xl p-3 text-center flex-1">
                      <div className="flex flex-col items-center">
                        <span className="text-gray-400 font-medium mb-1">
                          12.
                        </span>
                        <span className="font-medium text-white text-lg">
                          {wallet.mnemonic.split(" ")[11]}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {!showSeed && (
                <div className="absolute inset-0 flex items-center justify-center flex-col bg-gray-800 bg-opacity-90 rounded-lg">
                  <button
                    className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 py-3 px-6 rounded-lg transition-colors"
                    onClick={() => setShowSeed(true)}
                  >
                    <EyeIcon /> Show Recovery Phrase
                  </button>
                  <p className="text-gray-400 text-sm mt-6">
                    Make sure no one is watching
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-6">
              <label className="flex items-center gap-4 cursor-pointer bg-gray-800 p-4 rounded-lg">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5"
                  required
                />
                <span className="text-sm">
                  I have written down my recovery phrase and stored it in a
                  fairly secure location so that I can recover my wallet if
                  needed
                </span>
              </label>

              <div className="flex justify-end mt-16">
                <button
                  className="primary-button py-3 px-8 rounded-lg"
                  onClick={prepareVerification}
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Verify Seed Step */}
        {step === OnboardingStep.VERIFY_SEED && wallet?.mnemonic && (
          <div className="fade-in">
            <h2 className="text-2xl font-bold text-center mb-8">
              Verify Recovery Phrase
            </h2>
            <p className="text-center text-gray-400 mb-14">
              Please select the correct words in order to verify you&apos;ve
              saved your phrase
            </p>

            <div className="selected-words flex flex-wrap gap-3 min-h-[70px] bg-gray-800 p-6 rounded-lg mb-10">
              {selectedWords.map((word, i) => (
                <div
                  key={i}
                  className="seed-word bg-blue-500 bg-opacity-20 border border-blue-500 px-4 py-2 rounded-full text-sm font-medium"
                  onClick={() => handleWordSelect(word)}
                >
                  {word}
                </div>
              ))}
            </div>

            <div className="word-options grid grid-cols-4 gap-4 mb-12 stagger-fade-in">
              {wallet.mnemonic.split(" ").map((word, i) => (
                <button
                  key={i}
                  className={`seed-word px-3 py-3 rounded-lg text-sm font-medium transition-all border
                    ${
                      selectedWords.includes(word)
                        ? "bg-blue-500 bg-opacity-20 border-blue-500 opacity-50"
                        : "bg-gray-700 border-gray-600 hover:bg-gray-600 hover:scale-105"
                    }`}
                  onClick={() => handleWordSelect(word)}
                  disabled={selectedWords.includes(word)}
                >
                  {word}
                </button>
              ))}
            </div>

            {error && (
              <div className="error-message bg-red-500 bg-opacity-10 border border-red-500 text-red-400 p-4 rounded-lg mb-10">
                {error}
              </div>
            )}

            <div className="flex justify-end mt-16">
              <button
                className="primary-button py-3 px-8 rounded-lg"
                onClick={verifySeed}
                disabled={selectedWords.length !== seedWordsToVerify.length}
              >
                Verify & Continue
              </button>
            </div>
          </div>
        )}

        {/* Import Wallet Step */}
        {step === OnboardingStep.IMPORT_WALLET && (
          <div className="fade-in">
            <h2 className="text-2xl font-bold text-center mb-14">
              Import Wallet
            </h2>

            <div className="input-group mb-12">
              <label htmlFor="privateKey" className="block mb-5 text-lg">
                Private Key
              </label>
              <div className="private-key-input relative">
                <input
                  id="privateKey"
                  type={showKey ? "text" : "password"}
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                  placeholder="Enter your private key (0x...)"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-4 pr-12 font-mono"
                />
                <button
                  type="button"
                  className="toggle-visibility absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-full hover:bg-gray-700"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {error && (
              <div className="error-message bg-red-500 bg-opacity-10 border border-red-500 text-red-400 p-4 rounded-lg mb-10">
                {error}
              </div>
            )}

            <div className="flex justify-between gap-4 mt-16">
              <button
                className="secondary-button py-3 px-6 rounded-lg"
                onClick={() => setStep(OnboardingStep.CREATE_OR_IMPORT)}
              >
                Back
              </button>
              <button
                className="primary-button py-3 px-6 rounded-lg"
                onClick={handleImportWallet}
                disabled={!privateKey}
              >
                Import Wallet
              </button>
            </div>
          </div>
        )}
      </div>

      {step === OnboardingStep.WELCOME && (
        <div
          className="mt-16 text-center fade-in"
          style={{ animationDelay: "0.6s" }}
        >
          <p className="text-gray-500 text-sm">
            Powered by Ethereum blockchain. Safe, secure, and decentralized.
          </p>
        </div>
      )}
    </div>
  );
};

export default Onboarding;
