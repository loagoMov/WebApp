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

    def generate_recommendation(self, user_profile: Dict, context_chunks: List[str], products: List[Dict] = None) -> str:
        """
        Generates a recommendation using Gemini based on context.
        """
        if not hasattr(self, 'model'):
            return "Error: LLM not configured (Missing API Key)."

        context_text = "\n\n".join(context_chunks)
        
        products_context = ""
        if products:
            products_context = "CANDIDATE PRODUCTS (Use these for recommendations):\n"
            for p in products:
                reqs = ", ".join(p.get('requirements', []))
                products_context += f"- ID: {p.get('id')}, Name: {p.get('name')}, Vendor: {p.get('vendorId')}, Premium: {p.get('premium')}, Requirements: [{reqs}]\n"

        prompt = f"""
        You are an expert insurance advisor for CoverBots.
        
        USER PROFILE:
        {user_profile}
        
        {products_context}

        RELEVANT POLICY CLAUSES (CONTEXT):
        {context_text}
        
        TASK:
        1. Analyze the User Profile against the Candidate Products and their Requirements.
        2. Select the TOP 3 products that best match the user's needs and for which the user meets the requirements.
        3. If a user does NOT meet a requirement, you may still recommend it if it's a strong match, but mark the requirement as unmet.
        4. Use the Context to provide specific details about coverage.
        
        OUTPUT FORMAT:
        Return a valid JSON array of objects. Do not include markdown formatting (like ```json).
        Each object must have:
        - id: (product id)
        - vendorName: (vendor name)
        - productName: (product name)
        - score: (0-100 match score)
        - premium: (numeric)
        - currency: "BWP"
        - frequency: "Monthly"
        ]
        """
        
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"Error generating recommendation: {str(e)}"
