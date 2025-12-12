import json
import os
from datetime import datetime

class FeedbackAgent:
    """
    Agent responsible for processing user feedback and updating datasets.
    """
    def __init__(self, dataset_path="datasets/meal_reasoning_train.jsonl"):
        self.dataset_path = dataset_path

    def process_feedback(self, feedback_data):
        """
        Ingest feedback and determine if dataset update is needed.
        feedback_data: { "user_query": str, "recommendation": str, "rating": int, "comment": str }
        """
        print(f"Processing feedback: {feedback_data}")
        
        # If feedback is positive (high rating), add to training data as a good example
        if feedback_data.get('rating', 0) >= 4:
            new_entry = self._format_as_training_example(feedback_data)
            self._append_to_dataset(new_entry)
            return {"status": "updated_dataset", "action": "added_positive_example"}
        
        # If feedback is negative, we might need a different strategy (e.g. RLHF correction),
        # for now we just log it.
        return {"status": "logged", "action": "negative_feedback_ignored_for_now"}

    def _format_as_training_example(self, data):
        """Convert feedback into Oumi/chat format."""
        return {
            "messages": [
                {"role": "user", "content": data['user_query']},
                {"role": "assistant", "content": data['recommendation']}
            ],
            "metadata": {
                "source": "user_feedback",
                "rating": data['rating'],
                "timestamp": datetime.now().isoformat()
            }
        }

    def _append_to_dataset(self, entry):
        """Append line to jsonl file."""
        with open(self.dataset_path, "a") as f:
            f.write(json.dumps(entry) + "\n")
        print(f"Appended new example to {self.dataset_path}")

if __name__ == "__main__":
    # Test run
    agent = FeedbackAgent()
    sample_feedback = {
        "user_query": "I want a cheap healthy lunch",
        "recommendation": "Grilled Chicken Salad ($8)",
        "rating": 5,
        "comment": "Perfect!"
    }
    print(agent.process_feedback(sample_feedback))
