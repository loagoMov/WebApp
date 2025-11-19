from typing import List, Dict, Any
import math

class RecommendationEngine:
    def __init__(self):
        # Weights configuration (could be loaded from DB/Config)
        self.weights = {
            "budget_fit": 0.3,
            "coverage_match": 0.3,
            "price_competitiveness": 0.2,
            "vendor_trust": 0.1,
            "exclusion_penalty": 0.1
        }

    def calculate_score(self, user_profile: Dict[str, Any], product: Dict[str, Any], category_products: List[Dict[str, Any]]) -> float:
        """
        Calculate a score (0-100) for a product based on user profile.
        """
        budget = float(user_profile.get("budget", 0))
        premium = float(product.get("premiumAmount", 0))
        
        # 1. Budget Fit
        if budget > 0:
            budget_fit = 1 - abs(premium - budget) / max(budget, premium)
            budget_fit = max(0, budget_fit) # Ensure non-negative
        else:
            budget_fit = 0.5 # Neutral if no budget specified

        # 2. Coverage Match (Simple tag matching for MVP)
        user_needs = set(user_profile.get("needs", [])) # e.g. ["Roadside Assist", "Family Cover"]
        product_tags = set(product.get("tags", []))
        if user_needs:
            match_count = len(user_needs.intersection(product_tags))
            coverage_match = match_count / len(user_needs)
        else:
            coverage_match = 0.5 # Neutral

        # 3. Price Competitiveness (Rank in category)
        prices = sorted([float(p.get("premiumAmount", 0)) for p in category_products])
        try:
            rank = prices.index(premium)
            price_competitiveness = 1 - (rank / len(prices))
        except ValueError:
            price_competitiveness = 0.5

        # 4. Vendor Trust (Placeholder)
        vendor_trust = 1.0 if product.get("vendorVerified", False) else 0.6

        # 5. Exclusion Penalty (Placeholder - check age limits)
        exclusion_penalty = 0
        user_age = int(user_profile.get("age", 30))
        min_age = int(product.get("minAge", 0))
        max_age = int(product.get("maxAge", 100))
        
        if user_age < min_age or user_age > max_age:
            exclusion_penalty = 1.0 # Heavy penalty for age mismatch

        # Calculate weighted score
        raw_score = (
            self.weights["budget_fit"] * budget_fit +
            self.weights["coverage_match"] * coverage_match +
            self.weights["price_competitiveness"] * price_competitiveness +
            self.weights["vendor_trust"] * vendor_trust -
            self.weights["exclusion_penalty"] * exclusion_penalty
        )

        return max(0, min(100, raw_score * 100))

    def rank_products(self, user_profile: Dict[str, Any], products: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        ranked_products = []
        for product in products:
            score = self.calculate_score(user_profile, product, products)
            # Add score breakdown for UI
            product_with_score = product.copy()
            product_with_score["score"] = round(score, 1)
            ranked_products.append(product_with_score)
        
        # Sort by score descending
        return sorted(ranked_products, key=lambda x: x["score"], reverse=True)
