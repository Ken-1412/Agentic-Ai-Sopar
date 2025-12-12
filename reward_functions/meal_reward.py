import re
from typing import Optional, List, Dict, Any
import torch

class MealRewardFunction:
    """Custom reward function for SAPOR meal planning GRPO training."""
    
    def __init__(self):
        self.pattern = re.compile(
            r"\*\*Recommendation:\*\*\s*(.+?)\n.*?"
            r"\*\*Calories:\*\*\s*(\d+).*?"
            r"\*\*Protein:\*\*\s*(\d+)g.*?"
            r"\*\*Budget:\*\*\s*\$([0-9.]+)",
            re.DOTALL
        )
    
    def __call__(
        self,
        prompts: List[str],
        completions: List[str],
        **kwargs
    ) -> List[float]:
        """
        Calculate rewards for meal recommendations.
        
        Args:
            prompts: List of prompts
            completions: List of model completions
            **kwargs: Additional metadata (diet, budget, etc.)
        
        Returns:
            List of reward scores (0.0-1.0)
        """
        rewards = []
        
        for completion, prompt in zip(completions, prompts):
            reward = self._calculate_reward(completion, prompt)
            rewards.append(reward)
        
        return torch.tensor(rewards, dtype=torch.float32)
    
    def _calculate_reward(self, completion: str, prompt: str) -> float:
        """Calculate single reward score."""
        match = self.pattern.search(completion)
        
        if not match:
            return 0.0  # No valid format = 0 reward
        
        meal, calories, protein, budget = match.groups()
        
        # Base reward for valid format
        reward = 0.3
        
        try:
            calories = int(calories)
            protein = int(protein)
            budget = float(budget)
            
            # Reward for reasonable nutritional values
            if 200 <= calories <= 1000:
                reward += 0.2
            if 5 <= protein <= 100:
                reward += 0.2
            if budget > 0:
                reward += 0.3
            
            # Check if meal name is reasonable (not gibberish)
            if len(meal.split()) <= 5 and meal.isascii():
                reward += 0.0  # Already counted in format reward
        except (ValueError, IndexError):
            return 0.3  # Partial reward for valid format
        
        return min(reward, 1.0)


# Export reward function for Oumi
def meal_correctness(
    prompts: List[str],
    completions: List[str],
    **kwargs
) -> torch.Tensor:
    """Oumi-compatible reward function interface."""
    reward_fn = MealRewardFunction()
    return reward_fn(prompts, completions, **kwargs)
