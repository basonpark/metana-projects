"use client"; // This component uses client-side hooks (useState)

import React, { useState, FormEvent, ChangeEvent } from "react";
// Import Shadcn UI components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Upload, FileText, Ban, X } from "lucide-react"; // Import icons
// Code Editor Imports
import Editor from "react-simple-code-editor";
// Import main prismjs library FIRST
import Prism from "prismjs";
// Import components for side effects (attaches to global Prism)
import "prismjs/components/prism-solidity";
// Import a PrismJS theme CSS (adjust path/theme as needed)
// You might need to copy this file to your static assets or import differently
import "prismjs/themes/prism-tomorrow.css"; // Example: Tomorrow Night theme

interface ContractSubmissionFormProps {
  onSubmit: (code: string) => void; // Callback function when form is submitted
  isLoading: boolean; // To disable form during processing
}

const ContractSubmissionForm: React.FC<ContractSubmissionFormProps> = ({
  onSubmit,
  isLoading,
}) => {
  const [contractCode, setContractCode] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null); // To display uploaded file name

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null); // Clear previous errors

    // Read the value from the state
    const currentCode = contractCode;

    if (!currentCode.trim()) {
      setError("Contract code cannot be empty.");
      return;
    }

    // Basic check for common Solidity structure (very rudimentary)
    if (
      !currentCode.includes("contract") &&
      !currentCode.includes("pragma solidity")
    ) {
      setError("Please provide valid Solidity code.");
      // return; // Commented out for initial flexibility
    }

    onSubmit(currentCode);
  };

  // Handle file upload
  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check if it's a .sol file (basic check)
      if (!file.name.toLowerCase().endsWith(".sol")) {
        setError("Please upload a valid .sol file.");
        setFileName(null);
        event.target.value = ""; // Clear the input
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setContractCode(text);
        setError(null); // Clear errors on successful load
        setFileName(file.name); // Display file name
      };
      reader.onerror = () => {
        setError("Failed to read file.");
        setFileName(null);
      };
      reader.readAsText(file);
    } else {
      setFileName(null);
    }
    // Clear file input visually after selection (optional, allows re-uploading same file)
    // event.target.value = '';
  };

  // Handle clearing the text area
  const handleClear = () => {
    setContractCode("");
    setError(null);
    setFileName(null);
    // Optionally clear the file input as well if needed
    const fileInput = document.getElementById(
      "contractFile"
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  return (
    // Use grid layout for better alignment
    <form onSubmit={handleSubmit} className="grid gap-6">
      {/* Code Editor Input */}
      <div className="grid gap-2">
        <Label htmlFor="code-editor">Paste Solidity Code:</Label>
        {/* Use react-simple-code-editor */}
        <div className="block w-full border border-input bg-background rounded-md shadow-sm focus-within:ring-1 focus-within:ring-ring h-60 overflow-auto text-sm font-mono code-editor-wrapper">
          <Editor
            id="code-editor"
            value={contractCode}
            onValueChange={(code) => {
              setContractCode(code);
              setFileName(null); // Clear filename if user types
            }}
            highlight={(code) =>
              Prism.highlight(code, Prism.languages.solidity, "solidity")
            }
            padding={12} // Corresponds to p-3 tailwind class
            style={{
              fontFamily: "var(--font-geist-mono), monospace",
              fontSize: 14, // text-sm
              minHeight: "100%", // Ensure editor fills the container height
              outline: "none", // Remove default outline
            }}
            disabled={isLoading}
            placeholder={`// Example:\npragma solidity ^0.8.0;\n\ncontract MyContract {\n    // ...\n}`}
            className="caret-foreground"
          />
        </div>
      </div>

      {/* File Upload */}
      <div className="grid gap-2">
        <Label htmlFor="contractFile">Or Upload .sol File:</Label>
        <div className="flex items-center gap-2">
          <Input
            id="contractFile"
            type="file"
            accept=".sol"
            onChange={handleFileUpload}
            disabled={isLoading}
            className="flex-1 cursor-pointer file:cursor-pointer"
          />
          {/* Display filename or upload icon */}
          {fileName ? (
            <span
              className="text-sm text-muted-foreground flex items-center gap-1.5"
              title={fileName}
            >
              <FileText size={16} />
              <span className="truncate max-w-[150px]">{fileName}</span>
            </span>
          ) : (
            <Upload size={16} className="text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <Ban className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:justify-end sm:space-x-3 space-y-3 sm:space-y-0 pt-2">
        <Button
          type="button"
          variant="outline" // Use outline variant for Clear
          onClick={handleClear}
          disabled={isLoading}
          className="w-full sm:w-auto"
        >
          <X size={16} className="mr-2" /> Clear
        </Button>
        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
          {isLoading ? "Auditing..." : "Analyze Contract"}
        </Button>
      </div>
    </form>
  );
};

export default ContractSubmissionForm;

// Optional: Add some global styles if needed for the editor wrapper or theme
/*
Add to globals.css:
.code-editor-wrapper .npm__react-simple-code-editor__textarea:focus {
    outline: none !important;
    box-shadow: none !important;
}
*/
