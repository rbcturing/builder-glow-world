import { Request, Response } from "express";

interface ValidationRequest {
  instruction: string;
  environment?: string;
  interface?: string;
  taskType?: string;
}

interface ValidationResponse {
  isValid: boolean;
  score: number;
  feedback: string[];
  suggestions: string[];
  errors: string[];
}

export async function handleInstructionValidation(req: Request, res: Response) {
  try {
    const { instruction, environment, interface: interfaceNum, taskType }: ValidationRequest = req.body;

    if (!instruction || instruction.trim().length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Instruction text is required'
      });
    }

    // Perform validation checks
    const validation = validateInstruction(instruction, { environment, interface: interfaceNum, taskType });

    return res.json({
      status: 'success',
      validation
    });

  } catch (error) {
    console.error('Error in handleInstructionValidation:', error);
    return res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Validation failed'
    });
  }
}

function validateInstruction(instruction: string, context: { environment?: string, interface?: string, taskType?: string }): ValidationResponse {
  const feedback: string[] = [];
  const suggestions: string[] = [];
  const errors: string[] = [];
  let score = 100;

  // Check instruction length
  if (instruction.length < 20) {
    errors.push("Instruction is too short (minimum 20 characters)");
    score -= 20;
  } else if (instruction.length < 50) {
    feedback.push("Consider providing more detailed instructions");
    score -= 10;
  }

  if (instruction.length > 1000) {
    feedback.push("Instruction is quite long - consider breaking it down");
    score -= 5;
  }

  // Check for clarity indicators
  const clarityKeywords = ['clearly', 'specifically', 'exactly', 'precisely', 'step by step'];
  const hasClarityKeywords = clarityKeywords.some(keyword => 
    instruction.toLowerCase().includes(keyword)
  );
  
  if (!hasClarityKeywords) {
    suggestions.push("Consider adding clarity keywords like 'clearly', 'specifically', or 'exactly'");
    score -= 5;
  }

  // Check for action verbs
  const actionVerbs = ['analyze', 'classify', 'identify', 'extract', 'determine', 'evaluate', 'compare', 'summarize'];
  const hasActionVerbs = actionVerbs.some(verb => 
    instruction.toLowerCase().includes(verb)
  );

  if (!hasActionVerbs) {
    suggestions.push("Include clear action verbs to specify what needs to be done");
    score -= 10;
  }

  // Check for examples or context
  const hasExamples = instruction.toLowerCase().includes('example') || 
                     instruction.toLowerCase().includes('for instance') ||
                     instruction.toLowerCase().includes('such as');
  
  if (!hasExamples) {
    suggestions.push("Consider adding examples to clarify the expected output");
    score -= 5;
  }

  // Check for output format specification
  const hasOutputFormat = instruction.toLowerCase().includes('format') ||
                         instruction.toLowerCase().includes('structure') ||
                         instruction.toLowerCase().includes('json') ||
                         instruction.toLowerCase().includes('list') ||
                         instruction.toLowerCase().includes('table');

  if (!hasOutputFormat) {
    suggestions.push("Specify the expected output format (JSON, list, etc.)");
    score -= 10;
  }

  // Context-specific validations
  if (context.taskType) {
    switch (context.taskType.toLowerCase()) {
      case 'classification':
        if (!instruction.toLowerCase().includes('categor') && !instruction.toLowerCase().includes('class')) {
          feedback.push("For classification tasks, mention categories or classes");
          score -= 5;
        }
        break;
      case 'sentiment':
        if (!instruction.toLowerCase().includes('sentiment') && !instruction.toLowerCase().includes('emotion')) {
          feedback.push("For sentiment analysis, explicitly mention sentiment or emotions");
          score -= 5;
        }
        break;
      case 'extraction':
        if (!instruction.toLowerCase().includes('extract') && !instruction.toLowerCase().includes('find')) {
          feedback.push("For extraction tasks, use clear extraction verbs");
          score -= 5;
        }
        break;
    }
  }

  // Check for ambiguous language
  const ambiguousWords = ['maybe', 'perhaps', 'might', 'could be', 'possibly'];
  const hasAmbiguousLanguage = ambiguousWords.some(word => 
    instruction.toLowerCase().includes(word)
  );

  if (hasAmbiguousLanguage) {
    errors.push("Avoid ambiguous language - be definitive in instructions");
    score -= 15;
  }

  // Check for completeness
  const hasConstraints = instruction.toLowerCase().includes('only') ||
                        instruction.toLowerCase().includes('must') ||
                        instruction.toLowerCase().includes('should') ||
                        instruction.toLowerCase().includes('required');

  if (!hasConstraints) {
    suggestions.push("Add constraints or requirements to guide the response");
    score -= 5;
  }

  // Ensure score doesn't go below 0
  score = Math.max(0, score);

  // Determine if valid (score >= 70)
  const isValid = score >= 70 && errors.length === 0;

  // Add positive feedback for good instructions
  if (score >= 90) {
    feedback.push("Excellent instruction quality!");
  } else if (score >= 80) {
    feedback.push("Good instruction with minor improvements possible");
  } else if (score >= 70) {
    feedback.push("Acceptable instruction but could be enhanced");
  }

  return {
    isValid,
    score,
    feedback,
    suggestions,
    errors
  };
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

    // Validate task structure
    const validation = validateTaskStructure(taskData);

    return res.json({
      status: 'success',
      validation
    });

  } catch (error) {
    console.error('Error in handleTaskValidation:', error);
    return res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Task validation failed'
    });
  }
}

