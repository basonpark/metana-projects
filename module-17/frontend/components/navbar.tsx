"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo linked to home */}
        <Link href="/" className="flex items-center gap-2 group">
          <motion.div
            whileHover={{ rotate: 5 }}
            className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-primary to-primary-foreground/50 text-primary-foreground transition-transform duration-200 ease-in-out group-hover:scale-110"
          >
            DAO
          </motion.div>
          <span className="font-heading text-xl font-bold">Governance</span>
        </Link>
        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-2 text-sm">
          <Link
            href="/"
            className="font-medium px-3 py-2 rounded-md transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            Home
          </Link>
          <Link
            href="/dashboard"
            className="font-medium px-3 py-2 rounded-md transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            Dashboard
          </Link>
          <Link
            href="/about#features" // Update this href
            className="font-medium px-3 py-2 rounded-md transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            Features
          </Link>
          <Link
            href="/about"
            className="font-medium px-3 py-2 rounded-md transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            About
          </Link>
        </nav>
        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="outline" className="hidden md:flex">
              Launch App
            </Button>
          </Link>
          {/* Ensure Web3Modal button is included */}
          <w3m-button />
        </div>
      </div>
    </header>
  );
}
