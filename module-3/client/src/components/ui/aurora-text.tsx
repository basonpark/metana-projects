"use client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import React from "react";

interface AuroraTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  className?: string;
}

export function AuroraText({ className, children, ...props }: AuroraTextProps) {
  return (
    <motion.span
      className={cn(
        "inline-block bg-gradient-to-r from-[hsl(var(--color-1))] via-[hsl(var(--color-2))] to-[hsl(var(--color-3))] bg-clip-text text-transparent",
        className
      )}
      animate={{
        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
      }}
      transition={{
        duration: 5,
        repeat: Infinity,
        ease: "linear",
      }}
      style={{
        backgroundSize: "200% auto",
      }}
      {...props}
    >
      {children}
    </motion.span>
  );
}