function validateTaskStructure(taskData: any): ValidationResponse {
  const feedback: string[] = [];
  const suggestions: string[] = [];
  const errors: string[] = [];
  let score = 100;

  // Required fields check
  const requiredFields = ['taskId', 'title', 'description', 'category'];
  for (const field of requiredFields) {
    if (!taskData[field] || taskData[field].toString().trim().length === 0) {
      errors.push(`Missing required field: ${field}`);
      score -= 20;
    }
  }

  // Task ID format validation
  if (taskData.taskId && !/^[A-Z]{2,4}-\d{3,4}$/.test(taskData.taskId)) {
    errors.push("Task ID should follow format: ABC-123 or ABCD-1234");
    score -= 10;
  }

  // Title validation
  if (taskData.title) {
    if (taskData.title.length < 10) {
      errors.push("Title is too short (minimum 10 characters)");
      score -= 10;
    }
    if (taskData.title.length > 100) {
      feedback.push("Title is quite long - consider shortening");
      score -= 5;
    }
  }

  // Description validation
  if (taskData.description) {
    if (taskData.description.length < 50) {
      errors.push("Description is too short (minimum 50 characters)");
      score -= 15;
    }
  }

  // JSON configuration validation
  if (taskData.jsonConfig) {
    try {
      const config = typeof taskData.jsonConfig === 'string' 
        ? JSON.parse(taskData.jsonConfig) 
        : taskData.jsonConfig;
      
      if (!config.task_type) {
        errors.push("JSON config missing task_type");
        score -= 10;
      }
      
      if (!config.instructions) {
        errors.push("JSON config missing instructions");
        score -= 10;
      }
      
      if (!config.examples || !Array.isArray(config.examples) || config.examples.length === 0) {
        errors.push("JSON config missing examples array");
        score -= 15;
      } else if (config.examples.length < 3) {
        suggestions.push("Consider adding more examples (minimum 3 recommended)");
        score -= 5;
      }
      
    } catch (e) {
      errors.push("Invalid JSON configuration format");
      score -= 20;
    }
  } else {
    errors.push("Missing JSON configuration");
    score -= 25;
  }

  // Priority validation
  const validPriorities = ['low', 'medium', 'high', 'urgent'];
  if (taskData.priority && !validPriorities.includes(taskData.priority.toLowerCase())) {
    errors.push("Invalid priority value");
    score -= 5;
  }

  // Category validation
  const validCategories = ['text-analysis', 'sentiment', 'classification', 'qa', 'dialogue', 'extraction'];
  if (taskData.category && !validCategories.includes(taskData.category.toLowerCase())) {
    suggestions.push("Consider using a standard category");
    score -= 3;
  }

  // Ensure score doesn't go below 0
  score = Math.max(0, score);

  const isValid = score >= 70 && errors.length === 0;

  if (score >= 90) {
    feedback.push("Excellent task structure!");
  } else if (score >= 80) {
    feedback.push("Good task structure with minor improvements possible");
  } else if (score >= 70) {
    feedback.push("Acceptable task structure but could be enhanced");
  }

  return {
    isValid,
    score,
    feedback,
    suggestions,
    errors
  };
}