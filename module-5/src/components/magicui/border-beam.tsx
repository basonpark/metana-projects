"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { ComponentPropsWithoutRef } from "react";

interface BorderBeamProps extends ComponentPropsWithoutRef<"div"> {
  size?: number;
  duration?: number;
  borderWidth?: number;
  anchor?: number;
  colorFrom?: string;
  colorTo?: string;
  delay?: number;
}

export const BorderBeam = ({
  className,
  size = 300,
  duration = 10,
  anchor = 90,
  borderWidth = 2,
  colorFrom = "#FFCB9A",
  colorTo = "#FFD700",
  delay = 0,
  ...props
}: BorderBeamProps) => {
  return (
    <div
      className={`absolute inset-0 overflow-hidden rounded-xl ${className}`}
      style={{
        padding: borderWidth,
      }}
    >
      <div
        className="absolute inset-0 z-0"
        style={{
          background: `conic-gradient(from 0deg, ${colorFrom}, ${colorTo}, ${colorFrom})`,
          borderRadius: "inherit",
        }}
      />
      <div
        className="absolute inset-0 z-10 rounded-lg bg-transparent"
        style={{
          margin: `${borderWidth}px`,
        }}
      />
    </div>
  );
};
