"use client";

import { VaultCard, VaultData } from "../../components/vaults/VaultCard";
import { mockVaults } from "../../components/vaults/VaultData";

import { LampContainer } from "@/components/ui/lamp";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  TrendingUp,
  Lock,
  AlertTriangle,
  LogIn,
  LogOut,
  Info,
} from "lucide-react";

// Define risk level order for sorting
const riskOrder: { [key in VaultData["riskLevel"]]: number } = {
  Low: 1,
  Medium: 2,
  High: 3,
};

// Sort the mockVaults array by risk level
// Create a sorted copy to avoid modifying the original potentially shared mock data
const sortedVaults = [...mockVaults].sort(
  (a, b) => riskOrder[a.riskLevel] - riskOrder[b.riskLevel]
);

// Animation variants for individual items (cards) - Used for whileInView now
const itemVariants = {
  hidden: { y: 60, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 80,
    },
  },
};

export default function VaultsPage() {
  return (
    <div className="min-h-screen bg-black">
      <LampContainer>
        <motion.h1
          initial={{ opacity: 0.5, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="mt-8 bg-gradient-to-br from-slate-300 to-slate-500 py-4 bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl"
        >
          Available Vaults
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-4 text-center text-slate-400 text-lg md:text-xl max-w-2xl mx-auto"
        >
          Deposit your assets into our optimized yield vaults. Earn competitive
          yields with varying risk profiles.
        </motion.p>
      </LampContainer>

      <div className="relative z-10 -mt-40 md:-mt-52 pb-24">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {sortedVaults.map((vault) => (
              <motion.div
                key={vault.id}
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
              >
                <VaultCard vault={vault} />
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }} // Delay slightly after vaults
            className="mt-16 max-w-4xl mx-auto"
          >
            <Card
              className={cn(
                "bg-slate-800/50 border border-slate-700",
                "shadow-[inset_0_2px_3px_0_rgba(255,255,255,0.08)]", // Subtle white inner shadow
                "hover:shadow-[inset_0_2px_6px_0_rgba(255,255,255,0.12)] hover:border-slate-600", // Enhanced inner shadow and border on hover
                "transition-all duration-300 ease-in-out" // Smooth transition
              )}
            >
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
                  <Info size={20} className="text-cyan-400" /> How Lumina Vaults
                  Work
                </CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300 space-y-5 text-sm leading-relaxed">
                <p className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-slate-400 mt-1 flex-shrink-0" />
                  <span>
                    Lumina Finance vaults are{" "}
                    <strong className="font-semibold text-white">
                      smart contracts
                    </strong>{" "}
                    designed to automate complex{" "}
                    <em className="italic text-slate-200">
                      yield farming strategies
                    </em>
                    . When you deposit assets, the vault automatically allocates
                    them to various DeFi protocols to maximize returns based on
                    the chosen strategy and risk level.
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 text-slate-400 mt-1 flex-shrink-0" />
                  <span>
                    <strong className="font-semibold text-white">
                      Yields (APY)
                    </strong>{" "}
                    shown are{" "}
                    <em className="italic text-slate-200">estimates</em> and can
                    fluctuate based on market conditions.{" "}
                    <Lock className="inline-block h-4 w-4 text-slate-400 mx-1" />{" "}
                    <strong className="font-semibold text-white">TVL</strong>{" "}
                    (Total Value Locked) represents the total assets currently
                    deposited.
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-slate-400 mt-1 flex-shrink-0" />
                  <span>
                    Always{" "}
                    <strong className="font-semibold text-white">
                      Do Your Own Research (DYOR)
                    </strong>{" "}
                    before investing. Vaults marked{" "}
                    <em className="italic text-slate-200">Medium</em> or{" "}
                    <em className="italic text-slate-200">High Risk</em> may
                    offer higher potential returns but also carry a{" "}
                    <strong className="font-semibold text-white">
                      greater risk of loss
                    </strong>
                    .
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <LogIn className="h-4 w-4 text-slate-400 mt-1 flex-shrink-0" />
                  <span>
                    Use the &#39;
                    <strong className="font-semibold text-white">
                      Deposit
                    </strong>
                    &#39; button to add funds and the{" "}
                    <LogOut className="inline-block h-4 w-4 text-slate-400 mx-1" />{" "}
                    &#39;
                    <strong className="font-semibold text-white">
                      Withdraw
                    </strong>
                    &#39; button to retrieve your assets and accumulated yield
                    (subject to strategy conditions and potential fees).
                  </span>
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
