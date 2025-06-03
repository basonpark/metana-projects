import React, { useState } from "react";
import { networks, setNetwork } from "../lib/network";

// Icons
const ChevronDownIcon = () => (
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
    <polyline points="6 9 12 15 18 9"></polyline>
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

const NetworkSelector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentNetwork, setCurrentNetwork] = useState("sepolia");

  const handleNetworkChange = (network: string) => {
    setNetwork(network);
    setCurrentNetwork(network);
    setIsOpen(false);
  };

  const getNetworkColor = (network: string) => {
    switch (network) {
      case "sepolia":
        return "#F76C3B"; // Orange
      case "goerli":
        return "#5A9DED"; // Blue
      case "mainnet":
        return "#29B6AF"; // Teal
      default:
        return "#8247E5"; // Purple
    }
  };

  return (
    <div className="network-selector-container relative">
      <button
        className="network-display flex items-center gap-2 py-1 px-3 rounded-full bg-opacity-20 bg-blue-900 border border-blue-800"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div
          className="network-indicator w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: getNetworkColor(currentNetwork) }}
        ></div>
        <span className="text-sm">
          {networks[currentNetwork as keyof typeof networks]?.name ||
            "Sepolia Testnet"}
        </span>
        <ChevronDownIcon
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="network-dropdown glass-effect absolute right-0 top-full mt-2 z-10 w-48 rounded-md overflow-hidden">
          {Object.keys(networks).map((network) => (
            <button
              key={network}
              className={`network-option flex items-center gap-2 w-full py-2 px-3 text-left hover:bg-blue-900 hover:bg-opacity-30 ${
                currentNetwork === network ? "bg-blue-900 bg-opacity-40" : ""
              }`}
              onClick={() => handleNetworkChange(network)}
            >
              <div
                className="network-indicator w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: getNetworkColor(network) }}
              ></div>
              <span>
                {networks[network as keyof typeof networks]?.name ||
                  "Unknown Network"}
              </span>
              {currentNetwork === network && <CheckIcon className="ml-auto" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default NetworkSelector;
