"use client";

import React, { useEffect } from "react";
// Using a lightweight syntax highlighter. You could swap this for 'react-syntax-highlighter' for more features.
// Add prismjs theme CSS to your global CSS or layout: import 'prismjs/themes/prism-okaidia.css';
import Editor from "react-simple-code-editor";
import Prism, { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-solidity"; // Add solidity support
// import 'prismjs/themes/prism-okaidia.css'; // <- Removed, theme is in layout.tsx
import "prismjs/plugins/line-numbers/prism-line-numbers.js"; // Import line numbers JS

interface CodeBlockProps {
  code: string;
  language: "solidity" | "javascript" | "typescript" | "json"; // Add more as needed
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language }) => {
  const langDefinition = languages[language] || languages.javascript; // Default to JS if language not found

  // Ensure Prism applies highlighting and line numbers after render
  useEffect(() => {
    Prism.highlightAll();
  }, [code, language]);

  return (
    // Update background color to use the new brand-burgundy color
    <div className="my-4 rounded-md p-4 text-sm relative font-mono overflow-hidden shadow-inner code-block-wrapper bg-muted line-numbers">
      {/* Add a class 'code-block-wrapper' for potential future specific styling */}
      {/* The line-numbers class enables the plugin styling */}
      <Editor
        value={code.trim()} // Trim whitespace
        onValueChange={() => {}} // Read-only
        // Use Prism.highlight, not the imported highlight directly for consistency with useEffect?
        // Let's stick to the imported highlight as it works with the editor's structure.
        highlight={(code) => highlight(code, langDefinition, language)}
        padding={10}
        readOnly
        // Add 'language-xxxx' class for Prism theme/plugin targeting
        textareaClassName={`language-${language} focus:outline-none`}
        preClassName={`language-${language}`}
        style={{
          fontFamily: '"Fira Code", "Fira Mono", monospace',
          fontSize: 13,
          outline: "none",
          // Let bg-muted handle background
          // backgroundColor: 'transparent',
          caretColor: "transparent",
        }}
      />
      {/* Keep the language indicator */}
      <span className="absolute top-2 right-3 text-xs text-muted-foreground uppercase select-none z-10">
        {language}
      </span>
    </div>
  );
};
