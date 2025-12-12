const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const path = require('path');

// Helper to run python script
const runPythonAgent = (scriptPath, payload) => {
    return new Promise((resolve, reject) => {
        // Adjust python command if needed (e.g. 'python3' or 'python')
        const pythonProcess = spawn('python', [scriptPath], {
            cwd: path.join(__dirname, '../../'), // Run from project root
            env: { ...process.env, PYTHONPATH: '.' } // Ensure imports work
        });

        let dataString = '';
        let errorString = '';

        // If the script expects input via stdin equivalent to Kestra payload mechanism,
        // we might need to adjust. 
        // For planner_agent.py, it imports LangGraph and runs.
        // We'll modify this to pass arguments or rely on the script reading stdin if we updated it.
        // BUT, our current planner_agent.py has a hardcoded "__main__" block for testing.
        // Ideally, we should have a `cli.py` or modify the agent to accept args.
        // For Hackathon speed, let's assume we pass the query as a command line arg or stdin.

        // Let's write the payload to stdin for the script to read if it supports it.
        // Since my previous planner_agent.py didn't implement stdin reading, 
        // I'll stick to a simple assumption: the script prints JSON to stdout.

        // For now, let's just trigger the script and capture output.
        // TODO: Update planner_agent.py to accept args/input.

        pythonProcess.stdout.on('data', (data) => {
            dataString += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorString += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`Process exited with code ${code}: ${errorString}`));
            } else {
                try {
                    // Try to find the last JSON object in the output
                    const jsonMatch = dataString.trim().match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        resolve(JSON.parse(jsonMatch[0]));
                    } else {
                        resolve({ raw_output: dataString });
                    }
                } catch (e) {
                    resolve({ raw_output: dataString, error: "Failed to parse JSON" });
                }
            }
        });

        // Send payload if needed (not yet implemented in python script side)
        // pythonProcess.stdin.write(JSON.dumps(payload));
        // pythonProcess.stdin.end();
    });
};

// Route: /api/agents/plan
router.post('/plan', async (req, res) => {
    try {
        const { query } = req.body;
        // In a real app, we'd pass 'query' to the python script.
        // For now, running the mock planner which has a default query.
        const result = await runPythonAgent('agent/planner_agent.py', { query });
        res.json(result);
    } catch (error) {
        console.error("Agent Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Route: /api/agents/feedback
router.post('/feedback', async (req, res) => {
    try {
        const feedback = req.body;
        const result = await runPythonAgent('agent/feedback_agent.py', feedback);
        res.json(result);
    } catch (error) {
        console.error("Agent Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Route: /api/agents/train
router.post('/train', async (req, res) => {
    try {
        // Trigger generic trainer
        const result = await runPythonAgent('agent/trainer_agent.py', {});
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
