"use client"; // Add this directive for Framer Motion

import React from "react";
import Link from "next/link";
import { FaGithub, FaTwitter, FaDiscord } from "react-icons/fa"; // Import social icons
import { motion } from "framer-motion"; // Import motion
import { cn } from "@/lib/utils"; // Import cn

// Footer animation variant
const footerVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

export function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <motion.footer
      variants={footerVariant}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }} // Trigger when 20% visible
      className="py-8 md:px-8 border-border/40 bg-gradient-to-b from-slate-900/90 to-black/90 text-zinc-300" // Increased padding, slightly different bg
    >
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4">
        {/* Left Section: Brand & Copyright */}
        <div className="text-center md:text-left">
          <p className="text-lg font-semibold text-zinc-100">Lumina Finance</p>
          <p className="text-sm text-zinc-400 mt-1">
            {currentYear} Bason Park. All rights reserved.
          </p>
        </div>

        {/* Middle Section: Navigation Links */}
        <nav className="flex flex-wrap justify-center gap-4 md:gap-6">
          <Link href="/" className="text-sm hover:text-white transition-colors">
            Home
          </Link>
          <Link
            href="/#dashboard"
            className="text-sm hover:text-white transition-colors"
          >
            Dashboard
          </Link>{" "}
          {/* Link to anchor */}
          <Link
            href="/how-it-works"
            className="text-sm hover:text-white transition-colors"
          >
            How It Works
          </Link>
          {/* Add other relevant links */}
          {/* <Link href="/docs" className="text-sm hover:text-white transition-colors">Docs</Link> */}
          {/* <Link href="/terms" className="text-sm hover:text-white transition-colors">Terms</Link> */}
        </nav>

        {/* Right Section: Social Media Icons */}
        <div className="flex items-center gap-5">
          <a
            href="https://github.com/your-repo"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <FaGithub size={20} />
          </a>
          <a
            href="https://twitter.com/your-handle"
            target="_blank"
            rel="noreferrer"
            aria-label="Twitter"
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <FaTwitter size={20} />
          </a>
          <a
            href="https://discord.gg/your-invite"
            target="_blank"
            rel="noreferrer"
            aria-label="Discord"
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <FaDiscord size={20} />
          </a>
        </div>
      </div>
    </motion.footer>
  );
}
