import subprocess
import uuid
import os
import tempfile
import datetime
import json
import logging
from typing import Dict, Any, List
import openai
from dotenv import load_dotenv

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")
if not openai.api_key:
    print("Warning: OPENAI_API_KEY not found in .env file. AI analysis will fail.")

from models.report import (
    AuditReport,
    AuditRequest,
    Overview,
    StatSummary,
    Vulnerability,
    CodeAnalysisFinding,
    GasOptimization,
)

logger = logging.getLogger(__name__)

def parse_slither_output(json_output: Dict[str, Any], file_name: str) -> Dict[str, List[Dict[str, Any]]]:
    parsed_results: Dict[str, List[Dict[str, Any]]] = {
        "vulnerabilities": [],
        "gas_optimizations": [],
        "code_analysis": []
    }
    if not json_output or not json_output.get("success") or not json_output.get("results"):
        logger.warning("Slither JSON output missing expected structure.")
        return parsed_results

    detectors = json_output["results"].get("detectors", [])
    for finding in detectors:
        severity = finding.get("impact", "Informational").capitalize()
        location_elements = finding.get("elements", [])
        location_str = "N/A"
        if location_elements:
            first_loc = location_elements[0]
            loc_type = first_loc.get("type")
            lines = first_loc.get("source_mapping", {}).get("lines", [])
            line_str = f":{min(lines)}-{max(lines)}" if lines else ""
            location_str = f"{file_name}{line_str}"

        item = {
            "title": finding.get("check", "Unknown Finding"),
            "description": finding.get("description", "No description provided.").strip(),
            "location": location_str,
            "recommendation": finding.get("markdown", "N/A").strip()
        }

        check_lower = finding.get("check", "").lower()
        if "gas" in check_lower or "optimization" in check_lower:
            parsed_results["gas_optimizations"].append({
                "title": item["title"],
                "impact": severity,
                "description": item["description"],
                "location": item["location"],
                "estimated_savings": "Varies"
            })
        elif severity in ["High", "Medium", "Low", "Informational", "Critical"]:
            parsed_results["vulnerabilities"].append({
                "title": item["title"],
                "severity": severity,
                "description": item["description"],
                "location": item["location"],
                "recommendation": item["recommendation"]
            })
        else:
            parsed_results["code_analysis"].append({
                "type": "Slither Finding",
                "description": item["description"],
                "location": item["location"]
            })

    return parsed_results

def run_slither(file_path: str) -> Dict[str, Any]:
    logger.info(f"Running Slither on: {file_path}")
    command = ["slither", file_path, "--json", "-"]
    try:
        process = subprocess.run(command, capture_output=True, text=True, check=True, timeout=120)
        logger.info("Slither execution successful.")
        try:
            output_json = json.loads(process.stdout)
            return parse_slither_output(output_json, os.path.basename(file_path))
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Slither JSON output: {e}\nOutput was: {process.stdout[:500]}...", exc_info=True)
            return {"error": "Failed to parse Slither output"}

    except FileNotFoundError:
        logger.error("Slither command not found. Is it installed and in PATH?")
        raise
    except subprocess.CalledProcessError as e:
        logger.error(f"Slither execution failed with code {e.returncode}:\n{e.stderr}")
        return {"error": f"Slither failed: {e.stderr[:500]}..."}
    except subprocess.TimeoutExpired:
        logger.error("Slither execution timed out.")
        return {"error": "Slither execution timed out after 120 seconds."}
    except Exception as e:
        logger.error(f"An unexpected error occurred running Slither: {e}", exc_info=True)
        return {"error": f"Unexpected Slither error: {e}"}

def parse_mythril_output(json_output: Dict[str, Any], file_name: str) -> Dict[str, List[Dict[str, Any]]]:
    parsed_results: Dict[str, List[Dict[str, Any]]] = {"vulnerabilities": []}
    if not json_output or not json_output.get("success") or not json_output.get("issues"):
        logger.warning("Mythril JSON output missing expected structure.")
        return parsed_results

    for issue in json_output["issues"]:
        line_no = issue.get("lineno", "N/A")
        parsed_results["vulnerabilities"].append({
            "title": issue.get("title", "Unknown Mythril Finding"),
            "severity": issue.get("severity", "Informational").capitalize(),
            "description": issue.get("description", "N/A").strip(),
            "location": f"{file_name}:{line_no}",
            "recommendation": issue.get("description", "Review Mythril finding.").strip()
        })
    return parsed_results

