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
        Based ONLY on the provided context and the user's profile, recommend the best course of action.
        Explain WHY this policy is a good or bad fit.
        If the context doesn't contain enough information, say so.
        """
        
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"Error generating recommendation: {str(e)}"
