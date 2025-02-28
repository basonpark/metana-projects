"use client";

import {
  ArrowLeftIcon,
  BoltIcon,
  ChartBarIcon,
  CubeTransparentIcon,
  FireIcon,
  ClockIcon,
  SignalIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { EtherlensLogo } from "@/components/Logo";
import { useBlockData } from "@/hooks/use-block-data";
import { BlockCountdown } from "@/components/block-countdown";
import { tokens } from "@/lib/tokens";

// Add this to the top of your file for custom styles
const peachColor = "#FFCB9A";
const peachLightColor = "#FFD9B5";
const peachDarkColor = "#E5B78B";

export default function AboutPage() {
  const { blocks, isConnected } = useBlockData(tokens[0].address);

  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden">
      {/* Replace the current animated background with a simpler moving gradient */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Simple slate background */}
        <div className="absolute inset-0 bg-slate-900"></div>

        {/* Moving white gradient overlay - smoother animation */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent moving-gradient"></div>
      </div>

      {/* Navigation Bar (simplified version) */}
      <nav className="sticky top-0 z-50 bg-slate-900/70 backdrop-blur-lg border-b border-slate-700/50 shadow-lg relative">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <Link href="/">
                  <div className="flex items-center space-x-2">
                    <EtherlensLogo className="h-8 w-8" />
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent cursor-pointer">
                      Etherlens
                    </h1>
                  </div>
                </Link>
              </div>

              {/* Navigation Links */}
              <div className="hidden md:flex space-x-6">
                <Link
                  href="/"
                  className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-md font-medium hover:border-b-2 hover:border-[#FFCB9A] transition-all"
                >
                  Dashboard
                </Link>
                <Link
                  href="/about"
                  className="text-slate-200 hover:text-white px-3 py-2 rounded-md text-md font-medium border-b-2 border-[#FFCB9A]"
                >
                  About
                </Link>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {blocks[0] && (
                <>
                  <div className="flex items-center text-slate-300">
                    <ClockIcon className="w-5 h-5 mr-1 text-[#FFCB9A]" />
                    <span className="text-sm font-medium">
                      Block #{blocks[blocks.length - 1].number}
                    </span>
                  </div>
                  <BlockCountdown
                    latestBlockTimestamp={blocks[blocks.length - 1].timestamp}
                    blocks={blocks}
                    variant="minimal"
                  />
                </>
              )}
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/50 shadow-inner">
                <SignalIcon
                  className={`w-5 h-5 ${
                    isConnected ? "text-emerald-400" : "text-amber-400"
                  }`}
                />
                <span className="text-sm font-medium text-slate-300">
                  {isConnected ? "Connected" : "Connecting..."}
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Rest of content with relative positioning */}
      <div className="relative z-10">
        {/* Header with Back Button */}
        <div className="max-w-5xl mx-auto pt-8 px-4">
          <Link
            href="/"
            className="inline-flex items-center text-slate-300 hover:text-white mb-6"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">
            About This Project
          </h1>
          <br />
          <p className="text-xl text-slate-300 mb-12">
            This project is a simple dashboard that displays the current state
            of the <span className="font-bold">Ethereum blockchain</span>. Data
            is fetched from the{" "}
            <a
              href="https://dashboard.alchemy.com/services/smart-websockets"
              className="font-bold text-[#FFCB9A] hover:text-[#FFD9B5] transition-colors underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Alchemy API
            </a>
            .
            <br />
            <br />
            The primary value of{" "}
            <a
              href="https://ethereum.github.io/abm1559/notebooks/eip1559.html"
              className="font-bold text-[#FFCB9A] hover:text-[#FFD9B5] transition-colors underline"
              target="_blank"
              rel="noopener noreferrer"
            ></a>{" "}
            is to make transaction fees on the Ethereum network more predictable
            and efficient. Implemented to overhaul the previous transaction fee
            system, EIP-1559 replaces the old{" "}
            <span className="font-bold">first-price auction mechanism</span>
            —where users had to guess and bid a gas price for miners to include
            their transactions—with a more structured approach. It introduces a{" "}
            <span className="font-bold">base fee</span>, which is
            algorithmically determined based on network congestion and is{" "}
            <span className="font-bold">burned</span> once the tr
            EIP-1559ansaction is included in the block.
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto px-4 pb-20">
          <div className="space-y-16">
            {/* EIP-1559 and Gas Fees Section */}
            <section>
              <div className="flex items-center mb-6">
                <FireIcon className="h-8 w-8 text-[#FFCB9A] mr-3" />
                <h2 className="text-2xl font-bold text-white">
                  Ethereum Gas Fees & EIP-1559
                </h2>
              </div>
              <div className="bg-slate-800/80 rounded-xl p-6 border border-slate-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.56)]">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4">
                      The London Upgrade
                    </h3>
                    <p className="text-slate-300 mb-4">
                      EIP-1559 was implemented in August 2021 as part of the
                      "London" network upgrade, fundamentally changing how gas
                      fees work on Ethereum.
                    </p>
                    <h4 className="text-lg font-semibold text-white mt-6 mb-2">
                      Key Concepts
                    </h4>
                    <ul className="list-disc list-inside text-slate-300 space-y-2">
                      <li>
                        <span className="font-medium text-[#FFCB9A]">
                          Base Fee:
                        </span>{" "}
                        Algorithmically determined minimum fee required for
                        transaction inclusion
                      </li>
                      <li>
                        <span className="font-medium text-[#FFCB9A]">
                          Priority Fee:
                        </span>{" "}
                        Optional tip to incentivize miners/validators
                      </li>
                      <li>
                        <span className="font-medium text-[#FFCB9A]">
                          Fee Burning:
                        </span>{" "}
                        Base fee is burned, reducing ETH supply over time
                      </li>
                    </ul>
                  </div>
                  <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600/50 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      How Base Fee Adjusts
                    </h3>
                    <div className="space-y-4">
                      <div className="bg-slate-800/80 p-3 rounded border border-slate-700">
                        <div className="flex justify-between mb-1">
                          <span className="text-slate-300">
                            Block Utilization
                          </span>
                          <span className="text-amber-400">50% (Target)</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2.5">
                          <div className="bg-amber-500 h-2.5 rounded-full w-1/2"></div>
                        </div>
                        <div className="mt-1 text-sm text-slate-400">
                          Base fee remains unchanged
                        </div>
                      </div>

                      <div className="bg-slate-800/80 p-3 rounded border border-slate-700">
                        <div className="flex justify-between mb-1">
                          <span className="text-slate-300">
                            Block Utilization
                          </span>
                          <span className="text-red-400">100% (Full)</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2.5">
                          <div className="bg-red-500 h-2.5 rounded-full w-full"></div>
                        </div>
                        <div className="mt-1 text-sm text-slate-400">
                          Base fee increases by up to 12.5%
                        </div>
                      </div>

                      <div className="bg-slate-800/80 p-3 rounded border border-slate-700">
                        <div className="flex justify-between mb-1">
                          <span className="text-slate-300">
                            Block Utilization
                          </span>
                          <span className="text-green-400">0% (Empty)</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2.5">
                          <div className="bg-green-500 h-2.5 rounded-full w-0"></div>
                        </div>
                        <div className="mt-1 text-sm text-slate-400">
                          Base fee decreases by up to 12.5%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Block Gas and Utilization Section */}
            <section>
              <div className="flex items-center mb-6">
                <ChartBarIcon className="h-8 w-8 text-[#FFCB9A] mr-3" />
                <h2 className="text-2xl font-bold text-white">
                  Block Gas & Utilization
                </h2>
              </div>
              <div className="bg-slate-800/80 rounded-xl p-6 border border-slate-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.56)]">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-white mb-3">
                    Understanding Block Gas
                  </h3>
                  <p className="text-slate-300">
                    Every Ethereum block has a maximum amount of computation it
                    can perform, measured in gas units. The current target is
                    approximately 15 million gas per block. This dashboard
                    tracks the relationship between gas used and gas limit as a
                    percentage.
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600/50 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                    <h4 className="text-lg font-semibold text-white mb-2">
                      Gas Limit
                    </h4>
                    <p className="text-slate-300 text-sm">
                      The maximum amount of gas that can be consumed in a single
                      block, setting an upper bound on computation per block.
                    </p>
                  </div>

                  <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600/50 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                    <h4 className="text-lg font-semibold text-white mb-2">
                      Gas Used
                    </h4>
                    <p className="text-slate-300 text-sm">
                      The actual amount of gas consumed by all transactions
                      included in a block.
                    </p>
                  </div>

                  <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600/50 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                    <h4 className="text-lg font-semibold text-white mb-2">
                      Gas Ratio
                    </h4>
                    <p className="text-slate-300 text-sm">
                      The percentage of available gas actually consumed,
                      directly influencing the base fee adjustment.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-900/50 p-5 rounded-lg border border-slate-800">
                  <h4 className="text-lg font-semibold text-white mb-3">
                    Key Insight
                  </h4>
                  <p className="text-slate-300">
                    There's a direct relationship between gas utilization and
                    base fee changes: When blocks are consistently full (high
                    utilization), base fees rise to reduce demand. When blocks
                    are consistently empty (low utilization), base fees fall to
                    stimulate demand.
                  </p>
                </div>
              </div>
            </section>

            {/* YouTube EIP-1559 Video Embed */}
            <div className="bg-slate-800/80 rounded-xl p-5 border border-slate-700/50 shadow-[0_10px_40px_rgba(0,0,0,0.7)] mb-12">
              <h3 className="text-xl font-semibold text-white mb-3 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-[#FFCB9A] mr-2"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                </svg>
                Unexpectedly Clear EIP-1559 Explanation
              </h3>
              <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden h-[600px]">
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/h66dV4EqfY8?start=2784"
                  title="Understanding EIP-1559"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <p className="text-[#FFCB9A] text-m mt-3">
                Check out this severely underrated explanation of how EIP-1559
                transformed Ethereum's gas fee mechanism by one of my favorite
                blockchain youtube thinkers,{" "}
                <a
                  href="https://www.youtube.com/@jordanmmck"
                  className="underline font-semibold hover:text-white transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Jordan McKinney
                </a>
                .
              </p>
            </div>
          </div>

          {/* ERC20 Tokens Section */}
          <section>
            <div className="flex items-center mb-6 mt-12">
              <CubeTransparentIcon className="h-8 w-8 text-[#FFCB9A] mr-3" />
              <h2 className="text-2xl font-bold text-white">
                ERC20 Token Transfers
              </h2>
            </div>
            <div className="bg-slate-800/80 rounded-xl p-6 border border-slate-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.56)]">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    What are ERC20 Tokens?
                  </h3>
                  <p className="text-slate-300 mb-4">
                    ERC20 is a standard interface for fungible tokens on
                    Ethereum. It allows tokens to be transferred and managed
                    using a common set of functions.
                  </p>
                  <p className="text-slate-300">
                    This dashboard tracks transfer volume for selected ERC20
                    tokens across blocks, allowing you to visualize token
                    activity in real-time.
                  </p>
                </div>
                <div className="bg-slate-700/30 p-5 border border-slate-600/50 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Popular ERC20 Tokens
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-center p-2 bg-slate-800/80 rounded">
                      <div className="w-8 h-8 mr-3 overflow-hidden rounded-full flex items-center justify-center">
                        <img
                          src="/usdc.png"
                          alt="USDC Logo"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="text-white font-medium">USDC</div>
                        <div className="text-xs text-slate-400">
                          USD Coin - Stablecoin pegged to USD
                        </div>
                      </div>
                    </li>
                    <li className="flex items-center p-2 bg-slate-800/80 rounded">
                      <div className="w-8 h-8 mr-3 overflow-hidden rounded-full flex items-center justify-center">
                        <img
                          src="/dai.png"
                          alt="DAI Logo"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="text-white font-medium">DAI</div>
                        <div className="text-xs text-slate-400">
                          Decentralized stablecoin by MakerDAO
                        </div>
                      </div>
                    </li>
                    <li className="flex items-center p-2 bg-slate-800/80 rounded">
                      <div className="w-8 h-8 mr-3 overflow-hidden rounded-full flex items-center justify-center">
                        <img
                          src="/uniswap.png"
                          alt="UNI Logo"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="text-white font-medium">UNI</div>
                        <div className="text-xs text-slate-400">
                          Uniswap governance token
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Real-time Blockchain Monitoring */}
          <section>
            <div className="flex items-center mb-6 mt-12">
              <BoltIcon className="h-8 w-8 text-[#FFCB9A] mr-3" />
              <h2 className="text-2xl font-bold text-white">
                Real-time Blockchain Monitoring
              </h2>
            </div>
            <div className="bg-slate-800/80 rounded-xl p-6 border border-slate-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.56)]">
              <p className="text-slate-300 mb-6">
                This dashboard uses WebSocket connections to listen for new
                blocks as they're produced on the Ethereum network. Here's how
                the real-time monitoring system works:
              </p>

              <div className="bg-slate-900/70 p-5 rounded-lg border border-slate-700/50 mb-6">
                <h3 className="text-xl font-semibold text-white mb-4">
                  Technical Implementation
                </h3>
                <div className="space-y-4">
                  <div className="flex">
                    <div className="w-10 h-10 rounded-full bg-[#FFCB9A]/20 flex items-center justify-center mr-4 shrink-0">
                      <span className="text-[#FFCB9A] font-bold">1</span>
                    </div>
                    <div>
                      <h4 className="text-white font-medium">
                        WebSocket Connection
                      </h4>
                      <p className="text-slate-300 text-sm">
                        The application establishes a persistent WebSocket
                        connection to an Ethereum node through the Alchemy API.
                      </p>
                    </div>
                  </div>

                  <div className="flex">
                    <div className="w-10 h-10 rounded-full bg-[#FFCB9A]/20 flex items-center justify-center mr-4 shrink-0">
                      <span className="text-[#FFCB9A] font-bold">2</span>
                    </div>
                    <div>
                      <h4 className="text-white font-medium">
                        Block Header Subscription
                      </h4>
                      <p className="text-slate-300 text-sm">
                        We subscribe to new block headers, which are published
                        approximately every 12 seconds.
                      </p>
                    </div>
                  </div>

                  <div className="flex">
                    <div className="w-10 h-10 rounded-full bg-[#FFCB9A]/20 flex items-center justify-center mr-4 shrink-0">
                      <span className="text-[#FFCB9A] font-bold">3</span>
                    </div>
                    <div>
                      <h4 className="text-white font-medium">
                        Data Enrichment
                      </h4>
                      <p className="text-slate-300 text-sm">
                        When a new block is detected, we fetch additional data
                        about gas usage and token transfers.
                      </p>
                    </div>
                  </div>

                  <div className="flex">
                    <div className="w-10 h-10 rounded-full bg-[#FFCB9A]/20 flex items-center justify-center mr-4 shrink-0">
                      <span className="text-[#FFCB9A] font-bold">4</span>
                    </div>
                    <div>
                      <h4 className="text-white font-medium">
                        Real-time Updates
                      </h4>
                      <p className="text-slate-300 text-sm">
                        The UI automatically updates with the new block data,
                        keeping the charts and table current.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#FFCB9A]/10 border border-[#FFCB9A]/20 p-4 rounded-lg">
                <h4 className="text-lg font-semibold text-[#FFCB9A] mb-2">
                  Why Real-time Matters
                </h4>
                <p className="text-slate-300">
                  Real-time blockchain data enables traders, developers, and
                  researchers to observe market conditions, gas price
                  fluctuations, and network congestion as they happen, providing
                  valuable insights for decision-making.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Update animation styles */}
      <style jsx>{`
        .moving-gradient {
          background-size: 200% 100%;
          animation: moveGradient 15s ease-in-out infinite;
        }

        @keyframes moveGradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </div>
  );
}
