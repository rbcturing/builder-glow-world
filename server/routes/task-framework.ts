import { Request, Response } from "express";
import * as fs from "fs";
import * as path from "path";
import * as ast from "acorn";

interface FunctionInfo {
  name: string;
  description: string;
  parameters: Record<string, any>;
  required: string[];
}

interface ToolsSession {
  environment?: string;
  interface?: string;
  imports_set?: string[];
  invoke_methods?: string[];
  actions?: Array<{ api_name: string; arguments: Record<string, any> }>;
  data?: Record<string, any>;
}

// Store session data (in production, use Redis or proper session management)
const sessions = new Map<string, ToolsSession>();

function getSessionId(req: Request): string {
  // Simple session ID generation - in production use proper session management
  return req.headers['x-session-id'] as string || 'default';
}

export async function handleChooseEnvInterface(req: Request, res: Response) {
  try {
    const sessionId = getSessionId(req);
    const { environment, interface: interfaceNum } = req.body;

    if (!environment || !interfaceNum) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing environment or interface data'
      });
    }

    let session = sessions.get(sessionId) || {};
    
    // Clear data if environment changed
    if (environment !== session.environment) {
      session.data = {};
    }

    session.environment = environment;
    session.interface = interfaceNum;

    // Load tools from environment/interface directory
    const ENVS_PATH = path.join(process.cwd(), "envs");
    const TOOLS_PATH = path.join(ENVS_PATH, environment, "tools");
    const INTERFACE_PATH = path.join(TOOLS_PATH, `interface_${interfaceNum}`);

    if (!fs.existsSync(INTERFACE_PATH)) {
      return res.status(404).json({
        status: 'error',
        message: `Interface path not found: ${INTERFACE_PATH}`
      });
    }

    const apiFiles = fs.readdirSync(INTERFACE_PATH);
    const invokeMethodsArray: string[] = [];
    const functionsInfo: FunctionInfo[] = [];
    const importsSet = new Set<string>();

    for (const apiFile of apiFiles) {
      if (apiFile.endsWith(".py") && !apiFile.startsWith("__")) {
        const filePath = path.join(INTERFACE_PATH, apiFile);
        try {
          const { functionInfo, invokeMethod, imports } = extractFileInfo(filePath);
          
          if (functionInfo && invokeMethod) {
            importsSet.add(...imports);
            const modifiedInvokeMethod = invokeMethod.replace("invoke", `${functionInfo.name}_invoke`);
            invokeMethodsArray.push(modifiedInvokeMethod);
            functionsInfo.push(functionInfo);
          }
        } catch (error) {
          console.error(`Error processing ${apiFile}:`, error);
        }
      }
    }



    session.imports_set = Array.from(importsSet);
    session.invoke_methods = invokeMethodsArray;
    session.actions = [];

    sessions.set(sessionId, session);

    res.json({
      status: 'success',
      message: 'Environment and interface selected successfully',
      functions_info: functionsInfo,
    });

  } catch (error) {
    console.error('Error in handleChooseEnvInterface:', error);
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}

export async function handleExecuteApi(req: Request, res: Response) {
  try {
    const sessionId = getSessionId(req);
    const session = sessions.get(sessionId);

    if (!session) {
      return res.status(400).json({
        status: 'error',
        message: 'No session found. Please select environment and interface first.'
      });
    }

    const { api_name, parameters = {}, environment } = req.body;

    if (!api_name) {
      return res.status(400).json({
        status: 'error',
        message: 'API name is required'
      });
    }

    // Load environment data
    const envToUse = environment || session.environment;
    if (envToUse) {
      const ENVS_PATH = path.join(process.cwd(), "envs");
      const DATA_PATH = path.join(ENVS_PATH, envToUse, "data");
      
      if (fs.existsSync(DATA_PATH)) {
        const dataFiles = fs.readdirSync(DATA_PATH);
        session.data = session.data || {};
        
        for (const dataFile of dataFiles) {
          if (dataFile.endsWith(".json")) {
            const dataFilePath = path.join(DATA_PATH, dataFile);
            const fileContent = fs.readFileSync(dataFilePath, 'utf8');
            const key = dataFile.split('.')[0];
            session.data[key] = JSON.parse(fileContent);
          }
        }
      }
    }

    // Process arguments
    const cleanedArguments = processArguments(parameters);

    // Execute previous actions in session
    if (session.actions) {
      for (const action of session.actions) {
        // Execute action (simplified - in real implementation, you'd execute the actual Python code)
        console.log('Executing session action:', action.api_name, action.arguments);
      }
    }

    // Execute the current API call
    const apiNameWithInvoke = `${api_name}_invoke`;
    
    // Here you would execute the actual Python method
    // For now, we'll return a mock response
    const result = {
      status: 'success',
      message: `Executed ${api_name} successfully`,
      data: cleanedArguments
    };

    // Add to session actions
    session.actions = session.actions || [];
    session.actions.push({
      api_name: apiNameWithInvoke,
      arguments: cleanedArguments
    });

    sessions.set(sessionId, session);

    res.json({
      output: result
    });

  } catch (error) {
    console.error('Error in handleExecuteApi:', error);
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Failed to execute API'
    });
  }
}

