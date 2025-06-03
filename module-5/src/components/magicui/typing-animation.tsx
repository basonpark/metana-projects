"use client";

import React, { useEffect, useState } from "react";

export const TypingAnimation = ({ children }: { children: string }) => {
  const [text, setText] = useState("");
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    if (typeof children !== "string") return;

    // Keep cursor blinking at all times
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);

    // Function to handle one complete animation cycle
    const typeText = async () => {
      // Clear the text
      setText("");

      // Type out the text character by character
      for (let i = 0; i <= children.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 50));
        setText(children.substring(0, i));
      }

      // Pause at the end with full text
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Start over
      typeText();
    };

    // Start the animation
    typeText();

    // Cleanup on unmount
    return () => {
      clearInterval(cursorInterval);
    };
  }, [children]);

  return (
    <span>
      {text}
      <span
        className={`border-r-2 border-white ml-1 ${
          showCursor ? "opacity-100" : "opacity-0"
        }`}
      >
        &nbsp;
      </span>
    </span>
  );
};
