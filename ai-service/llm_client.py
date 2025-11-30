import google.generativeai as genai
import os
from typing import Dict, List
import json

class LLMClient:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            print("WARNING: GEMINI_API_KEY not set. LLM features will fail.")
        else:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-1.5-flash')

    def generate_recommendation(self, user_profile: Dict, context_chunks: List[str], products: List[Dict]) -> str:
        """
        Generates recommendations using Gemini based on user profile, policy context, and available products.
        """
        if not hasattr(self, 'model'):
            return json.dumps([])
        
        # Build product list for context
        product_context = "Available Insurance Products:\n"
        for idx, product in enumerate(products[:10], 1):  # Limit to top 10
            product_context += f"\n{idx}. {product.get('productName', 'Unknown')} by {product.get('vendorCompanyName', 'Unknown Vendor')}\n"
            product_context += f"   - Type: {product.get('category', 'N/A')}\n"
            product_context += f"   - Premium: {product.get('currency', 'BWP')} {product.get('monthlyPremium', 'N/A')}/month\n"
            product_context += f"   - Coverage: {product.get('coverageAmount', 'N/A')}\n"
            if product.get('description'):
                product_context += f"   - Description: {product.get('description')[:100]}...\n"

        # Build policy context from RAG
        policy_context = ""
        if context_chunks:
            policy_context = "Relevant Policy Details (Use this to justify recommendations):\n"
            for i, chunk in enumerate(context_chunks, 1):
                policy_context += f"Policy Excerpt {i}: {chunk}\n\n"
        
        prompt = f"""You are an insurance recommendation assistant for CoverBots, a Botswana-based insurance marketplace.

User Profile:
- Category Interest: {user_profile.get('category', 'General')}
- Age: {user_profile.get('age', 'N/A')}
- Monthly Income: BWP {user_profile.get('income', 'N/A')}
- Budget: BWP {user_profile.get('budget', 'N/A')}
- Dependents: {user_profile.get('dependents', '0')}
- Query: {user_profile.get('query', 'Looking for insurance')}

{policy_context}

{product_context}

Based on the user's profile, available products, AND the policy details provided above (if any), recommend the top 3 most suitable insurance products.
If policy details are present, explicitly mention how they apply to the user's situation in the "metRequirements" or "matchBreakdown".

For each recommendation, calculate a match score (0-100).

Return ONLY a JSON array with this exact structure (no additional text):
[
  {{
    "id": "product_id_from_list",
    "vendorName": "vendor company name",
    "productName": "product name",
    "score": 95,
    "premium": monthly_premium_amount,
    "currency": "BWP",
    "frequency": "Monthly",
    "tags": ["Feature 1", "Feature 2", "Feature 3"],
    "vendorEmail": "email if available",
    "vendorPhone": "phone if available",
    "matchBreakdown": {{
      "budgetFit": 90,
      "coverageMatch": 100,
      "vendorRating": 95
    }},
    "metRequirements": ["requirement they meet", "policy detail that helps"],
    "unmetRequirements": ["requirements they don't meet"]
  }}
]

If no products match well, return an empty array: []
"""
        
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"Error generating recommendation: {str(e)}")
            return json.dumps([])

    def score_compatibility(self, user_profile: Dict, product: Dict) -> Dict:
        """
        Calculate compatibility score (0-100) for a single product based on user profile.
        Returns: {"score": int, "reasoning": str}
        """
        if not hasattr(self, 'model'):
            return {"score": 0, "reasoning": "AI service unavailable"}
        
        prompt = f"""You are an insurance compatibility analyzer.

User Profile:
- Age: {user_profile.get('age', 'N/A')}
- Monthly Income: BWP {user_profile.get('income', 'N/A')}
- Budget: BWP {user_profile.get('budget', 'N/A')}
- Dependents: {user_profile.get('dependents', '0')}
- Category Interest: {user_profile.get('category', 'General')}
- Location: {user_profile.get('location', 'N/A')}

Insurance Product:
- Name: {product.get('name', 'Unknown')}
- Category: {product.get('category', 'N/A')}
- Monthly Premium: BWP {product.get('premium', 'N/A')}
- Description: {product.get('description', 'N/A')}
- Requirements: {', '.join(product.get('requirements', []))}

Calculate a compatibility score (0-100) based on:
1. Budget fit (premium vs user budget)
2. Category match (product category vs user interest)
3. Life stage appropriateness (age, dependents)
4. Affordability (premium vs income ratio)

Return ONLY a JSON object with this exact structure:
{{
  "score": 85,
  "reasoning": "High match: Fits budget (BWP 450 vs BWP 500 budget) and matches auto insurance interest. Suitable for your age group."
}}

Keep reasoning concise (1-2 sentences max).
"""

        try:
            response = self.model.generate_content(prompt)
            result_text = response.text.strip()
            
            # Try to parse JSON
            if result_text.startswith("```"):
                result_text = result_text.replace("```json", "").replace("```", "").strip()
            
            result = json.loads(result_text)
            return {
                "score": min(100, max(0, result.get("score", 0))),  # Clamp 0-100
                "reasoning": result.get("reasoning", "")[:200]  # Limit length
            }
        except Exception as e:
            print(f"Error scoring compatibility: {str(e)}")
            return {"score": 50, "reasoning": "Unable to calculate detailed compatibility"}
