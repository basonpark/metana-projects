import { useState, useEffect } from "react";
import { networks, setNetwork, getCurrentChainId } from "../lib/network";

export default function NetworkSelector() {
  const [selectedNetwork, setSelectedNetwork] = useState("sepolia");

  // Set the selected network when the component mounts
  useEffect(() => {
    const savedNetwork = localStorage.getItem("network");
    if (savedNetwork && networks[savedNetwork]) {
      setSelectedNetwork(savedNetwork);
      setNetwork(savedNetwork);
    }
  }, []);

  const handleNetworkChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const network = e.target.value;
    setSelectedNetwork(network);
    setNetwork(network);
    localStorage.setItem("network", network);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-700">Network</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Select a testnet for transactions
          </p>
        </div>

        <select
          value={selectedNetwork}
          onChange={handleNetworkChange}
          className="block w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        >
          {Object.entries(networks).map(([id, network]) => (
            <option key={id} value={id}>
              {network.name} (Chain ID: {network.chainId})
            </option>
          ))}
        </select>
      </div>

      {selectedNetwork === "sepolia" && (
        <div className="mt-2 text-xs bg-yellow-50 text-yellow-800 p-2 rounded">
          ℹ️ Get testnet ETH from{" "}
          <a
            href="https://sepoliafaucet.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-yellow-900"
          >
            Sepolia Faucet
          </a>
        </div>
      )}

      {selectedNetwork === "goerli" && (
        <div className="mt-2 text-xs bg-yellow-50 text-yellow-800 p-2 rounded">
          ℹ️ Get testnet ETH from{" "}
          <a
            href="https://goerlifaucet.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-yellow-900"
          >
            Goerli Faucet
          </a>
        </div>
      )}
    </div>
  );
}
