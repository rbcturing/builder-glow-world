import { Request, Response } from "express";
import * as fs from "fs";
import * as path from "path";
import * as glob from "glob";

// Session storage for chain analyzer (in production, use proper session management)
const sessions = new Map<string, any>();

function getSessionId(req: Request): string {
  return req.headers['x-session-id'] as string || 'default';
}

export async function handleLoadPython(req: Request, res: Response) {
  try {
    const { directory_path } = req.body;
    
    if (!directory_path) {
      return res.status(400).json({
        success: false,
        error: 'Directory path is required'
      });
    }

    const sessionId = getSessionId(req);
    
    // Mock implementation - in real app, this would use the FunctionAnalyzer from utils.py
    const { python_files, functions } = await loadPythonFilesFromDirectory(directory_path);
    
    // Store in session
    let session = sessions.get(sessionId) || {};
    session.python_files = python_files;
    session.functions = functions;
    sessions.set(sessionId, session);

    return res.json({
      success: true,
      python_files_count: Object.keys(python_files).length,
      functions_count: Object.keys(functions).length,
      functions: functions
    });

  } catch (error) {
    console.error('Error in handleLoadPython:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}

export async function handleLoadJson(req: Request, res: Response) {
  try {
    const { directory_path } = req.body;
    
    if (!directory_path) {
      return res.status(400).json({
        success: false,
        error: 'Directory path is required'
      });
    }

    const sessionId = getSessionId(req);
    
    const json_files = await loadJsonFilesFromDirectory(directory_path);
    
    // Store in session
    let session = sessions.get(sessionId) || {};
    session.json_files = json_files;
    sessions.set(sessionId, session);

    return res.json({
      success: true,
      json_files_count: Object.keys(json_files).length,
      json_files: Object.fromEntries(
        Object.entries(json_files).map(([name, data]: [string, any]) => [
          name, 
          { structure: data.structure }
        ])
      )
    });

  } catch (error) {
    console.error('Error in handleLoadJson:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}

export async function handleGetJsonData(req: Request, res: Response) {
  try {
    const { filename } = req.body;
    const sessionId = getSessionId(req);
    
    const session = sessions.get(sessionId);
    if (!session || !session.json_files) {
      return res.status(400).json({
        success: false,
        error: 'No JSON files loaded'
      });
    }

    if (!session.json_files[filename]) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    return res.json({
      success: true,
      data: session.json_files[filename].data
    });

  } catch (error) {
    console.error('Error in handleGetJsonData:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}

export async function handleAnalyzeChains(req: Request, res: Response) {
  try {
    const { starting_variable } = req.body;
    const sessionId = getSessionId(req);
    
    if (!starting_variable) {
      return res.status(400).json({
        success: false,
        error: 'Starting variable is required'
      });
    }

    const session = sessions.get(sessionId);
    if (!session || !session.functions) {
      return res.status(400).json({
        success: false,
        error: 'No functions loaded'
      });
    }

    // Mock chain analysis - in real app, this would use the FunctionAnalyzer logic
    const chains = generateMockChains(session.functions, starting_variable);

    return res.json({
      success: true,
      functions_count: Object.keys(session.functions).length,
      matching_functions: Object.keys(session.functions).slice(0, 10),
      chains_count: chains.length,
      chains: chains
    });

  } catch (error) {
    console.error('Error in handleAnalyzeChains:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}

export async function handleGetSessionInfo(req: Request, res: Response) {
  try {
    const sessionId = getSessionId(req);
    const session = sessions.get(sessionId) || {};

    return res.json({
      functions_count: Object.keys(session.functions || {}).length,
      json_files_count: Object.keys(session.json_files || {}).length,
      functions: session.functions || {},
      json_files: Object.fromEntries(
        Object.entries(session.json_files || {}).map(([name, data]: [string, any]) => [
          name, 
          { structure: data.structure }
        ])
      )
    });

  } catch (error) {
    console.error('Error in handleGetSessionInfo:', error);
    return res.status(500).json({
      functions_count: 0,
      json_files_count: 0,
      functions: {},
      json_files: {}
    });
  }
}

// Helper functions (mock implementations)
async function loadPythonFilesFromDirectory(directory_path: string) {
  // Mock implementation - returns sample Python functions
  const python_files = {
    "sample_function.py": "def sample_function(input_data): return processed_data"
  };

  const functions = {
    "SampleFunction": {
      name: "SampleFunction",
      args: ["input_data", "options"],
      returns: "processed_data",
      docstring: "Sample function for demonstration",
      body: "def sample_function(input_data, options): return processed_data",
      type: "class_invoke",
      outputs: ["processed_data", "metadata"]
    },
    "DataProcessor": {
      name: "DataProcessor", 
      args: ["raw_data"],
      returns: "clean_data",
      docstring: "Process and clean raw data",
      body: "def process_data(raw_data): return clean_data",
      type: "class_invoke",
      outputs: ["clean_data", "stats"]
    },
    "ResultAnalyzer": {
      name: "ResultAnalyzer",
      args: ["processed_data", "clean_data"],
      returns: "analysis",
      docstring: "Analyze processed results",
      body: "def analyze_results(processed_data, clean_data): return analysis",
      type: "class_invoke", 
      outputs: ["analysis", "insights", "recommendations"]
    }
  };

  return { python_files, functions };
}

async function loadJsonFilesFromDirectory(directory_path: string) {
  // Mock implementation - returns sample JSON files
  const json_files = {
    "sample_data.json": {
      data: {
        users: [
          { id: 1, name: "John Doe", email: "john@example.com" },
          { id: 2, name: "Jane Smith", email: "jane@example.com" }
        ],
        metadata: {
          total: 2,
          created: "2024-01-01"
        }
      },
      structure: {
        type: "dict",
        path: "root",
        keys: ["users", "metadata"],
        nested: {
          users: { type: "list", length: 2, item_type: "dict" },
          metadata: { type: "dict", keys: ["total", "created"] }
        }
      }
    },
    "config.json": {
      data: {
        api_endpoint: "https://api.example.com",
        timeout: 30,
        retry_count: 3,
        features: ["auth", "logging", "caching"]
      },
      structure: {
        type: "dict",
        path: "root", 
        keys: ["api_endpoint", "timeout", "retry_count", "features"]
      }
    }
  };

  return json_files;
}

function generateMockChains(functions: any, starting_variable: string) {
  // Mock chain generation - in real app, this would use the actual chain analysis logic
  const functionNames = Object.keys(functions);
  
  const chains = [
    {
      chain: ["SampleFunction", "DataProcessor", "ResultAnalyzer"],
      steps: [
        {
          input: starting_variable,
          function: "SampleFunction",
          all_required_inputs: ["input_data", "options"],
          other_inputs_needed: ["options"],
          outputs: ["processed_data", "metadata"],
          chosen_output: "processed_data"
        },
        {
          input: "processed_data",
          function: "DataProcessor", 
          all_required_inputs: ["raw_data"],
          other_inputs_needed: [],
          outputs: ["clean_data", "stats"],
          chosen_output: "clean_data"
        },
        {
          input: "clean_data",
          function: "ResultAnalyzer",
          all_required_inputs: ["processed_data", "clean_data"],
          other_inputs_needed: ["processed_data"],
          outputs: ["analysis", "insights", "recommendations"],
          chosen_output: "analysis"
        }
      ],
      description: `${starting_variable} → SampleFunction(processed_data) → DataProcessor(clean_data) → ResultAnalyzer(analysis)`,
      starting_variable: starting_variable,
      length: 3,
      confidence: 0.85,
      unique_variables: [starting_variable, "processed_data", "clean_data", "analysis"]
    },
    {
      chain: ["DataProcessor", "ResultAnalyzer"],
      steps: [
        {
          input: starting_variable,
          function: "DataProcessor",
          all_required_inputs: ["raw_data"],
          other_inputs_needed: [],
          outputs: ["clean_data", "stats"],
          chosen_output: "clean_data"
        },
        {
          input: "clean_data", 
          function: "ResultAnalyzer",
          all_required_inputs: ["processed_data", "clean_data"],
          other_inputs_needed: ["processed_data"],
          outputs: ["analysis", "insights", "recommendations"],
          chosen_output: "insights"
        }
      ],
      description: `${starting_variable} → DataProcessor(clean_data) → ResultAnalyzer(insights)`,
      starting_variable: starting_variable,
      length: 2,
      confidence: 0.72,
      unique_variables: [starting_variable, "clean_data", "insights"]
    }
  ];

  return chains;
}