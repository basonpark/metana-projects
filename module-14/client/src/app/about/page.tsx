"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ShieldCheck,
  Code,
  TerminalSquare,
  FlaskConical,
  AlertTriangle,
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 md:mb-12">
        About the AI Smart Contract Auditor
      </h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            Our Mission
          </CardTitle>
          <CardDescription>
            Enhancing blockchain security through automated analysis.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            This tool provides an automated security analysis for Solidity smart
            contracts. Our goal is to help developers identify potential
            vulnerabilities and improve the overall security posture of their
            code before deployment.
          </p>
          <p>
            By leveraging powerful static analysis tools and providing clear,
            actionable results, we aim to make smart contract auditing more
            accessible and efficient.
          </p>
        </CardContent>
      </Card>

      <Separator className="my-8 md:my-12" />

      <h2 className="text-2xl md:text-3xl font-semibold text-center mb-8">
        How It Works
      </h2>

      <div className="grid md:grid-cols-3 gap-6 md:gap-8">
        {/* Step 1: Submission */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5 text-primary" />
              1. Code Submission
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            You paste your Solidity code directly into the editor or upload a
            `.sol` file. The code is securely sent to our backend for analysis.
          </CardContent>
        </Card>

        {/* Step 2: Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TerminalSquare className="h-5 w-5 text-primary" />
              2. Backend Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Our backend temporarily saves your code and runs it through
            industry-standard analysis tools. Currently, we primarily use{" "}
            <strong className="text-foreground">Slither</strong>, a leading
            static analysis framework for Solidity.
          </CardContent>
        </Card>

        {/* Step 3: Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-primary" />
              3. Results Display
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            The findings from the analysis are processed and presented in a
            clear, categorized report, highlighting potential issues by severity
            (High, Medium, Low, Informational).
          </CardContent>
        </Card>
      </div>

      <Separator className="my-8 md:my-12" />

      <Card className="border-amber-300 bg-amber-50/50 dark:border-amber-700 dark:bg-amber-950/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
            <AlertTriangle className="h-5 w-5" />
            Important Considerations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-amber-800 dark:text-amber-400">
          <p>
            <strong className="text-amber-900 dark:text-amber-200">
              Limitations:
            </strong>{" "}
            Automated tools are powerful but cannot find all possible
            vulnerabilities. This tool should be used as part of a comprehensive
            security strategy, which may include manual code reviews and
            professional audits for critical contracts.
          </p>
          <p>
            <strong className="text-amber-900 dark:text-amber-200">
              Security:
            </strong>{" "}
            Your code is processed in temporary files on the backend, which are
            deleted after analysis. For enhanced security in production
            environments, execution should ideally occur within isolated
            sandboxes (e.g., Docker containers).
          </p>
          <p>
            <strong className="text-amber-900 dark:text-amber-200">
              Future Work:
            </strong>{" "}
            We plan to integrate more analysis tools (like Mythril) and
            potentially add support for auditing contracts directly from
            blockchain addresses.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
