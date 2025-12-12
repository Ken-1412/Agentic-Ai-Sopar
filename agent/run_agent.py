import argparse
import yaml
import time
import json
import os

def load_role(role_path):
    with open(role_path, 'r') as f:
        return yaml.safe_load(f)

def run_agent(role_file, task_description, context=None):
    role_config = load_role(role_file)
    role_name = role_config['name']
    
    print(f"🤖 [AGENT: {role_name}] Initializing...")
    print(f"📝 [TASK] {task_description}")
    
    # Simulate processing time based on task
    time.sleep(1) 
    
    print(f"💭 {role_name} is thinking...")
    # Simulation logic
    output = {
        "agent": role_name,
        "status": "success",
        "task": task_description,
        "result": f"Completed task: {task_description} using tools: {role_config['tools']}",
        "artifacts": []
    }
    
    if "data" in context:
        print(f"📂 Received context: {context['data']}")
        
    print(f"✅ [DONE] {role_name} finished.")
    
    # Output result as JSON for Kestra to pick up
    return json.dumps(output, indent=2)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--role", required=True, help="Path to role yaml file")
    parser.add_argument("--task", required=True, help="Task description")
    parser.add_argument("--context", help="JSON context string")
    
    args = parser.parse_args()
    
    ctx = {}
    if args.context:
        try:
            ctx = json.loads(args.context)
        except:
            pass
            
    result = run_agent(args.role, args.task, ctx)
    print(result) # Print to stdout for capture
