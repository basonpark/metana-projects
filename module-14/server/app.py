from fastapi import FastAPI, HTTPException, Body
import logging
import sys
from models.report import AuditRequest, AuditReport
from core.audit import generate_report
import uvicorn
import subprocess

# --- Logging Configuration ---
# Configure logging to output to stdout
logging.basicConfig(
    level=logging.INFO, # Set the logging level (e.g., INFO, DEBUG)
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    stream=sys.stdout, # Direct logs to standard output
)
logger = logging.getLogger(__name__) # Get logger for this module
# ---------------------------

app = FastAPI(
    title="AI Smart Contract Auditor API",
    description="API for auditing Solidity smart contracts using Slither, Mythril, and AI.",
    version="0.1.0",
)

@app.post("/api/audit", response_model=AuditReport)
async def create_audit(request: AuditRequest = Body(...)):
    """
    Accepts Solidity code and an audit type, performs the audit, 
    and returns a structured report.
    """
    logger.info(f"Received audit request: type={request.audit_type}, file_name={request.file_name or 'N/A'}")
    
    try:
        # Basic validation
        if not request.contract_code.strip():
            raise HTTPException(status_code=400, detail="Contract code cannot be empty.")

        # Generate the report using the core audit logic
        report = generate_report(request)
        logger.info(f"Successfully generated report for audit ID: {report.audit_id}")
        return report
    except FileNotFoundError as e:
        # Specific handling if a tool command (like slither or myth) is not found
        logger.error(f"Audit tool command not found: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Audit tool command not found: {e}. Please ensure Slither and Mythril are installed and in the system's PATH."
        )
    except subprocess.CalledProcessError as e:
        logger.error(f"Audit tool execution failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Audit tool failed execution: {e.stderr or e.stdout or e}"
        )
    except Exception as e:
        # Catch any other unexpected errors during report generation
        logger.error(f"An unexpected error occurred during audit: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"An internal server error occurred during the audit process: {e}"
        )

@app.get("/health")
def health_check():
    return {"status": "ok"}

# To run the server (from the 'server' directory):
# uvicorn app:app --reload

if __name__ == "__main__":
    # Allows running with `python app.py` for simple testing, though uvicorn is preferred
    uvicorn.run(app, host="0.0.0.0", port=8000)
