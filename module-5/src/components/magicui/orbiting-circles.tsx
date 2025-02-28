"use client";

import React from "react";

export const OrbitingCircles = ({
  items = 6,
  radius = 120,
  className = "",
  circleClassName = "",
}) => {
  return (
    <div className={`relative ${className}`}>
      {Array.from({ length: items }).map((_, i) => {
        const angle = (i / items) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const animationDelay = `${i * 0.5}s`;

        return (
          <div
            key={i}
            className={`absolute h-3 w-3 rounded-full bg-[#FFCB9A] animate-orbit ${circleClassName}`}
            style={{
              left: `calc(50% + ${x}px)`,
              top: `calc(50% + ${y}px)`,
              transformOrigin: `${-x}px ${-y}px`,
              animationDelay,
            }}
          />
        );
      })}
      <style jsx>{`
        @keyframes orbit {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        .animate-orbit {
          animation: orbit 20s linear infinite;
        }
      `}</style>
    </div>
  );
};
