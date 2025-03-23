"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { Button } from "@/components/ui/button";

export function ProphitHero() {
  return (
    <AuroraBackground className="h-[60vh] min-h-[500px] relative">
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="relative flex flex-col gap-6 items-center justify-center px-4 max-w-4xl mx-auto text-center"
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-12 w-12 text-primary"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6-10-6-10-6z" />
            <circle cx="12" cy="12" r="3" />
            <path d="M12 10v4" strokeLinecap="round" />
            <path d="M10 12h4" strokeLinecap="round" />
          </svg>
          <span className="text-3xl font-bold">Prophit</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
          Predict the Future.
          <br />
          <span className="text-primary">Profit</span> from Your Insights.
        </h1>

        <p className="text-xl text-muted-foreground max-w-3xl">
          Join the next generation prediction market platform where your
          knowledge becomes your advantage.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <Button asChild size="lg" className="text-base px-8">
            <Link href="/markets">Explore Markets</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="text-base px-8"
          >
            <Link href="/markets/create">Create Market</Link>
          </Button>
        </div>
      </motion.div>
    </AuroraBackground>
  );
}
