"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { WalletConnect } from "../WalletConnect";

interface NavigationItem {
  title: string;
  href?: string;
  description?: string;
  items?: {
    title: string;
    href: string;
    description?: string;
  }[];
}

interface PredictionMarketHeaderProps {
  logo?: React.ReactNode;
  navigationItems?: NavigationItem[];
}

export function PredictionMarketHeader({
  logo = <span className="text-xl font-semibold">PredictX</span>,
  navigationItems = [
    {
      title: "Home",
      href: "/",
    },
    {
      title: "Markets",
      description: "Explore prediction markets across various categories",
      items: [
        {
          title: "Popular Markets",
          href: "/markets/popular",
          description: "See what's trending right now",
        },
        {
          title: "Politics",
          href: "/markets/politics",
          description: "Political events and outcomes",
        },
        {
          title: "Crypto",
          href: "/markets/crypto",
          description: "Cryptocurrency price predictions",
        },
        {
          title: "Sports",
          href: "/markets/sports",
          description: "Sports events and outcomes",
        },
      ],
    },
    {
      title: "How It Works",
      href: "/how-it-works",
    },
    {
      title: "Create Market",
      href: "/markets/create",
    },
  ],
}: PredictionMarketHeaderProps) {
  const [isOpen, setOpen] = useState(false);

  return (
    <header className="w-full z-40 sticky top-0 left-0 bg-background border-b border-border">
      <div className="container relative mx-auto min-h-16 flex items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <div className="flex items-center">{logo}</div>

          <nav className="hidden lg:flex">
            <ul className="flex gap-6">
              {navigationItems.map((item) => (
                <li key={item.title}>
                  {item.href && !item.items ? (
                    <Link
                      href={item.href}
                      className="text-sm font-medium hover:text-primary transition-colors"
                    >
                      {item.title}
                    </Link>
                  ) : (
                    <div className="relative group">
                      <button className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1">
                        {item.title}
                        <svg
                          width="10"
                          height="6"
                          viewBox="0 0 10 6"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M1 1L5 5L9 1"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                      {item.items && (
                        <div className="absolute left-0 top-full mt-2 w-64 p-4 bg-background border border-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                          {item.description && (
                            <div className="mb-2 pb-2 border-b border-border">
                              <p className="text-sm text-muted-foreground">
                                {item.description}
                              </p>
                            </div>
                          )}
                          <ul className="space-y-2">
                            {item.items.map((subItem) => (
                              <li key={subItem.title}>
                                <Link
                                  href={subItem.href}
                                  className="block p-2 rounded-md hover:bg-muted transition-colors"
                                >
                                  <div className="text-sm font-medium">
                                    {subItem.title}
                                  </div>
                                  {subItem.description && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {subItem.description}
                                    </p>
                                  )}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <WalletConnect />
          </div>

          <button
            className="lg:hidden p-2 rounded-md hover:bg-muted transition-colors"
            onClick={() => setOpen(!isOpen)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-background pt-16">
          <div className="container px-4 py-4">
            <ul className="space-y-4">
              {navigationItems.map((item) => (
                <li key={item.title} className="py-2">
                  {item.href && !item.items ? (
                    <Link
                      href={item.href}
                      className="text-lg font-medium"
                      onClick={() => setOpen(false)}
                    >
                      {item.title}
                    </Link>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-lg font-medium">{item.title}</div>
                      {item.items && (
                        <ul className="ml-4 space-y-2">
                          {item.items.map((subItem) => (
                            <li key={subItem.title}>
                              <Link
                                href={subItem.href}
                                className="text-sm text-muted-foreground hover:text-foreground"
                                onClick={() => setOpen(false)}
                              >
                                {subItem.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
            <div className="mt-8 pt-4 border-t border-border">
              <WalletConnect />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
