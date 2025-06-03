"use client";

import type React from "react";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  FileText,
  Globe,
  Home,
  type LucideIcon,
  Menu,
  Moon,
  PlusCircle,
  Settings,
  Sun,
  Wallet,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CreateProposalDialog } from "@/components/create-proposal-dialog";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";

interface NavItemProps {
  icon: LucideIcon;
  title: string;
  href: string;
  isActive?: boolean;
}

function NavItem({ icon: Icon, title, href, isActive }: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
        isActive
          ? "bg-gradient-to-r from-primary/20 to-primary/10 text-primary font-medium shadow-sm"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        <Icon className="h-4 w-4" />
      </motion.div>
      <span>{title}</span>
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-lg bg-primary/5"
          layoutId="sidebar-highlight"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          style={{ borderRadius: 8 }}
        />
      )}
    </Link>
  );
}

export function DashboardShell({
  children,
  pageTitle,
}: {
  children: React.ReactNode;
  pageTitle?: string;
}) {
  const [isCreateProposalOpen, setIsCreateProposalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        className="hidden border-r bg-gradient-to-b from-muted/50 to-background lg:block lg:w-72 lg:flex-none"
      >
        <div className="flex h-full flex-col gap-2">
          <div className="flex h-16 items-center border-b px-6">
            <Link
              href="/"
              className="flex items-center gap-2 font-heading font-bold"
            >
              <span className="text-xl"></span>
            </Link>
          </div>
          <div className="flex-1 overflow-auto py-4">
            <nav className="grid items-start px-4 text-sm font-medium gap-1">
              <NavItem
                icon={Home}
                title="Overview"
                href="/dashboard"
                isActive={pathname === "/dashboard"}
              />
              <NavItem
                icon={FileText}
                title="Proposals"
                href="/dashboard/proposals"
                isActive={pathname === "/dashboard/proposals"}
              />
              <NavItem
                icon={BarChart3}
                title="Treasury"
                href="/dashboard/treasury"
                isActive={pathname === "/dashboard/treasury"}
              />
              <NavItem
                icon={Wallet}
                title="Wallet"
                href="/dashboard/wallet"
                isActive={pathname === "/dashboard/wallet"}
              />
              <NavItem
                icon={Globe}
                title="Network"
                href="/dashboard/network"
                isActive={pathname === "/dashboard/network"}
              />
              <NavItem
                icon={Settings}
                title="Settings"
                href="/dashboard/settings"
                isActive={pathname === "/dashboard/settings"}
              />
            </nav>

            <div className="mt-8 px-4">
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <h3 className="px-3 text-xs font-medium text-muted-foreground">
                  Governance Stats
                </h3>
                <div className="mt-2 space-y-1 rounded-lg bg-muted/50 p-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">
                      Total Proposals
                    </span>
                    <span className="font-medium">142</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">
                      Active Proposals
                    </span>
                    <span className="font-medium">8</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Quorum</span>
                    <span className="font-medium">4%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">
                      Participation Rate
                    </span>
                    <span className="font-medium">32.5%</span>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="mt-8 px-4">
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                <h3 className="px-3 text-xs font-medium text-muted-foreground">
                  Your Activity
                </h3>
                <div className="mt-2 space-y-1 rounded-lg bg-muted/50 p-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">
                      Proposals Created
                    </span>
                    <span className="font-medium">3</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">
                      Proposals Voted
                    </span>
                    <span className="font-medium">27</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Last Vote</span>
                    <span className="font-medium">2 days ago</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
          <div className="mt-auto p-6">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                className="w-full justify-start gap-2 shadow-lg shadow-primary/20 bg-gradient-to-r from-primary to-primary/90"
                onClick={() => setIsCreateProposalOpen(true)}
              >
                <PlusCircle className="h-4 w-4" />
                Create Proposal
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Mobile menu */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <div className="flex h-full flex-col">
            <div className="flex h-16 items-center border-b px-6">
              <Link
                href="/"
                className="flex items-center gap-2 font-heading font-bold"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-primary to-primary-foreground/50 text-primary-foreground">
                  DAO
                </div>
                <span className="text-xl">Governance</span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-auto py-4">
              <nav className="grid items-start px-4 text-sm font-medium gap-1">
                <NavItem
                  icon={Home}
                  title="Overview"
                  href="/dashboard"
                  isActive={pathname === "/dashboard"}
                />
                <NavItem
                  icon={FileText}
                  title="Proposals"
                  href="/dashboard/proposals"
                  isActive={pathname === "/dashboard/proposals"}
                />
                <NavItem
                  icon={BarChart3}
                  title="Treasury"
                  href="/dashboard/treasury"
                  isActive={pathname === "/dashboard/treasury"}
                />
                <NavItem
                  icon={Wallet}
                  title="Wallet"
                  href="/dashboard/wallet"
                  isActive={pathname === "/dashboard/wallet"}
                />
                <NavItem
                  icon={Globe}
                  title="Network"
                  href="/dashboard/network"
                  isActive={pathname === "/dashboard/network"}
                />
                <NavItem
                  icon={Settings}
                  title="Settings"
                  href="/dashboard/settings"
                  isActive={pathname === "/dashboard/settings"}
                />
              </nav>

              <div className="mt-8 px-4">
                <h3 className="px-3 text-xs font-medium text-muted-foreground">
                  Governance Stats
                </h3>
                <div className="mt-2 space-y-1 rounded-lg bg-muted/50 p-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">
                      Total Proposals
                    </span>
                    <span className="font-medium">142</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">
                      Active Proposals
                    </span>
                    <span className="font-medium">8</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Quorum</span>
                    <span className="font-medium">4%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">
                      Participation Rate
                    </span>
                    <span className="font-medium">32.5%</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6">
              <Button
                className="w-full justify-start gap-2 shadow-lg shadow-primary/20 bg-gradient-to-r from-primary to-primary/90"
                onClick={() => {
                  setIsCreateProposalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
              >
                <PlusCircle className="h-4 w-4" />
                Create Proposal
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        <header
          className={cn(
            "sticky top-0 z-10 flex h-16 items-center gap-4 border-b px-4 sm:px-6 lg:px-8 transition-all duration-200",
            scrolled
              ? "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm"
              : "bg-background"
          )}
        >
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
          <div className="flex flex-1 items-center gap-4">
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="font-heading text-xl font-bold"
            >
              {pageTitle || "Governance Dashboard"}
            </motion.h1>
          </div>
          <div className="flex items-center gap-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="rounded-full"
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="hidden md:block"
            >
              <Button
                variant="outline"
                size="sm"
                className="gap-2 shadow-sm"
                onClick={() => setIsCreateProposalOpen(true)}
              >
                <PlusCircle className="h-4 w-4" />
                Create Proposal
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            ></motion.div>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <CreateProposalDialog
        open={isCreateProposalOpen}
        onOpenChange={setIsCreateProposalOpen}
      />
    </div>
  );
}
