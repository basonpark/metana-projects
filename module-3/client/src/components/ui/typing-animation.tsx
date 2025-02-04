"use client";

import { cn } from "@/lib/utils";
import { motion, MotionProps } from "motion/react";
import { useEffect, useRef, useState } from "react";

interface TypingAnimationProps extends MotionProps {
  children: string;
  className?: string;
  duration?: number;
  delay?: number;
  as?: React.ElementType;
  startOnView?: boolean;
}

export function TypingAnimation({
  children,
  className,
  duration = 100,
  delay = 0,
  as: Component = "div",
  startOnView = false,
  ...props
}: TypingAnimationProps) {
  const MotionComponent = motion.create(Component, {
    forwardMotionProps: true,
  });

  const [displayedText, setDisplayedText] = useState<string>("");
  const [started, setStarted] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!startOnView) {
      const startTimeout = setTimeout(() => {
        setStarted(true);
      }, delay);
      return () => clearTimeout(startTimeout);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setStarted(true);
          }, delay);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [delay, startOnView]);

  useEffect(() => {
    if (!started) return;

    let timeoutId: NodeJS.Timeout;

    function typeLetter(i: number) {
      if (i <= children.length) {
        // Type the text letter by letter
        setDisplayedText(children.substring(0, i));
        timeoutId = setTimeout(() => {
          typeLetter(i + 1);
        }, duration);
      } else {
        // After finishing, wait a bit, then clear and restart without flickering
        timeoutId = setTimeout(() => {
          setDisplayedText("\u00A0");
          typeLetter(0);
        }, 2500);
      }
    }

    typeLetter(0);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [children, duration, delay, started]);

  return (
    <MotionComponent
      ref={elementRef}
      className={cn(
        "text-4xl font-bold leading-[5rem] tracking-[-0.02em] min-h-[5rem]",
        className
      )}
      {...props}
    >
      {displayedText}
    </MotionComponent>
  );
}
