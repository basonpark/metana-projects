"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { motion, useScroll, useTransform } from "framer-motion"

interface TiltedScrollProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  children?: React.ReactNode
  tiltDirection?: "left" | "right"
  tiltAmount?: number
  scrollMultiplier?: number
}

export function TiltedScroll({
  className,
  children,
  tiltDirection = "right",
  tiltAmount = 10,
  scrollMultiplier = 0.5,
  ...props
}: TiltedScrollProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  })

  const tiltAngle = tiltDirection === "right" ? tiltAmount : -tiltAmount
  const translateX = useTransform(scrollYProgress, [0, 1], [0, 100 * scrollMultiplier])

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden", className)}
      style={{
        perspective: "1000px",
      }}
      {...props}
    >
      <motion.div
        className="flex gap-4 py-4"
        style={{
          rotateY: `${tiltAngle}deg`,
          translateX,
          transformStyle: "preserve-3d",
        }}
      >
        {children}
      </motion.div>
    </div>
  )
}

interface TiltedScrollItemProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  children?: React.ReactNode
}

export function TiltedScrollItem({ className, children, ...props }: TiltedScrollItemProps) {
  return (
    <div
      className={cn(
        "flex-shrink-0 rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
