import google.generativeai as genai
import os

class LLMClient:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            print("WARNING: GEMINI_API_KEY not set. LLM features will fail.")
        else:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-flash-latest')

    def generate_recommendation(self, user_profile: dict, context_chunks: list) -> str:
        """
        Generates a recommendation using Gemini based on context.
        """
        if not hasattr(self, 'model'):
            return "Error: LLM not configured (Missing API Key)."

        context_text = "\n\n".join(context_chunks)
        
        prompt = f"""
        You are an expert insurance advisor for CoverBots.
        
        USER PROFILE:
        {user_profile}
        
        RELEVANT POLICY CLAUSES (CONTEXT):
        {context_text}
        
        TASK:
        Based ONLY on the provided context and the user's profile, recommend the best matching policies.
        
        OUTPUT FORMAT:
        Return a valid JSON array of objects. Do not include markdown formatting (like ```json).
        Each object must have:
        - id: number
        - vendorName: string (infer from context or use generic name)
        - productName: string
        - score: number (0-100 match score)
        - premium: number (estimated monthly premium in BWP)
        - currency: "BWP"
        - frequency: "Monthly"
        - tags: array of strings (key benefits)
        - matchBreakdown: object { budgetFit: number, coverageMatch: number, vendorRating: number }
        
        Example:
        [
            {
                "id": 1,
                "vendorName": "Example Insure",
                "productName": "Gold Cover",
                "score": 95,
                "premium": 500,
                "currency": "BWP",
                "frequency": "Monthly",
                "tags": ["Low Excess"],
                "matchBreakdown": { "budgetFit": 90, "coverageMatch": 100, "vendorRating": 95 }
            }
        ]
        """
        
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"Error generating recommendation: {str(e)}"
