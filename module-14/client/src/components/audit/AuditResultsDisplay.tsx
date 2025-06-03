import React, { useMemo } from "react";
// Import Shadcn UI components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  Info,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ShieldAlert,
  XCircle,
} from "lucide-react"; // Import icons

interface AuditResult {
  // Define the structure based on expected Slither (or other tool) output
  // This is a simplified placeholder based on the service example
  check: string;
  impact: string;
  confidence: string;
  description: string;
  // Add elements/source mapping details if needed for highlighting
}

interface AuditResultsDisplayProps {
  results: {
    success?: boolean;
    results?: { detectors?: AuditResult[] };
    message?: string;
  } | null;
  isLoading: boolean;
  error: string | null;
}

// Helper to get severity icon and color
const getSeverityInfo = (
  impact: string
): { Icon: React.ElementType; colorClass: string } => {
  switch (impact) {
    case "High":
      return { Icon: AlertCircle, colorClass: "text-red-600" };
    case "Medium":
      return { Icon: AlertTriangle, colorClass: "text-yellow-600" };
    case "Low":
      return { Icon: ShieldAlert, colorClass: "text-blue-600" };
    case "Informational":
      return { Icon: Info, colorClass: "text-gray-600" };
    default:
      return { Icon: Info, colorClass: "text-gray-500" };
  }
};

const AuditResultsDisplay: React.FC<AuditResultsDisplayProps> = ({
  results,
  isLoading,
  error,
}) => {
  if (isLoading) {
    return (
      // Use Card for consistency
      <Card className="mt-8">
        <CardContent className="pt-6 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-lg font-medium text-muted-foreground">
            Auditing in progress...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      // Use Alert component
      <Alert variant="destructive" className="mt-8">
        <XCircle className="h-5 w-5" />
        <AlertTitle>Audit Failed</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!results) {
    return null;
  }

  if (
    !results.success ||
    !results.results?.detectors ||
    results.results.detectors.length === 0
  ) {
    return (
      // Use Alert component with success variant
      <Alert variant="default" className="mt-8 border-green-500 text-green-700">
        <CheckCircle2 className="h-5 w-5 text-green-600" />
        <AlertTitle className="text-green-700">Audit Complete</AlertTitle>
        <AlertDescription className="text-green-600">
          {results.message || "No potential issues found."}
        </AlertDescription>
      </Alert>
    );
  }

  const findings = results.results.detectors;

  // Simple severity sorting (can be more sophisticated)
  const sortedFindings = useMemo(() => {
    // Sort inside useMemo to optimize
    return [...findings].sort((a, b) => {
      // Define the type for severity keys explicitly
      type Severity = "High" | "Medium" | "Low" | "Informational";
      const severityOrder: Record<Severity, number> = {
        High: 1,
        Medium: 2,
        Low: 3,
        Informational: 4,
      }; // Lower number = higher priority

      // Helper function to get severity order (avoids repeating logic)
      const getSeverityOrder = (impact: string): number => {
        return severityOrder[impact as Severity] || 99;
      };

      // Cast impact strings to Severity type for safe indexing
      const severityA = getSeverityOrder(a.impact);
      const severityB = getSeverityOrder(b.impact);
      return severityA - severityB;
    });
  }, [findings]); // Recalculate sort only when findings change

  return (
    // Use Card component for the main report
    <Card className="mt-8 w-full">
      <CardHeader>
        <CardTitle className="text-xl md:text-2xl">Audit Report</CardTitle>
        {/* Optionally add CardDescription here */}
      </CardHeader>
      <CardContent>
        {/* Summary Section */}
        <AuditSummary findings={findings} />
        <Separator className="my-6" />

        {/* Display sorted findings */}
        <div className="space-y-5">
          {sortedFindings.map((finding, index) => {
            const { Icon, colorClass } = getSeverityInfo(finding.impact);
            return (
              <div key={index}>
                <h4
                  className={`flex items-center text-lg font-medium mb-1.5 ${colorClass}`}
                >
                  <Icon size={18} className="mr-2 flex-shrink-0" />
                  {finding.check} ({finding.impact} Impact)
                </h4>
                <p className="text-sm text-muted-foreground ml-7 mb-2">
                  {finding.description}
                </p>
                {/* TODO: Add code snippet highlighting based on finding.elements */}
                {/* <pre className="bg-muted p-2 rounded text-xs overflow-x-auto ml-7">
                           <code>Code snippet here...</code>
                         </pre> */}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Component to display the summary of audit findings.
 */
const AuditSummary: React.FC<{ findings: AuditResult[] }> = ({ findings }) => {
  const summary = useMemo(() => {
    const counts = { High: 0, Medium: 0, Low: 0, Informational: 0 };
    findings.forEach((finding) => {
      switch (finding.impact) {
        case "High":
          counts.High++;
          break;
        case "Medium":
          counts.Medium++;
          break;
        case "Low":
          counts.Low++;
          break;
        case "Informational":
          counts.Informational++;
          break;
        default:
          break; // Handle unexpected impact values if needed
      }
    });
    return counts;
  }, [findings]); // Recalculate only when findings change

  const totalFindings = findings.length;

  return (
    // Slightly adjust styles for consistency
    <div className="p-4 bg-muted/50 rounded-md border">
      <h4 className="text-md font-semibold mb-2 text-foreground">
        Summary ({totalFindings} {totalFindings === 1 ? "Finding" : "Findings"}
        ):
      </h4>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <span className="text-red-600 font-medium flex items-center">
          <AlertCircle size={14} className="mr-1" /> High: {summary.High}
        </span>
        <span className="text-yellow-600 font-medium flex items-center">
          <AlertTriangle size={14} className="mr-1" /> Medium: {summary.Medium}
        </span>
        <span className="text-blue-600 font-medium flex items-center">
          <ShieldAlert size={14} className="mr-1" /> Low: {summary.Low}
        </span>
        <span className="text-muted-foreground font-medium flex items-center">
          <Info size={14} className="mr-1" /> Info: {summary.Informational}
        </span>
      </div>
    </div>
  );
};

export default AuditResultsDisplay;
