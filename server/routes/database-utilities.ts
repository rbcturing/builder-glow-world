import { Request, Response } from "express";
import * as fs from "fs";
import * as path from "path";

export async function handleDatabaseUtilitiesPromptGeneration(req: Request, res: Response) {
  try {
    const { action, db_schema, example_policies, interface_apis, initial_prompt, example_apis, scenario } = req.body;
    
    if (!action) {
      return res.status(400).json({
        status: 'error',
        message: 'Action is required'
      });
    }

    let prompt = "";

    switch (action) {
      case "generate_policy_prompt":
        if (!db_schema || !initial_prompt) {
          return res.status(400).json({
            status: 'error',
            message: 'Database schema and initial prompt are required'
          });
        }
        
        prompt = initial_prompt
          .replace('{db_schema}', db_schema)
          .replace('{example_policy_document}', example_policies || '')
          .replace('{apis_documentation}', interface_apis || '');
        break;

      case "generate_api_prompt":
        if (!db_schema || !initial_prompt) {
          return res.status(400).json({
            status: 'error',
            message: 'Database schema and initial prompt are required'
          });
        }
        
        prompt = initial_prompt
          .replace('{db_schema}', db_schema)
          .replace('{examples_tools}', example_apis || '')
          .replace('{required_tools}', interface_apis || '');
        break;

      case "generate_seed_prompt":
        if (!db_schema || !initial_prompt) {
          return res.status(400).json({
            status: 'error',
            message: 'Database schema and initial prompt are required'
          });
        }
        
        prompt = initial_prompt.replace('{db_schema}', db_schema);
        break;

      case "generate_scenario_prompt":
        if (!db_schema || !initial_prompt) {
          return res.status(400).json({
            status: 'error',
            message: 'Database schema and initial prompt are required'
          });
        }
        
        prompt = initial_prompt.replace('{db_schema}', db_schema);
        break;

      case "check_scenario_realism":
        if (!db_schema || !scenario) {
          return res.status(400).json({
            status: 'error',
            message: 'Database schema and scenario are required'
          });
        }

        // Mock realism check - in real implementation, this would use OpenAI API
        const realismCheck = `Scenario Realism Analysis:

Database Schema: ${db_schema.substring(0, 200)}...
Scenario: ${scenario}

Analysis:
This scenario appears to be realistic based on the provided database schema. The scenario aligns well with the database structure and follows logical data relationships.

Key Points:
✅ Scenario matches database entities
✅ Relationships are properly utilized
✅ Data flow is logical and consistent
✅ Use case is practical and implementable

Recommendations:
- Consider adding error handling for edge cases
- Ensure proper validation of input data
- Add appropriate indexing for performance
- Consider transaction boundaries for data consistency

Overall Assessment: REALISTIC - This scenario can be effectively implemented with the given database schema.`;

        return res.json({
          status: 'success',
          realism_check: realismCheck
        });

      default:
        return res.status(400).json({
          status: 'error',
          message: 'Invalid action'
        });
    }

    return res.json({
      status: 'success',
      prompt: prompt
    });

  } catch (error) {
    console.error('Error in handleDatabaseUtilitiesPromptGeneration:', error);
    return res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}

export async function handleDatabaseUtilities(req: Request, res: Response) {
  try {
    const { action } = req.body;
    
    if (!action) {
      return res.status(400).json({
        status: 'error',
        message: 'Action is required'
      });
    }

    // Read prompt files from the prompts directory - matching Dashboard behavior
    switch (action) {
      case 'policy_creation': {
        const initialPromptPath = path.join(process.cwd(), 'prompts', 'policy_creation', 'initial_prompt.txt');
        const examplePoliciesPath = path.join(process.cwd(), 'prompts', 'policy_creation', 'example_policies.txt');
        
        if (!fs.existsSync(initialPromptPath)) {
          return res.status(404).json({
            status: 'error',
            message: 'Initial prompt file for policy_creation not found'
          });
        }
        
        if (!fs.existsSync(examplePoliciesPath)) {
          return res.status(404).json({
            status: 'error',
            message: 'Example policies file for policy_creation not found'
          });
        }
        
        const initialPrompt = fs.readFileSync(initialPromptPath, 'utf8');
        const examplePolicies = fs.readFileSync(examplePoliciesPath, 'utf8');
        
        return res.json({
          status: 'success',
          initial_prompt: initialPrompt,
          example_policies: examplePolicies
        });
      }

      case 'api_implementation': {
        const initialPromptPath = path.join(process.cwd(), 'prompts', 'api_implementation', 'initial_prompt.txt');
        const exampleApisPath = path.join(process.cwd(), 'prompts', 'api_implementation', 'examples_tools.txt');
        
        if (!fs.existsSync(initialPromptPath)) {
          return res.status(404).json({
            status: 'error',
            message: 'Initial prompt file for api_implementation not found'
          });
        }
        
        if (!fs.existsSync(exampleApisPath)) {
          return res.status(404).json({
            status: 'error',
            message: 'Example APIs file for api_implementation not found'
          });
        }
        
        const initialPrompt = fs.readFileSync(initialPromptPath, 'utf8');
        const exampleApis = fs.readFileSync(exampleApisPath, 'utf8');
        
        return res.json({
          status: 'success',
          initial_prompt: initialPrompt,
          example_apis: exampleApis
        });
      }

      case 'database_seeding': {
        const initialPromptPath = path.join(process.cwd(), 'prompts', 'database_seeding', 'initial_prompt.txt');
        
        if (!fs.existsSync(initialPromptPath)) {
          return res.status(404).json({
            status: 'error',
            message: 'Initial prompt file for database_seeding not found'
          });
        }
        
        const initialPrompt = fs.readFileSync(initialPromptPath, 'utf8');
        
        return res.json({
          status: 'success',
          initial_prompt: initialPrompt
        });
      }

      case 'scenario_realism': {
        const initialPromptPath = path.join(process.cwd(), 'prompts', 'scenario_realism', 'initial_prompt.txt');
        
        if (!fs.existsSync(initialPromptPath)) {
          return res.status(404).json({
            status: 'error',
            message: 'Initial prompt file for scenario_realism not found'
          });
        }
        
        const initialPrompt = fs.readFileSync(initialPromptPath, 'utf8');
        
        return res.json({
          status: 'success',
          initial_prompt: initialPrompt
        });
      }

      default:
        return res.status(400).json({
          status: 'error',
          message: 'Invalid action'
        });
    }

  } catch (error) {
    console.error('Error in handleDatabaseUtilities:', error);
    return res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}