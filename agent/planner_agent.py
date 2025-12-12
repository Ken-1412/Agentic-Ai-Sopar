import os
import json
import random
from typing import TypedDict, Annotated, List, Dict, Any
from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage, AIMessage, BaseMessage
import operator

# Define the Agent State
class AgentState(TypedDict):
    messages: Annotated[List[BaseMessage], operator.add]
    constraints: Dict[str, Any]
    deals: List[Dict[str, Any]]
    candidates: List[Dict[str, Any]]
    final_plan: Dict[str, Any]

# Mock Tools / Functions

def parse_request(state: AgentState):
    """Extract constraints from the latest user message."""
    print("--- PARSE REQUEST ---")
    last_message = state['messages'][-1].content
    # Simple mock parsing logic
    constraints = {
        "budget": 15.0, # Default or extracted
        "mood": "neutral",
        "location": "unknown",
        "diet": []
    }
    
    if "vegetarian" in last_message.lower():
        constraints["diet"].append("vegetarian")
    if "happy" in last_message.lower():
        constraints["mood"] = "happy"
        
    return {"constraints": constraints}

def find_local_deals(state: AgentState):
    """Mock Google Maps / local api for deals."""
    print("--- FIND DEALS ---")
    # In reality, call Google Maps Places API here
    mock_deals = [
        {"place": "Green Garden", "item": "Veggie Wrap", "price": 5.0, "location": "123 Main St"},
        {"place": "Burger Joint", "item": "Cheeseburger", "price": 6.0, "location": "456 Elm St"}
    ]
    return {"deals": mock_deals}

def query_meal_db(state: AgentState):
    """Mock MongoDB query."""
    print("--- QUERY DB ---")
    # In reality, use pymongo
    mock_candidates = [
        {"name": "Home Salad", "cost": 3.0, "type": "vegetarian"},
        {"name": "Grilled Chicken", "cost": 5.0, "type": "non-vegetarian"}
    ]
    return {"candidates": mock_candidates}

def generate_plan(state: AgentState):
    """Synthesize deals and DB candidates into a plan."""
    print("--- GENERATE PLAN ---")
    constraints = state['constraints']
    deals = state['deals']
    candidates = state['candidates']
    
    plan = {
        "recommendation": "Mix of home and eating out",
        "meals": []
    }
    
    # Simple logic: Pick a deal if in budget, else home meal
    if deals and deals[0]['price'] <= constraints['budget']:
        plan['meals'].append(deals[0])
    else:
        plan['meals'].append(candidates[0])
        
    return {
        "final_plan": plan, 
        "messages": [AIMessage(content=json.dumps(plan, indent=2))]
    }

# Build the Graph
workflow = StateGraph(AgentState)

# Add Nodes
workflow.add_node("parse_request", parse_request)
workflow.add_node("find_deals", find_local_deals)
workflow.add_node("query_db", query_meal_db)
workflow.add_node("generate_plan", generate_plan)

# Define Edges
workflow.set_entry_point("parse_request")
workflow.add_edge("parse_request", "find_deals")
workflow.add_edge("find_deals", "query_db")
workflow.add_edge("query_db", "generate_plan")
workflow.add_edge("generate_plan", END)

# Compile
app = workflow.compile()

if __name__ == "__main__":
    import sys
    # Read query from args or use default
    user_query = "I want a cheap vegetarian lunch, feeling happy."
    
    # Run the graph
    inputs = {"messages": [HumanMessage(content=user_query)]}
    final_plan = None
    
    # Iterate through stream to get final state
    for output in app.stream(inputs):
        if 'generate_plan' in output:
            final_plan = output['generate_plan']['final_plan']
            
    # Print ONLY the final JSON for the controller to capture
    if final_plan:
        print(json.dumps(final_plan, indent=2))
    else:
        print(json.dumps({"error": "Failed to generate plan"}))
