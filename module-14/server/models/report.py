from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Literal
import datetime

# --- Request Model ---

AuditType = Literal["basic", "standard", "comprehensive"]

class AuditRequest(BaseModel):
    contract_code: str = Field(..., description="The Solidity source code to be audited.")
    audit_type: AuditType = Field(..., description="The type of audit to perform: basic, standard, or comprehensive.")
    file_name: Optional[str] = Field(None, description="Optional name for the contract file (e.g., MyContract.sol)")

# --- Response Models ---

class StatSummary(BaseModel):
    critical: int = 0
    high: int = 0
    medium: int = 0
    low: int = 0
    informational: int = 0
    optimizations: int = 0

class Overview(BaseModel):
    summary: str = Field(..., description="A brief summary of the audit findings.")
    stats: StatSummary = Field(..., description="Counts of findings by severity.")

class Vulnerability(BaseModel):
    title: str
    severity: Literal["Critical", "High", "Medium", "Low", "Informational"]
    description: str
    location: str = Field(..., description="File and line number(s), e.g., 'contract.sol:10-15'")
    recommendation: str
    # Optional: Add fields for CWE, code snippets if needed

class CodeAnalysisFinding(BaseModel):
    type: str = Field(..., description="Category like 'Code Quality', 'Best Practice', 'Gas'")
    description: str
    location: str
    # Optional: Add severity if applicable

class GasOptimization(BaseModel):
    title: str
    impact: Literal["High", "Medium", "Low"]
    description: str
    location: str
    current_code: Optional[str] = Field(None, description="Snippet of the current code.")
    recommended_change: Optional[str] = Field(None, description="Snippet of the recommended change.")
    estimated_savings: Optional[str] = Field(None, description="Estimated gas savings.")

class AuditReport(BaseModel):
    audit_id: str = Field(..., description="Unique identifier for this audit report.")
    contract_name: str = Field(..., description="Name of the contract file audited.")
    audit_type: AuditType = Field(..., description="The type of audit performed.")
    timestamp: datetime.datetime = Field(default_factory=datetime.datetime.utcnow, description="Time the report was generated.")
    secure_score: int = Field(..., description="Calculated security score (0-100).", ge=0, le=100)
    overview: Overview = Field(..., description="Summary and statistics of the audit findings.")
    vulnerabilities: List[Vulnerability] = Field(default_factory=list, description="List of identified security vulnerabilities.")
    code_analysis: List[CodeAnalysisFinding] = Field(default_factory=list, description="List of code quality and best practice findings.")
    gas_optimizations: List[GasOptimization] = []
