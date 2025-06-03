"use client"; // This page uses client-side hooks (useState, useEffect)

import React, { useState } from "react";
import ContractSubmissionForm from "@/components/audit/ContractSubmissionForm";
import AuditResultsDisplay from "@/components/audit/AuditResultsDisplay";
import { submitAuditRequest } from "@/services/audit.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Import Card components
import { HeroSection } from "@/components/blocks/hero-section"; // Import the new Hero Section
import { Button } from "@/components/ui/button"; // Ensure Button is imported if used in actions

export default function Home() {
  // State for loading indicator during API call
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // State to store audit results received from backend
  const [auditResults, setAuditResults] = useState<any>(null);
  // State to store any errors during the process
  const [error, setError] = useState<string | null>(null);

  /**
   * Handles the form submission by calling the backend API.
   * @param code - The contract code submitted by the user.
   */
  const handleAuditSubmit = async (code: string) => {
    setIsLoading(true);
    setAuditResults(null); // Clear previous results
    setError(null); // Clear previous errors

    try {
      console.log("Sending code to backend...");
      const results = await submitAuditRequest(code);
      console.log("Received results from backend:", results);
      setAuditResults(results);
    } catch (err: any) {
      console.error("Audit submission failed:", err);
      setError(err.message || "An unknown error occurred during the audit.");
      setAuditResults(null); // Ensure results are cleared on error
    } finally {
      setIsLoading(false);
    }
  };

  // Define actions according to HeroAction interface
  const heroActions = [
    {
      text: "Start Auditing",
      href: "#audit-form-card", // Use fragment identifier for scrolling
      variant: "default" as const, // Explicitly type variant
    },
    {
      text: "Learn More",
      href: "#", // Placeholder href
      variant: "default" as const, // Changed from "outline" to satisfy HeroAction type
    },
  ];

  // Define placeholder image paths (replace with actual image paths if available)
  const heroImage = {
    light: "/placeholder-light.svg", // Example placeholder
    dark: "/placeholder-dark.svg", // Example placeholder
    alt: "Smart Contract Security Illustration",
  };

  return (
    <div className="flex flex-col items-center w-full">
      <HeroSection
        title="Secure Your Smart Contracts"
        description="Utilize AI-powered analysis and industry-standard tools like Slither to automatically detect vulnerabilities and ensure the security of your Solidity code."
        actions={heroActions}
        image={heroImage} // Pass the image object
      />

      <div
        id="audit-form-card"
        className="container relative z-10 mx-auto px-4 w-full max-w-3xl -mt-16 md:-mt-20 mb-12 md:mb-16 scroll-mt-20"
      >
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Submit Contract for Audit</CardTitle>
          </CardHeader>
          <CardContent>
            <ContractSubmissionForm
              onSubmit={handleAuditSubmit}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </div>

      <div className="container mx-auto px-4 w-full max-w-4xl mb-16">
        <AuditResultsDisplay
          results={auditResults}
          isLoading={isLoading}
          error={error}
        />
      </div>
    </div>
  );
}
