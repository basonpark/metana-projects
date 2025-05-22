"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const Header: React.FC = () => {
  const pathname = usePathname();

  const navLinks: { href: string; label: string; disabled?: boolean }[] = [
    { href: "/", label: "Audit" },
    { href: "/about", label: "About" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto h-14 flex items-center justify-between px-4">
        <Link
          href="/"
          className="text-lg font-semibold flex items-center gap-2"
        >
          AI Auditor
        </Link>

        <div className="flex items-center space-x-2 md:space-x-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.disabled ? "#" : link.href}
              className={cn(
                "px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                pathname === link.href && !link.disabled
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground",
                link.disabled
                  ? "opacity-50 cursor-not-allowed pointer-events-none"
                  : ""
              )}
              aria-disabled={link.disabled}
              onClick={(e) => {
                if (link.disabled) e.preventDefault();
              }}
              title={link.disabled ? "Coming Soon!" : undefined}
            >
              {link.label}
            </Link>
          ))}
          <span
            className={cn(
              "px-3 py-2 rounded-md text-sm font-medium transition-colors text-muted-foreground opacity-50 cursor-not-allowed pointer-events-none",
              "hidden md:inline-block"
            )}
            title="Coming Soon!"
            aria-disabled={true}
          >
            History
          </span>
        </div>
      </nav>
    </header>
  );
};

export default Header;
