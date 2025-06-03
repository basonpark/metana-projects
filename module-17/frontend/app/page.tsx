"use client";

import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  Globe,
  Shield,
  Users,
  Vote,
  FileText,
  Wallet,
  BarChart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatsCard } from "@/components/stats-card";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { TiltedScroll, TiltedScrollItem } from "@/components/ui/tilted-scroll";
import { Globe as GlobeComponent } from "@/components/ui/globe";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function LandingPage() {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.8, 1]);
  const y = useTransform(scrollYProgress, [0, 0.5], [100, 0]);

  return (
    <div className="flex min-h-screen flex-col" ref={targetRef}>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="container relative z-10 flex flex-col items-center text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="font-heading text-4xl font-bold leading-tight md:text-6xl lg:text-7xl bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent"
          >
            Governance <br /> DAO for the Future
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl"
          >
            Participate in transparent decision-making with our state-of-the-art
            DAO governance platform. Vote, propose, and shape the future
            together.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <Link href="/dashboard">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  className="h-12 px-8 shadow-xl shadow-primary/20"
                >
                  Enter Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            </Link>
            <Link href="#features">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button variant="outline" size="lg" className="h-12 px-8">
                  Learn More
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>

        {/* Globe Visualization */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20 md:opacity-30">
          <div className="h-[600px] w-[600px] md:h-[800px] md:w-[800px]">
            <GlobeComponent />
          </div>
        </div>

        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background/50 pointer-events-none" />
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <StatsCard
                title="Total Value Locked"
                value="$24.8M"
                change="+5.2%"
                trend="up"
                description="Assets managed by the DAO"
                icon={Shield}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <StatsCard
                title="Active Participants"
                value="12,450"
                change="+12.3%"
                trend="up"
                description="Governance token holders"
                icon={Users}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <StatsCard
                title="Proposal Success Rate"
                value="78.5%"
                change="-2.1%"
                trend="down"
                description="Proposals that reach quorum"
                icon={Vote}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Recent Proposals Tilted Scroll */}
      <section className="py-20 overflow-hidden">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, margin: "-100px" }}
            className="flex items-center justify-between mb-8"
          >
            <h2 className="font-heading text-3xl font-bold">
              Recent Proposals
            </h2>
            <Link
              href="/dashboard/proposals"
              className="flex items-center text-primary font-medium"
            >
              View All
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </motion.div>

          <TiltedScroll
            tiltAmount={5}
            scrollMultiplier={0.8}
            className="w-full py-4"
          >
            {[
              {
                id: "1",
                title: "Treasury diversification: Allocate 5% to stablecoins",
                status: "active",
                category: "Treasury",
                votes: { for: 65, against: 25, abstain: 10 },
              },
              {
                id: "2",
                title: "Increase developer grants by 20%",
                status: "pending",
                category: "Funding",
                votes: { for: 0, against: 0, abstain: 0 },
              },
              {
                id: "3",
                title: "Reduce voting period to 2 days",
                status: "executed",
                category: "Governance",
                votes: { for: 80, against: 15, abstain: 5 },
              },
              {
                id: "4",
                title: "Add liquidity to Uniswap V3",
                status: "defeated",
                category: "Treasury",
                votes: { for: 40, against: 55, abstain: 5 },
              },
              {
                id: "5",
                title: "Implement protocol fee of 0.05%",
                status: "active",
                category: "Protocol",
                votes: { for: 58, against: 32, abstain: 10 },
              },
              {
                id: "6",
                title: "Launch grants program V2",
                status: "pending",
                category: "Funding",
                votes: { for: 0, against: 0, abstain: 0 },
              },
              {
                id: "7",
                title: "Revise contributor compensation",
                status: "active",
                category: "Governance",
                votes: { for: 70, against: 20, abstain: 10 },
              },
              {
                id: "8",
                title: "Form partnership with Project X",
                status: "queued",
                category: "Partnerships",
                votes: { for: 0, against: 0, abstain: 0 },
              },
              {
                id: "9",
                title: "Implement ZK-rollup for scaling",
                status: "active",
                category: "Protocol",
                votes: { for: 60, against: 30, abstain: 10 },
              },
              {
                id: "10",
                title: "Update DAO Constitution",
                status: "succeeded",
                category: "Governance",
                votes: { for: 85, against: 10, abstain: 5 },
              },
            ].map((proposal) => (
              <TiltedScrollItem
                key={proposal.id}
                className="w-[300px] md:w-[350px]"
              >
                <Link href="/dashboard/proposals">
                  <Card className="h-full border-none shadow-xl bg-gradient-to-br from-card to-card/80 hover:shadow-2xl transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex flex-col h-full">
                        <div className="flex items-center gap-2 mb-3">
                          <div
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              proposal.status === "active"
                                ? "bg-blue-500/20 text-blue-700"
                                : proposal.status === "pending"
                                ? "bg-yellow-500/20 text-yellow-700"
                                : proposal.status === "executed"
                                ? "bg-green-500/20 text-green-700"
                                : "bg-red-500/20 text-red-700"
                            }`}
                          >
                            {proposal.status.charAt(0).toUpperCase() +
                              proposal.status.slice(1)}
                          </div>
                          <div className="px-2 py-1 text-xs font-medium rounded-full bg-muted/50">
                            {proposal.category}
                          </div>
                        </div>
                        <h3 className="font-heading font-medium text-base mb-4">
                          {proposal.title}
                        </h3>

                        {proposal.status !== "pending" && (
                          <div className="mt-auto">
                            <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-muted/70 mb-2">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${proposal.votes.for}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="bg-green-500"
                              />
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{
                                  width: `${proposal.votes.against}%`,
                                }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="bg-red-500"
                              />
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{
                                  width: `${proposal.votes.abstain}%`,
                                }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="bg-gray-400"
                              />
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>For: {proposal.votes.for}%</span>
                              <span>Against: {proposal.votes.against}%</span>
                              <span>Abstain: {proposal.votes.abstain}%</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </TiltedScrollItem>
            ))}
          </TiltedScroll>
        </div>
      </section>

      {/* Features Section with Bento Grid */}
      <section
        id="features"
        className="py-20 bg-gradient-to-b from-background to-muted/30"
      >
        <div className="container">
          <motion.div
            style={{ opacity, scale, y }}
            className="mx-auto max-w-2xl text-center mb-16"
          >
            <h2 className="font-heading text-3xl font-bold md:text-4xl bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Powerful Governance Features
            </h2>
            <p className="mt-4 text-muted-foreground">
              Our platform provides all the tools you need for effective
              decentralized governance.
            </p>
          </motion.div>

          <BentoGrid className="max-w-6xl">
            {[
              {
                title: "Transparent Voting",
                description:
                  "Real-time voting results with detailed analytics and complete transparency for all participants.",
                icon: <Vote className="h-10 w-10 text-primary" />,
                className:
                  "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-900/20 border-blue-200 dark:border-blue-800/30 shadow-md hover:shadow-lg transition-shadow",
              },
              {
                title: "Proposal Creation",
                description:
                  "Intuitive interface for creating and submitting governance proposals with on-chain execution.",
                icon: <FileText className="h-10 w-10 text-primary" />,
                className:
                  "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-900/20 border-blue-200 dark:border-blue-800/30 shadow-md hover:shadow-lg transition-shadow",
              },
              {
                title: "Delegation System",
                description:
                  "Flexible delegation system allowing token holders to delegate their voting power to trusted representatives.",
                icon: <Users className="h-10 w-10 text-primary" />,
                className:
                  "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-900/20 border-blue-200 dark:border-blue-800/30 shadow-md hover:shadow-lg transition-shadow",
              },
              {
                title: "Treasury Management",
                description:
                  "Comprehensive tools for managing and monitoring the DAO's treasury assets and allocations.",
                icon: <Wallet className="h-10 w-10 text-primary" />,
                className:
                  "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-900/20 border-blue-200 dark:border-blue-800/30 shadow-md hover:shadow-lg transition-shadow",
              },
              {
                title: "Governance Analytics",
                description:
                  "Detailed analytics and insights into voting patterns, proposal success rates, and participant engagement.",
                icon: <BarChart className="h-10 w-10 text-primary" />,
                className:
                  "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-900/20 border-blue-200 dark:border-blue-800/30 shadow-md hover:shadow-lg transition-shadow",
              },
              {
                title: "Multi-chain Support",
                description:
                  "Support for governance across multiple blockchains with unified interface and experience.",
                icon: <Globe className="h-10 w-10 text-primary" />,
                className:
                  "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-900/20 border-blue-200 dark:border-blue-800/30 shadow-md hover:shadow-lg transition-shadow",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                <BentoGridItem
                  title={feature.title}
                  description={feature.description}
                  icon={feature.icon}
                  className={feature.className}
                />
              </motion.div>
            ))}
          </BentoGrid>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: "-100px" }}
            className="mx-auto max-w-3xl rounded-3xl bg-gradient-to-br from-primary to-primary/90 p-8 text-center shadow-2xl md:p-12"
          >
            <h2 className="font-heading text-3xl font-bold text-primary-foreground md:text-4xl">
              Ready to Shape the Future?
            </h2>
            <p className="mt-4 text-primary-foreground/90 md:text-lg">
              Join our community of governance participants and help steer the
              direction of the protocol.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <w3m-button />
              <Link href="/dashboard">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 px-8 bg-transparent text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/10"
                  >
                    Explore Dashboard
                  </Button>
                </motion.div>
              </Link>
            </div>
          </motion.div>
        </div>
        <div className="absolute inset-0 bg-grid-primary/5 [mask-image:linear-gradient(to_bottom,transparent,black)]" />
      </section>
    </div>
  );
}
