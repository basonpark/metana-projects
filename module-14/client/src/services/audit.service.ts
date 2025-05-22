// Base URL for the backend API
// Use environment variables in a real application
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Submits contract code to the backend for auditing.
 * 
 * @param code - The Solidity code string.
 * @returns A promise that resolves with the audit results from the backend.
 * @throws Will throw an error if the API request fails.
 */
export const submitAuditRequest = async (code: string): Promise<any> => {
    console.log("Submitting code to:", `${API_BASE_URL}/api/audit`);
    try {
        const response = await fetch(`${API_BASE_URL}/api/audit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code }),
        });

        if (!response.ok) {
            // Attempt to parse error message from backend if available
            let errorMessage = `API request failed with status ${response.status}`;
            try {
                const errorBody = await response.json();
                errorMessage = errorBody.message || errorMessage;
            } catch (e) {
                // Ignore if error body isn't valid JSON
            }
            throw new Error(errorMessage);
        }

        return await response.json(); // Parse the JSON response from the backend
    } catch (error) {
        console.error("Error submitting audit request:", error);
        // Re-throw the error to be handled by the calling component
        throw error; 
    }
}; 