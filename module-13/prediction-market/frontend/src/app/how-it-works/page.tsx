"use client";

import { RootLayout } from "@/components/layout/RootLayout";

export default function HowItWorksPage() {
  return (
    <RootLayout>
      <div className="bg-background min-h-screen">
        {/* How It Works - Enhanced Section */}
        <div className="container mx-auto px-4 py-20 relative">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background opacity-50 rounded-3xl pointer-events-none"></div>

          <div className="relative z-10">
            {/* Section header */}
            <div className="text-center mb-16">
              <h1 className="text-4xl font-bold mb-4">How It Works</h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Discover how prediction markets harness the wisdom of crowds to
                forecast future events with remarkable accuracy.
              </p>
            </div>

            {/* Core process visualization */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
              <div className="bg-gradient-to-br from-blue-500/10 via-background to-background rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-border hover:border-primary/20 animate-float">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                    <span className="text-2xl font-bold text-primary">1</span>
                  </div>
                  <h3 className="text-xl font-semibold">Browse Markets</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Explore a variety of prediction markets across different
                  categories like finance, politics, and sports.
                </p>
                <div className="h-32 bg-gradient-to-r from-primary/5 to-background rounded-lg flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary/80"
                  >
                    <rect
                      width="18"
                      height="18"
                      x="3"
                      y="3"
                      rx="2"
                      ry="2"
                    ></rect>
                    <line x1="9" x2="15" y1="9" y2="9"></line>
                    <line x1="9" x2="15" y1="15" y2="15"></line>
                    <line x1="9" x2="15" y1="12" y2="12"></line>
                  </svg>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500/10 via-background to-background rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-border hover:border-primary/20 animate-float animate-float-delay-1">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                    <span className="text-2xl font-bold text-primary">2</span>
                  </div>
                  <h3 className="text-xl font-semibold">Place Predictions</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Buy YES or NO shares based on your prediction of the outcome
                  and your confidence level. The price reflects probability.
                </p>
                <div className="h-32 bg-gradient-to-r from-primary/5 to-background rounded-lg flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary/80"
                  >
                    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                    <path d="M4 22h16"></path>
                    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
                  </svg>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500/10 via-background to-background rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-border hover:border-primary/20 animate-float animate-float-delay-2">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                    <span className="text-2xl font-bold text-primary">3</span>
                  </div>
                  <h3 className="text-xl font-semibold">Earn Rewards</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  When the market resolves, collect your rewards for correct
                  predictions. Winnings are verified by Chainlink oracles.
                </p>
                <div className="h-32 bg-gradient-to-r from-primary/5 to-background rounded-lg flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary/80"
                  >
                    <circle cx="12" cy="8" r="6"></circle>
                    <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path>
                  </svg>
                </div>
              </div>
            </div>

            {/* Philosophy & Benefits */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
              {/* Philosophy of Prediction Markets */}
              <div className="bg-card/50 rounded-xl p-8 shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mt-16 -mr-16 z-0"></div>
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-4 flex items-center">
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
                      className="mr-3 text-primary"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" x2="12" y1="16" y2="12"></line>
                      <line x1="12" x2="12.01" y1="8" y2="8"></line>
                    </svg>
                    The Philosophy
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Prediction markets operate on the principle that{" "}
                    <span className="text-foreground font-medium">
                      the combined knowledge of many people is more accurate
                      than a few experts
                    </span>
                    . They create a financial incentive for honesty, as
                    participants profit by being correct and lose by being
                    wrong.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="text-primary mr-2 mt-1">→</span>
                      <span>
                        Markets aggregate dispersed information from diverse
                        participants
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2 mt-1">→</span>
                      <span>
                        Prices represent real-time probability estimates
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2 mt-1">→</span>
                      <span>
                        Unlike polls, participants have "skin in the game"
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2 mt-1">→</span>
                      <span>
                        Blockchain ensures transparency and tamper-proof
                        resolution
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Benefits of Prediction Markets */}
              <div className="bg-card/50 rounded-xl p-8 shadow-md relative overflow-hidden">
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 rounded-full -mb-16 -ml-16 z-0"></div>
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-4 flex items-center">
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
                      className="mr-3 text-primary"
                    >
                      <path d="m12 14 4-4"></path>
                      <path d="M3.34 19a10 10 0 1 1 17.32 0"></path>
                    </svg>
                    The Benefits
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Prediction markets don't just forecast events—they provide
                    numerous benefits to participants and society. The resulting{" "}
                    <span className="text-foreground font-medium">
                      collective insights can be more valuable than traditional
                      forecasting methods
                    </span>
                    .
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-background p-4 rounded-lg shadow-sm">
                      <h4 className="font-semibold mb-1">
                        Financial Opportunity
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Profit from your knowledge and research about future
                        events
                      </p>
                    </div>
                    <div className="bg-background p-4 rounded-lg shadow-sm">
                      <h4 className="font-semibold mb-1">Superior Accuracy</h4>
                      <p className="text-sm text-muted-foreground">
                        Consistently outperform polls, experts, and other
                        forecasting methods
                      </p>
                    </div>
                    <div className="bg-background p-4 rounded-lg shadow-sm">
                      <h4 className="font-semibold mb-1">
                        Information Discovery
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Reveal hidden information and update in real-time as new
                        facts emerge
                      </p>
                    </div>
                    <div className="bg-background p-4 rounded-lg shadow-sm">
                      <h4 className="font-semibold mb-1">
                        Decentralized Oracle
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Provides reliable probability estimates for other
                        contracts and systems
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Important Risks Section */}
              <div className="col-span-1 lg:col-span-2 bg-destructive/5 rounded-xl p-8 shadow-md relative overflow-hidden border border-destructive/20 hover:shadow-lg transition-all duration-300">
                <div className="absolute top-0 right-0 w-24 h-24 bg-destructive/5 rounded-full -mt-12 -mr-12 z-0"></div>
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-3 flex items-center text-destructive">
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
                      className="mr-2"
                    >
                      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                      <line x1="12" y1="9" x2="12" y2="13"></line>
                      <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                    Important Risks to Consider
                  </h3>
                  <p className="text-base text-muted-foreground mb-6">
                    While prediction markets offer exciting opportunities, it's
                    crucial to understand and carefully consider these risks
                    before participating. None of this information constitutes
                    financial advice - always do your own research and never
                    invest more than you can afford to lose.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-background/50 p-4 rounded-lg hover:shadow-md transition-all duration-300 hover:bg-background/80 group border border-border/50">
                      <h4 className="font-semibold mb-2 flex items-center text-base group-hover:text-destructive">
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
                          className="mr-2"
                        >
                          <circle cx="12" cy="12" r="8"></circle>
                          <line x1="12" y1="8" x2="12" y2="12"></line>
                          <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        Financial Risks
                      </h4>
                      <ul className="text-sm text-muted-foreground space-y-2">
                        <li className="flex items-start">
                          <span className="text-destructive mr-2">•</span>
                          <span>
                            Potential for complete loss of invested capital
                          </span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-destructive mr-2">•</span>
                          <span>
                            Binary outcomes - positions are all-or-nothing
                          </span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-destructive mr-2">•</span>
                          <span>
                            Market volatility can lead to unexpected losses
                          </span>
                        </li>
                      </ul>
                    </div>
                    <div className="bg-background/50 p-4 rounded-lg hover:shadow-md transition-all duration-300 hover:bg-background/80 group border border-border/50">
                      <h4 className="font-semibold mb-2 flex items-center text-base group-hover:text-destructive">
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
                          className="mr-2"
                        >
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
                        </svg>
                        Market Risks
                      </h4>
                      <ul className="text-sm text-muted-foreground space-y-2">
                        <li className="flex items-start">
                          <span className="text-destructive mr-2">•</span>
                          <span>Price manipulation by large traders</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-destructive mr-2">•</span>
                          <span>
                            Limited liquidity affecting entry/exit prices
                          </span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-destructive mr-2">•</span>
                          <span>Potential for misinformation campaigns</span>
                        </li>
                      </ul>
                    </div>
                    <div className="bg-background/50 p-4 rounded-lg hover:shadow-md transition-all duration-300 hover:bg-background/80 group border border-border/50">
                      <h4 className="font-semibold mb-2 flex items-center text-base group-hover:text-destructive">
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
                          className="mr-2"
                        >
                          <rect
                            width="18"
                            height="18"
                            x="3"
                            y="3"
                            rx="2"
                            ry="2"
                          ></rect>
                          <path d="M7 7h10"></path>
                          <path d="M7 12h10"></path>
                          <path d="M7 17h10"></path>
                        </svg>
                        Technical Risks
                      </h4>
                      <ul className="text-sm text-muted-foreground space-y-2">
                        <li className="flex items-start">
                          <span className="text-destructive mr-2">•</span>
                          <span>Smart contract vulnerabilities</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-destructive mr-2">•</span>
                          <span>Oracle failures or delays in resolution</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-destructive mr-2">•</span>
                          <span>Network congestion affecting trades</span>
                        </li>
                      </ul>
                    </div>
                    <div className="bg-background/50 p-4 rounded-lg hover:shadow-md transition-all duration-300 hover:bg-background/80 group border border-border/50">
                      <h4 className="font-semibold mb-2 flex items-center text-base group-hover:text-destructive">
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
                          className="mr-2"
                        >
                          <path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22"></path>
                          <path d="m18 2 4 4-4 4"></path>
                        </svg>
                        Regulatory & Legal Risks
                      </h4>
                      <ul className="text-sm text-muted-foreground space-y-2">
                        <li className="flex items-start">
                          <span className="text-destructive mr-2">•</span>
                          <span>Evolving regulatory landscape</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-destructive mr-2">•</span>
                          <span>Jurisdictional restrictions</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-destructive mr-2">•</span>
                          <span>
                            Tax implications and reporting requirements
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Real-world applications */}
            <div className="rounded-xl bg-gradient-to-r from-primary/10 via-background to-primary/10 p-8 shadow-lg">
              <h3 className="text-2xl font-bold mb-6 text-center">
                Real-World Applications
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center shadow-md mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-primary"
                    >
                      <path d="M3 3v18h18"></path>
                      <path d="m19 9-5 5-4-4-3 3"></path>
                    </svg>
                  </div>
                  <h4 className="font-semibold mb-2">Financial Forecasting</h4>
                  <p className="text-sm text-muted-foreground">
                    Predict economic indicators and market movements with
                    remarkable accuracy
                  </p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center shadow-md mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-primary"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
                    </svg>
                  </div>
                  <h4 className="font-semibold mb-2">Risk Assessment</h4>
                  <p className="text-sm text-muted-foreground">
                    Evaluate project risks and insurance outcomes through
                    collective wisdom
                  </p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center shadow-md mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-primary"
                    >
                      <path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22"></path>
                      <path d="m18 2 4 4-4 4"></path>
                      <path d="M2 6h1.9c1.5 0 2.9.9 3.6 2.2"></path>
                      <path d="M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8"></path>
                      <path d="m18 14 4 4-4 4"></path>
                    </svg>
                  </div>
                  <h4 className="font-semibold mb-2">Event Outcomes</h4>
                  <p className="text-sm text-muted-foreground">
                    From elections to sporting events, better predict results
                    than traditional polls
                  </p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center shadow-md mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-primary"
                    >
                      <path d="M21 11V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6"></path>
                      <path d="M12 13V7"></path>
                      <path d="M8 9v4"></path>
                      <path d="M16 9v4"></path>
                      <circle cx="19" cy="16" r="3"></circle>
                      <path d="M22 22-5-5"></path>
                    </svg>
                  </div>
                  <h4 className="font-semibold mb-2">Corporate Decisions</h4>
                  <p className="text-sm text-muted-foreground">
                    Help companies make better product and strategic decisions
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Update the core process cards with animations and colors */}
      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
          100% {
            transform: translateY(0px);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-float-delay-1 {
          animation-delay: 0.5s;
        }
        .animate-float-delay-2 {
          animation-delay: 1s;
        }
      `}</style>
    </RootLayout>
  );
}
