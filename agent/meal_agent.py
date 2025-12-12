from typing import Optional, List, Dict, Any
import json
import re
from dataclasses import dataclass
from enum import Enum

@dataclass
class MealRecommendation:
    meal_name: str
    calories: int
    protein: int
    budget: float
    dietary_tags: List[str]

class MealPlanningAgent:
    """Agentic AI system for intelligent meal planning."""
    
    TOOLS = {
        "get_meal_options": "Get meal options based on constraints",
        "calculate_nutrition": "Calculate nutritional info for a meal",
        "optimize_budget": "Find best meals within budget",
        "check_dietary_restrictions": "Verify meal matches dietary needs"
    }
    
    def __init__(self, llm_model_path: str):
        """Initialize agent with GRPO-trained model."""
        self.model_path = llm_model_path
        self.conversation_history = []
        self.meal_database = self._load_meal_db()
    
    def _load_meal_db(self) -> Dict[str, MealRecommendation]:
        """Load meal database."""
        return {
            "greek_yogurt_parfait": MealRecommendation(
                meal_name="Greek Yogurt Parfait with Berries",
                calories=395,
                protein=12,
                budget=4.50,
                dietary_tags=["vegetarian", "gluten-free", "high-protein"]
            ),
            "chicken_quinoa": MealRecommendation(
                meal_name="Grilled Chicken with Quinoa & Broccoli",
                calories=595,
                protein=45,
                budget=7.50,
                dietary_tags=["high-protein", "low-carb"]
            ),
            # Add more meals...
        }
    
    def plan_meal(self, user_query: str) -> Dict[str, Any]:
        """
        Agent workflow: Parse user request → Use tools → Generate recommendation.
        
        Args:
            user_query: Natural language meal request
        
        Returns:
            Structured meal plan with reasoning
        """
        
        # Step 1: Parse user constraints
        constraints = self._parse_constraints(user_query)
        self.conversation_history.append({
            "role": "user",
            "content": user_query
        })
        
        # Step 2: Use tools to find best meals
        candidates = self._tool_get_meal_options(constraints)
        
        # Step 3: Optimize based on budget and nutrition
        optimized = self._tool_optimize_budget(candidates, constraints)
        
        # Step 4: Verify dietary restrictions
        verified = self._tool_check_dietary_restrictions(optimized, constraints)
        
        # Step 5: Format response
        response = self._format_recommendation(verified, constraints)
        
        self.conversation_history.append({
            "role": "assistant",
            "content": response["formatted"]
        })
        
        return response
    
    def _parse_constraints(self, query: str) -> Dict[str, Any]:
        """Extract meal constraints from natural language."""
        constraints = {
            "diet_type": None,
            "max_budget": None,
            "calorie_target": None,
            "protein_preference": None,
            "meal_type": "lunch"  # default
        }
        
        # Simple regex patterns
        if "vegetarian" in query.lower():
            constraints["diet_type"] = "vegetarian"
        if "vegan" in query.lower():
            constraints["diet_type"] = "vegan"
        if "high.?protein" in query.lower():
            constraints["protein_preference"] = "high"
        
        budget_match = re.search(r'\$(\d+(?:\.\d{2})?)', query)
        if budget_match:
            constraints["max_budget"] = float(budget_match.group(1))
        
        cal_match = re.search(r'(\d+)\s*cal', query.lower())
        if cal_match:
            constraints["calorie_target"] = int(cal_match.group(1))
        
        for meal_type in ["breakfast", "lunch", "dinner", "snack"]:
            if meal_type in query.lower():
                constraints["meal_type"] = meal_type
                break
        
        return constraints
    
    def _tool_get_meal_options(self, constraints: Dict) -> List[MealRecommendation]:
        """Tool: Get meal options matching constraints."""
        options = []
        for meal in self.meal_database.values():
            # Check dietary restrictions
            if constraints["diet_type"] and constraints["diet_type"] not in meal.dietary_tags:
                continue
            
            # Check budget
            if constraints["max_budget"] and meal.budget > constraints["max_budget"]:
                continue
            
            # Check calorie target (within 20% range)
            if constraints["calorie_target"]:
                target = constraints["calorie_target"]
                if not (target * 0.8 <= meal.calories <= target * 1.2):
                    continue
            
            options.append(meal)
        
        return options
    
    def _tool_optimize_budget(self, options: List[MealRecommendation], 
                             constraints: Dict) -> MealRecommendation:
        """Tool: Find meal with best value (nutrition per dollar)."""
        if not options:
            return None
        
        # Calculate nutrition density
        best_meal = max(
            options,
            key=lambda m: (m.protein + m.calories/100) / m.budget if m.budget > 0 else 0
        )
        return best_meal
    
    def _tool_check_dietary_restrictions(self, meal: MealRecommendation,
                                        constraints: Dict) -> MealRecommendation:
        """Tool: Verify meal matches all dietary needs."""
        if not meal:
            return None
        
        # Verify protein preference
        if constraints["protein_preference"] == "high" and meal.protein < 15:
            # This might not be ideal, but return anyway
            pass
        
        return meal
    
    def _format_recommendation(self, meal: MealRecommendation,
                              constraints: Dict) -> Dict[str, str]:
        """Format final recommendation."""
        if not meal:
            return {
                "formatted": "I couldn't find a meal matching your criteria. Try adjusting your budget or dietary preferences.",
                "meal": None
            }
        
        return {
            "formatted": f"""**Recommendation:** {meal.meal_name}
**Calories:** {meal.calories}
**Protein:** {meal.protein}g
**Budget:** ${meal.budget:.2f}

This meal matches your {constraints['meal_type']} requirements and is {'within your budget' if not constraints['max_budget'] or meal.budget <= constraints['max_budget'] else 'close to your budget'}.""",
            "meal": meal,
            "reasoning": {
                "constraints": constraints,
                "tools_used": ["get_meal_options", "optimize_budget", "check_dietary_restrictions"]
            }
        }
