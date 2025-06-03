"use client"; // Enable client-side rendering for framer-motion

import Image from "next/image";
import { DepositBorrowCard } from "@/components/dashboard/DepositBorrowCard";
import { StakingCard } from "@/components/dashboard/StakingCard";
import { UserStats } from "@/components/dashboard/UserStats";
import { HowItWorksContent } from "@/components/HowItWorksContent";
import { LampContainer } from "@/components/ui/lamp"; // Import LampContainer
import { motion, Variants } from "framer-motion"; // Import motion and Variants type
import { Card } from "@/components/ui/card"; // Import Card
import { cn } from "@/lib/utils"; // Import cn

// --- Enhanced Animation Variants ---

// Variants for the Hero section text (using spring)
const heroTextVariants: Variants = {
  hidden: { opacity: 0, y: 50, scale: 0.9 },
  visible: (delay: number = 0) => ({
    // Accept delay custom prop
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      delay,
    },
  }),
};

// Variant specifically for the subtitle
const subtitleVariant: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 1.5, // Longer duration for smooth effect
      ease: "easeOut", // Standard easing
      delay,
    },
  }),
};

// Variants for the Dashboard card container (staggering)
const cardContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2, // Stagger the animation of children
      delayChildren: 0.1, // Small delay before children start
    },
  },
};

// Variants for individual Dashboard cards (slide, scale, fade)
const cardItemVariants: Variants = {
  hidden: { opacity: 0, y: 50, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.25, 1, 0.5, 1], // Custom cubic bezier for overshoot effect
    },
  },
};

// Variant for the How It Works section card
const howItWorksVariant: Variants = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: "easeOut",
    },
  },
};

export default function Home() {
  // Define common card classes with transparent gradient
  const cardClasses = cn(
    "border border-white/15 backdrop-blur-lg", // Keep border and blur
    "bg-gradient-to-br from-transparent via-slate-950/30 to-black", // Darker transparent gradient,
    "shadow-lg shadow-slate-950/30 dark:shadow-[0_10px_30px_-10px_rgba(0,220,255,0.30)]"
  );

  return (
    // Apply main background and padding
    <div className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-black text-white p-4 md:p-8 overflow-x-hidden">
      {" "}
      {/* Prevent horizontal scroll */}
      {/* LampContainer remains the same */}
      <LampContainer>
        <motion.h1
          variants={heroTextVariants} // Apply hero variants
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }} // Trigger when 30% visible
          custom={0.3} // Pass delay to visible state
          transition={{
            delay: 0.5,
            duration: 2,
            ease: "easeInOut",
          }}
          className="bg-gradient-to-br from-slate-300 to-slate-500 bg-clip-text text-center text-7xl font-medium tracking-tight text-transparent md:text-8xl"
        >
          Lumina Finance <br />
          <motion.span // Apply variants to inner span too
            variants={heroTextVariants}
            className="mt-3 block text-4xl md:text-5xl" // Smaller font size
          >
            Yield Optimized
          </motion.span>
        </motion.h1>
        {/* Add the tagline with hero variants */}
        <motion.p
          variants={heroTextVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          custom={1.5} // Further delay
          transition={{
            delay: 1.5,
            duration: 2,
            ease: "easeInOut",
          }}
          className="mt-6 text-center text-lg font-normal text-neutral-300 max-w-lg mx-auto"
        >
          Maximize your stablecoin returns effortlessly with automated DeFi
          strategies.
        </motion.p>
      </LampContainer>
      {/* Existing Content - adjust positioning and add card styling */}
      <div className="relative z-10 -mt-16 md:-mt-32 px-4">
        {/* Add padding top here instead and use space-y for vertical spacing */}
        {/* Wrap dashboard section with container variants */}
        <motion.div
          className="pt-16 md:pt-24 space-y-10 max-w-4xl mx-auto"
          variants={cardContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }} // Trigger early
        >
          {/* Deposit/Borrow and Staking Cards - Apply item variants */}
          <motion.div
            variants={cardItemVariants}
            className="flex flex-col md:flex-row gap-10 justify-center"
          >
            <Card
              className={cn(
                cardClasses,
                "border border-slate-700 bg-gradient-to-br from-slate-600/70 to-slate-800 shadow-[inset_0_2px_3px_0_rgba(255,255,255,0.08)]",
                "flex-1"
              )}
            >
              <DepositBorrowCard />
            </Card>
            <Card
              className={cn(
                cardClasses,
                "border border-slate-700 bg-gradient-to-br from-slate-600/70 to-slate-800 shadow-[inset_0_2px_3px_0_rgba(255,255,255,0.08)]",
                "flex-1"
              )}
            >
              <StakingCard />
            </Card>
          </motion.div>

          {/* UserStats Card - Apply item variants */}
          <motion.div variants={cardItemVariants}>
            <Card
              className={cn(
                cardClasses,
                "mx-auto max-w-xl border border-slate-700 bg-gradient-to-br from-slate-600/70 to-slate-800 shadow-[inset_0_2px_3px_0_rgba(255,255,255,0.08)]"
              )}
            >
              <UserStats />
            </Card>
          </motion.div>
        </motion.div>
      </div>
      {/* HowItWorks section - Apply howItWorksVariant */}
      <motion.div
        variants={howItWorksVariant}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <Card
          className={cn(
            cardClasses,
            "w-full max-w-3xl mx-auto mt-24 p-6 md:p-8 bg-transparent bg-gradient-to-br from-slate-600/40 to-slate-800 mb-32"
          )}
        >
          <HowItWorksContent />
        </Card>
      </motion.div>
      {/* Removed old motion.section */}
    </div>
  );
}
