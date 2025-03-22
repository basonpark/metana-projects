"use client";

import React from "react";
import { PredictionMarketHeader } from "../ui/prediction-market-header";

interface RootLayoutProps {
  children: React.ReactNode;
}

export function RootLayout({ children }: RootLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PredictionMarketHeader
        logo={
          <div className="flex items-center gap-2">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-8 w-8 text-primary"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
              <path d="M16 12l-4 4-4-4" />
              <path d="M12 16V8" />
            </svg>
            <span className="text-xl font-bold">PredictX</span>
          </div>
        }
      />
      <main className="flex-1 container mx-auto py-8 px-4">{children}</main>
      <footer className="border-t border-border py-6 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-3">PredictX</h3>
              <p className="text-sm text-muted-foreground">
                A decentralized prediction market platform powered by blockchain
                technology.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Markets</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="/markets/popular"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Popular
                  </a>
                </li>
                <li>
                  <a
                    href="/markets/crypto"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Crypto
                  </a>
                </li>
                <li>
                  <a
                    href="/markets/politics"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Politics
                  </a>
                </li>
                <li>
                  <a
                    href="/markets/sports"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Sports
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="/faq"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    FAQ
                  </a>
                </li>
                <li>
                  <a
                    href="/tutorials"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Tutorials
                  </a>
                </li>
                <li>
                  <a
                    href="/docs"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="/blog"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Blog
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="/terms"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="/privacy"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-4 border-t border-border text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} PredictX. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