function extractFileInfo(filePath: string): { functionInfo: FunctionInfo | null, invokeMethod: string | null, imports: string[] } {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extract imports
    const imports: string[] = [];
    const importRegex = /^\s*(?:import\s+\w+|from\s+[\w\.]+\s+import\s+(?:\w+\s*,\s*)*\w+)/gm;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      if (!match[0].includes('tau_bench.envs.tool')) {
        imports.push(match[0].trim());
      }
    }

    // Extract class name
    const classMatch = content.match(/class\s+(\w+)(?:\([^)]*\))?:/);
    const className = classMatch ? classMatch[1] : null;

    if (!className) {
      return { functionInfo: null, invokeMethod: null, imports };
    }

    // Extract invoke method
    const invokeMethodMatch = content.match(/def\s+invoke.*?return[^]*?(?=\n\s*@)/s);
    const invokeMethod = invokeMethodMatch ? invokeMethodMatch[0] : null;

    // Extract get_info method and parse the return dictionary
    // Use a simpler pattern that works
    const getInfoMatch = content.match(/def\s+get_info.*?return\s+({.*?})\s*$/ms);
    let functionInfo: FunctionInfo | null = null;

    if (getInfoMatch) {
      try {
        // Extract the return dictionary string
        let returnDict = getInfoMatch[1];
        
        // Parse the function info directly from the return dictionary
        const nameMatch = returnDict.match(/"name":\s*"([^"]+)"/);
        const descMatch = returnDict.match(/"description":\s*"([^"]+)"/);
        
        if (nameMatch && descMatch) {
          const name = nameMatch[1];
          const description = descMatch[1];
          let parameters: Record<string, any> = {};
          let required: string[] = [];

          // Look for properties section and extract all properties
          const propertiesIndex = returnDict.indexOf('"properties":');
          if (propertiesIndex !== -1) {
            // Extract the entire properties section
            const afterProperties = returnDict.substring(propertiesIndex);
            
            // Use a more specific regex to match property definitions
            // This regex looks for "property_name": {"type": "...", "description": "..."}
            const propRegex = /"([a-zA-Z_][a-zA-Z0-9_]*)":\s*{\s*"type":\s*"([^"]+)",\s*"description":\s*"([^"]+)"/g;
            let propMatch;
            while ((propMatch = propRegex.exec(afterProperties)) !== null) {
              const propName = propMatch[1];
              const propType = propMatch[2];
              const propDesc = propMatch[3];
              
              // Skip if this is not a real property (e.g., "properties", "parameters", etc.)
              if (propName !== 'properties' && propName !== 'parameters' && propName !== 'type') {
                parameters[propName] = {
                  type: propType,
                  description: propDesc
                };
              }
            }
          }
          
          // Parse required fields
          const requiredMatch = returnDict.match(/"required":\s*\[([^\]]*)\]/);
          if (requiredMatch) {
            const requiredStr = requiredMatch[1];
            required = requiredStr.split(',').map(s => s.trim().replace(/["\s]/g, '')).filter(s => s);
          }

          functionInfo = {
            name,
            description,
            parameters,
            required
          };
        }
      } catch (parseError) {
        console.error(`Error parsing get_info for ${className}:`, parseError);
        console.error('Return dict:', getInfoMatch[1]);
      }
    }

    // Fallback to basic info if parsing failed
    if (!functionInfo) {
      functionInfo = {
        name: className,
        description: `Function from ${className}`,
        parameters: {},
        required: []
      };
    }

    return { functionInfo, invokeMethod, imports };

  } catch (error) {
    console.error(`Error extracting file info from ${filePath}:`, error);
    return { functionInfo: null, invokeMethod: null, imports: [] };
  }
}

function processArguments(args: Record<string, any>): Record<string, any> {
  const cleaned: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(args)) {
    if (value === '') continue;
    
    // Skip processing for ID fields
    if (key.toLowerCase().includes('id') || key.toLowerCase().includes('name')) {
      cleaned[key] = value;
      continue;
    }
    
    // Try to parse as literal
    try {
      if (typeof value === 'string') {
        if (value === 'true') cleaned[key] = true;
        else if (value === 'false') cleaned[key] = false;
        else if (!isNaN(Number(value))) cleaned[key] = Number(value);
        else cleaned[key] = value;
      } else {
        cleaned[key] = value;
      }
    } catch {
      cleaned[key] = value;
    }
  }
  
  return cleaned;
}