def run_mythril(file_path: str) -> Dict[str, Any]:
    logger.info(f"Running Mythril on: {file_path}")
    command = ["myth", "analyze", file_path, "-o", "json"]
    try:
        process = subprocess.run(command, capture_output=True, text=True, timeout=300)

        if process.returncode != 0 and "No issues found" not in process.stderr and "exception" in process.stderr.lower():
            logger.error(f"Mythril execution failed with code {process.returncode}:\nSTDERR: {process.stderr}\nSTDOUT: {process.stdout}")
            return {"error": f"Mythril failed: {process.stderr[:500]}..."}

        logger.info(f"Mythril execution finished (Code: {process.returncode}). Attempting to parse output.")
        output_to_parse = process.stdout if process.stdout.strip().startswith('{') else process.stderr
        try:
            json_part = "{"+ output_to_parse.split('{', 1)[-1]
            output_json = json.loads(json_part)
            return parse_mythril_output(output_json, os.path.basename(file_path))
        except (json.JSONDecodeError, IndexError) as e:
            logger.error(f"Failed to parse Mythril JSON output: {e}\nOutput was: {output_to_parse[:500]}...", exc_info=True)
            if process.returncode == 0 and "No issues found" in (process.stdout + process.stderr):
                logger.info("Mythril found no issues.")
                return {"vulnerabilities": []}
            return {"error": "Failed to parse Mythril output"}

    except FileNotFoundError:
        logger.error("Mythril command ('myth') not found. Is it installed and in PATH?")
        raise
    except subprocess.TimeoutExpired:
        logger.error("Mythril execution timed out.")
        return {"error": "Mythril execution timed out after 300 seconds."}
    except Exception as e:
        logger.error(f"An unexpected error occurred running Mythril: {e}", exc_info=True)
        return {"error": f"Unexpected Mythril error: {e}"}

def run_ai_analysis(contract_code: str, file_name: str) -> Dict[str, Any]:
    if not openai.api_key:
        logger.warning("OpenAI API key not configured. Skipping AI analysis.")
        return {"error": "OpenAI API key not configured."}

    logger.info(f"Running OpenAI analysis on: {file_name}")

    prompt = f"""
Analyze the following Solidity smart contract code ({file_name}) for security vulnerabilities, code quality issues, and potential gas optimizations. 
Focus on providing actionable insights.

**Desired Output Format (Strict JSON):**
{{ "vulnerabilities": [ {{ "title": "Concise Title", "severity": "High | Medium | Low | Informational", "description": "Detailed explanation of the issue.", "recommendation": "Specific steps to fix.", "location": "contract.sol:line_number" }} ], "code_analysis": [ {{ "type": "Code Quality | Best Practice", "description": "Explanation of the quality/practice suggestion.", "recommendation": "How to improve.", "location": "contract.sol:line_number" }} ], "gas_optimizations": [ {{ "title": "Optimization Title", "impact": "High | Medium | Low", "description": "Explanation of the optimization.", "recommendation": "How to implement.", "location": "contract.sol:line_number" }} ] }}

**Contract Code:**
```solidity
{contract_code}
```

**Analysis (JSON Output Only):**
"""

    try:
        client = openai.OpenAI()
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            max_tokens=2000,
            response_format={"type": "json_object"}
        )

        ai_result_content = response.choices[0].message.content
        logger.info("OpenAI analysis successful.")

        try:
            parsed_output = json.loads(ai_result_content)

            if not all(k in parsed_output for k in ["vulnerabilities", "code_analysis", "gas_optimizations"]):
                logger.warning(f"OpenAI output missing expected keys. Got: {parsed_output.keys()}")
                return parsed_output

            for finding_list in parsed_output.values():
                for finding in finding_list:
                    if "location" in finding and ":" not in finding["location"]:
                        finding["location"] = f"{file_name}:{finding['location']}"
                    elif "location" not in finding:
                        finding["location"] = f"{file_name}:N/A"

            return parsed_output

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse OpenAI JSON response: {e}\nResponse was: {ai_result_content[:500]}...", exc_info=True)
            return {"error": "Failed to parse AI analysis output"}
        except Exception as e:
            logger.error(f"Error processing OpenAI response: {e}", exc_info=True)
            return {"error": f"Error processing AI analysis: {e}"}

    except openai.APIError as e:
        logger.error(f"OpenAI API error: {e}", exc_info=True)
        return {"error": f"OpenAI API error: {e}"}
    except Exception as e:
        logger.error(f"An unexpected error occurred during AI analysis: {e}", exc_info=True)
        return {"error": f"Unexpected AI analysis error: {e}"}

