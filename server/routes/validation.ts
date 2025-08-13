import { Request, Response } from "express";
import * as fs from "fs";
import * as path from "path";

export async function handleInstructionValidation(req: Request, res: Response) {
  try {
    const data = req.body;
    const action = data.action;
    
    if (!action) {
      return res.status(400).json({
        status: 'error',
        message: 'Action is required'
      });
    }
    
    if (action === "fetch_initial_prompt") {
      const initialPromptFilePath = path.join(process.cwd(), "prompts/instruction_validator/initial_prompt.txt");
      
      if (!fs.existsSync(initialPromptFilePath)) {
        return res.status(404).json({
          status: 'error',
          message: `Initial prompt file for ${action} not found`
        });
      }
      
      const initialPrompt = fs.readFileSync(initialPromptFilePath, 'utf8');
      
      const examplesFilePath = path.join(process.cwd(), "prompts/instruction_validator/examples.txt");
      let examples = "";
      
      if (fs.existsSync(examplesFilePath)) {
        examples = fs.readFileSync(examplesFilePath, 'utf8');
      }
      
      return res.json({
        status: 'success',
        initial_prompt: initialPrompt,
        examples: examples
      });
    }
    
    else if (action === "validate_instruction") {
      const initialPrompt = data.initial_prompt || '';
      const examples = data.examples || '';
      const policy = data.policy || '';
      const instruction = data.instruction || '';
      const model = data.model || '';
      
      if (!initialPrompt || !policy) {
        return res.status(400).json({
          status: 'error',
          message: 'Initial prompt and policy are required'
        });
      }
      
      const prompt = initialPrompt.replace('{policy}', policy)
                                 .replace('{instruction}', instruction)
                                 .replace('{examples}', examples || "");
      
      try {
        // Call Claude API (you'll need to implement this function)
        const validationResult = await callClaude(prompt, model);
        
        return res.json({
          status: 'success',
          validation_result: validationResult
        });
      } catch (error) {
        return res.status(500).json({
          status: 'error',
          message: `Failed to validate instruction: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    }
    
    else {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid action'
      });
    }

  } catch (error) {
    console.error('Error in handleInstructionValidation:', error);
    return res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Validation failed'
    });
  }
}

// Placeholder for Claude API call - you'll need to implement this
async function callClaude(prompt: string, model: string): Promise<string> {
  // This is a placeholder implementation
  // You'll need to implement the actual Claude API call here
  // For now, return a mock response
  return `Mock validation result for prompt: ${prompt.substring(0, 100)}...

This is a simulated Claude response for instruction validation.

**Analysis:**
- The instruction appears to be well-structured
- Clear action verbs are present
- Output format could be more specific

**Recommendations:**
1. Consider adding more specific examples
2. Define the expected output format more clearly
3. Add constraints to guide the response

**Overall Assessment:** The instruction is acceptable but could benefit from the improvements mentioned above.`;
}

export async function handleTaskValidation(req: Request, res: Response) {
  try {
    const { taskData } = req.body;

    if (!taskData) {
      return res.status(400).json({
        status: 'error',
        message: 'Task data is required'
      });
    }

    // Simple task validation - placeholder implementation
    return res.json({
      status: 'success',
      validation: {
        isValid: true,
        message: 'Task validation not implemented yet'
      }
    });

  } catch (error) {
    console.error('Error in handleTaskValidation:', error);
    return res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Task validation failed'
    });
  }
}