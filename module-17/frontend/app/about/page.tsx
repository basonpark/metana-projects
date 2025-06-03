"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  ArrowRight,
  Vote,
  FileText,
  Users,
  Wallet,
  BarChart,
  Globe,
} from "lucide-react";
import { motion } from "framer-motion";
import { ContractExplanation } from "@/components/contract-explanation";

// Reusable Header Component (Could be extracted later)
function AppHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"></header>
  );
}

const features = [
  {
    icon: Vote,
    title: "On-Chain Voting",
    description:
      "Participate in secure and transparent voting directly on the blockchain. Every vote is recorded immutably, ensuring the integrity of the governance process.",
  },
  {
    icon: FileText,
    title: "Proposal Management",
    description:
      "Create, submit, and track governance proposals through an intuitive interface. Monitor proposal status from draft to execution.",
  },
  {
    icon: Users,
    title: "Vote Delegation",
    description:
      "Delegate your voting power to trusted representatives or community leaders if you're unable to vote directly. Maintain influence even when inactive.",
  },
  {
    icon: Wallet,
    title: "Treasury Oversight",
    description:
      "Gain visibility into the DAO's treasury. Monitor assets, transactions, and allocations governed by community proposals.",
  },
  {
    icon: BarChart,
    title: "Governance Analytics",
    description:
      "Access detailed analytics on voting patterns, participant engagement, proposal success rates, and overall DAO health.",
  },
  {
    icon: Globe,
    title: "Multi-Chain Ready",
    description:
      "Built with future flexibility in mind, designed to potentially support governance mechanisms across different blockchain networks.",
  },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-background to-muted/30 py-20 md:py-32">
          <div className="container text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="font-heading text-4xl font-bold md:text-6xl bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent"
            >
              About Our Platform
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.2,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="mt-6 max-w-3xl mx-auto text-lg text-muted-foreground md:text-xl"
            >
              Empowering communities through transparent, decentralized
              governance. Discover the features that make our platform the ideal
              choice for your DAO.
            </motion.p>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-10 md:py-28">
          <div className="container">
            <h2 className="text-center font-heading text-3xl font-bold md:text-4xl mb-12">
              Core Functionalities
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true, amount: 0.3 }}
                >
                  <Card className="h-full overflow-hidden shadow-lg hover:shadow-md transition-shadow duration-300  bg-gradient-to-br from-slate-100 to-slate-300">
                    <CardHeader className="flex flex-row items-center gap-4 pb-4">
                      <div className="bg-primary/10 p-3 rounded-full">
                        <feature.icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-xl font-semibold">
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Core Smart Contracts Section */}
        <ContractExplanation />

        {/* Call to Action */}
        <section className="py-20 bg-muted/30">
          <div className="container text-center">
            <h2 className="font-heading text-3xl font-bold md:text-4xl mb-6">
              Ready to Experience Decentralized Governance?
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-8">
              Launch the app and connect your wallet to explore active proposals
              and participate in decision-making.
            </p>
            <Link href="/dashboard">
              <Button size="lg">
                Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