def generate_report(request: AuditRequest) -> AuditReport:
    report_id = str(uuid.uuid4())
    all_vulnerabilities: List[Vulnerability] = []
    all_gas_optimizations: List[GasOptimization] = []
    all_code_analysis: List[CodeAnalysisFinding] = []
    errors: List[str] = []

    temp_dir = './temp'
    os.makedirs(temp_dir, exist_ok=True)

    file_path = None
    contract_name = request.file_name or "contract.sol"

    try:
        with tempfile.NamedTemporaryFile(mode='w', suffix='.sol', dir=temp_dir, delete=False, encoding='utf-8') as tmp_file:
            tmp_file.write(request.contract_code)
            file_path = tmp_file.name
            contract_name_for_logging = request.file_name or os.path.basename(file_path)
            logger.info(f"Contract code written to temporary file: {file_path} for {contract_name_for_logging}")

        tool_results: Dict[str, Dict] = {}

        if request.audit_type in ["basic", "standard", "comprehensive"]:
            tool_results["slither"] = run_slither(file_path)
            if "error" in tool_results["slither"]:
                errors.append(f"Slither Error: {tool_results['slither']['error']}")
            else:
                all_vulnerabilities.extend([Vulnerability(**v) for v in tool_results["slither"].get("vulnerabilities", [])])
                all_gas_optimizations.extend([GasOptimization(**g) for g in tool_results["slither"].get("gas_optimizations", [])])
                all_code_analysis.extend([CodeAnalysisFinding(**c) for c in tool_results["slither"].get("code_analysis", [])])

        if request.audit_type in ["standard", "comprehensive"]:
            tool_results["mythril"] = run_mythril(file_path)
            if "error" in tool_results["mythril"]:
                errors.append(f"Mythril Error: {tool_results['mythril']['error']}")
            else:
                all_vulnerabilities.extend([Vulnerability(**v) for v in tool_results["mythril"].get("vulnerabilities", [])])

        if request.audit_type == "comprehensive":
            tool_results["ai"] = run_ai_analysis(request.contract_code, contract_name)
            if "error" in tool_results["ai"]:
                errors.append(f"AI Analysis Error: {tool_results['ai']['error']}")
            else:
                all_vulnerabilities.extend([Vulnerability(**v) for v in tool_results["ai"].get("vulnerabilities", [])])
                all_gas_optimizations.extend([GasOptimization(**g) for g in tool_results["ai"].get("gas_optimizations", [])])
                all_code_analysis.extend([CodeAnalysisFinding(**c) for c in tool_results["ai"].get("code_analysis", [])])

        stats = StatSummary(
            critical=sum(1 for v in all_vulnerabilities if v.severity == "Critical"),
            high=sum(1 for v in all_vulnerabilities if v.severity == "High"),
            medium=sum(1 for v in all_vulnerabilities if v.severity == "Medium"),
            low=sum(1 for v in all_vulnerabilities if v.severity == "Low"),
            informational=sum(1 for v in all_vulnerabilities if v.severity == "Informational"),
            optimizations=len(all_gas_optimizations)
        )

        summary = f"Audit ({request.audit_type}) complete for {contract_name}. Found {len(all_vulnerabilities)} potential vulnerabilities and {len(all_gas_optimizations)} gas optimizations."
        if stats.critical > 0:
            summary += f" CRITICAL ISSUES FOUND: {stats.critical}."
        elif stats.high > 0:
            summary += f" High severity issues found: {stats.high}."

        if errors:
            summary += " \nErrors occurred during analysis: " + "; ".join(errors)

        score = 100
        score -= stats.critical * 25
        score -= stats.high * 10
        score -= stats.medium * 5
        score -= stats.low * 2
        secure_score = max(0, score)

        overview = Overview(summary=summary, stats=stats)

        report = AuditReport(
            audit_id=report_id,
            contract_name=contract_name,
            audit_type=request.audit_type,
            secure_score=secure_score,
            overview=overview,
            vulnerabilities=all_vulnerabilities,
            code_analysis=all_code_analysis,
            gas_optimizations=all_gas_optimizations,
            timestamp=datetime.datetime.utcnow()
        )

        logger.info(f"Report generation complete for audit ID: {report_id}")
        return report

    except Exception as e:
        logger.error(f"Unexpected error during report generation: {e}", exc_info=True)
        raise
    finally:
        if file_path and os.path.exists(file_path):
            try:
                os.remove(file_path)
                logger.info(f"Successfully removed temporary file: {file_path}")
            except OSError as e:
                logger.error(f"Error removing temporary file {file_path}: {e}")
