"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { Button } from "@/components/ui/button";
import { FlipText } from "@/components/ui/flip-text";

export function ProphitHero() {
  return (
    // Full-width container with no constraints
    <div className="relative w-full min-h-[80vh] overflow-hidden">
      {/* Aurora background positioned to cover entire viewport width */}
      <div className="absolute -inset-8 z-0 w-[100vw] left-[calc(50%-50vw)] right-[calc(50%-50vw)]">
        <AuroraBackground className="w-full h-full" showRadialGradient={false}>
          <div></div>
        </AuroraBackground>
      </div>

      {/* Hero content positioned on top of aurora background */}
      <div className="relative z-10 min-h-[70vh] py-16 flex items-center justify-center">
        <div className="flex flex-col gap-2 items-center justify-center px-4 max-w-4xl mx-auto text-center">
          {/* Logo and app name - first to appear */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.2,
              duration: 1,
              ease: "easeOut",
            }}
            className="flex items-center justify-center gap-2 mb-2"
          >
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
          </motion.div>

          {/* First line of heading with flip text animation */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="text-4xl md:text-6xl font-bold text-foreground leading-tight pb-0"
          >
            <FlipText
              word="Predict the Future."
              duration={1.0}
              delayMultiple={0.06}
              className="inline-block"
              framerProps={{
                hidden: { rotateX: -90, opacity: 0, y: 20 },
                visible: { rotateX: 0, opacity: 1, y: 0 },
              }}
            />
          </motion.div>

          {/* Second line of heading with flip text animation */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 1.0, duration: 3 }}
            className="text-6xl md:text-7xl font-bold text-foreground leading-none "
          >
            <FlipText
              word="Profit from Your Insights."
              duration={1.0}
              delayMultiple={0.06}
              className="inline-block text-primary"
              framerProps={{
                hidden: { rotateX: -90, opacity: 0, y: 20 },
                visible: { rotateX: 0, opacity: 1, y: 0 },
              }}
            />
          </motion.div>

          {/* Description text - fourth to appear */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              delay: 2.6,
              duration: 1,
              ease: "easeOut",
            }}
            className="text-2xl text-muted-foreground max-w-3xl mt-10"
          >
            Join the next generation prediction market platform where your
            knowledge becomes your advantage.
          </motion.p>

          {/* Buttons - last to appear */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              delay: 3.2,
              duration: 1,
              ease: "easeOut",
            }}
            className="flex flex-col sm:flex-row gap-4 mt-10"
          >
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
          </motion.div>
        </div>
      </div>
    </div>
  );
}
