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
              strokeWidth="1.5"
            >
              <path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6-10-6-10-6z" />
              <circle cx="12" cy="12" r="3" />
              <path d="M12 10v4" strokeLinecap="round" />
              <path d="M10 12h4" strokeLinecap="round" />
            </svg>
            <span className="text-xl font-bold">Prophit</span>
          </div>
        }
      />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border py-6 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-3">Prophit</h3>
              <p className="text-sm text-muted-foreground">
                See the future, seize the profit - A decentralized prediction
                market powered by blockchain technology.
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
            © {new Date().getFullYear()} Prophit. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
