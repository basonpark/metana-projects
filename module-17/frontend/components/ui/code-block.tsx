"use client";

import React from 'react';
import { cn } from '@/lib/utils';

type CodeBlockProps = {
  code: string;
  language?: string; // Optional language prop for potential future syntax highlighting
  className?: string;
};

export function CodeBlock({ code, language, className }: CodeBlockProps) {
  return (
    <div className={cn("rounded-md border bg-muted p-4 overflow-x-auto", className)}>
      <pre className={`language-${language || 'plaintext'} text-sm bg-transparent p-0 m-0`}>
        <code className={`language-${language || 'plaintext'}`}>
          {code.trim()} {/* Trim leading/trailing whitespace */}
        </code>
      </pre>
    </div>
  );
}
