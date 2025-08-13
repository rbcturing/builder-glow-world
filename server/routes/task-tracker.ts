import { Request, Response } from "express";
import { google } from "googleapis";

// Google Sheets configuration - matching the original Python implementation
const SHEET_NAME = "Amazon Agentic - Automated Tracking";
const TASKS_WORKSHEET = "Automated Tracker";
const USERNAME_WORKSHEET = "Username-email mapping";
const TEAM_WORKSHEET = "Team Structure";

// Connect to Google Sheets - matching the original Python connect_to_sheets function
function connectToSheets() {
  const credentialsBase64 = process.env.CREDENTIAL_JSON_BASE64;
  
  if (!credentialsBase64) {
    throw new Error("Missing credential JSON environment variable.");
  }

  // Decode base64 to JSON string - same as Python implementation
  const jsonStr = Buffer.from(credentialsBase64, 'base64').toString('utf-8');
  const credentials = JSON.parse(jsonStr);

  // Create JWT client with the same scopes as Python
  const auth = new google.auth.JWT(
    credentials.client_email,
    undefined,
    credentials.private_key,
    [
      'https://spreadsheets.google.com/feeds',
      'https://www.googleapis.com/auth/drive'
    ]
  );

  return google.sheets({ version: 'v4', auth });
}

// Get sheet data - matching the original Python get_sheet_data function
async function getSheetData(sheetName: string, worksheetName: string): Promise<any[][]> {
  const sheets = connectToSheets();
  
  try {
    // First, find the spreadsheet by name (similar to gspread.open)
    const drive = google.drive({ version: 'v3', auth: sheets.auth });
    
    // Search for the spreadsheet by name
    const searchResponse = await drive.files.list({
      q: `name='${sheetName}' and mimeType='application/vnd.google-apps.spreadsheet'`,
      fields: 'files(id, name)',
      pageSize: 10
    });

    if (!searchResponse.data.files || searchResponse.data.files.length === 0) {
      throw new Error(`Spreadsheet '${sheetName}' not found. Make sure the service account has access to the sheet.`);
    }

    const spreadsheetId = searchResponse.data.files[0].id!;
    console.log(`Found spreadsheet: ${sheetName} with ID: ${spreadsheetId}`);

    // Get the worksheet data
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: worksheetName,
    });

    console.log(`Retrieved ${response.data.values?.length || 0} rows from ${worksheetName}`);
    return response.data.values || [];
  } catch (error) {
    console.error(`Error accessing sheet ${sheetName}/${worksheetName}:`, error);
    throw error;
  }
}

// Run function with timeout - matching the original Python run_with_timeout function
function runWithTimeout<T>(
  func: () => Promise<T>,
  timeoutSeconds: number = 15
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Function timed out after ${timeoutSeconds} seconds`));
    }, timeoutSeconds * 1000);

    func()
      .then(result => {
        clearTimeout(timeout);
        resolve(result);
      })
      .catch(error => {
        clearTimeout(timeout);
        reject(error);
      });
  });
}

// Convert sheet data to objects - matching the original Python logic
function convertSheetDataToObjects(sheetData: any[][]): Record<string, any>[] {
  if (!sheetData || sheetData.length === 0) {
    return [];
  }

  const headers = sheetData[0];
  const rows = sheetData.slice(1);

  const listOfObjects: Record<string, any>[] = [];
  
  for (const row of rows) {
    const rowDict: Record<string, any> = {};
    headers.forEach((header, index) => {
      rowDict[header] = row[index] || '';
    });
    listOfObjects.push(rowDict);
  }

  return listOfObjects;
}

export async function handleTaskTracker(req: Request, res: Response) {
  try {
    if (req.method === 'GET') {
      return res.json({
        status: 'success',
        message: 'Task tracker endpoint is working'
      });
    }

    if (req.method === 'POST') {
      // Fetch data from Google Sheets with timeout handling - matching Python implementation
      try {
        const tasksData = await runWithTimeout(
          () => getSheetData(SHEET_NAME, TASKS_WORKSHEET),
          15
        );
        
        const usernameData = await runWithTimeout(
          () => getSheetData(SHEET_NAME, USERNAME_WORKSHEET),
          15
        );
        
        const teamData = await runWithTimeout(
          () => getSheetData(SHEET_NAME, TEAM_WORKSHEET),
          15
        );

        // Convert sheet data to objects
        const tasksInfo = convertSheetDataToObjects(tasksData);
        const usernameMapping = convertSheetDataToObjects(usernameData);
        const teamStructure = convertSheetDataToObjects(teamData);

        return res.json({
          status: 'success',
          tasks_info: tasksInfo,
          username_email_mapping: usernameMapping,
          team_structure: teamStructure
        });

      } catch (sheetsError) {
        console.error('Google Sheets API error:', sheetsError);
        
        // Fallback to realistic mock data matching Dashboard structure
        const mockTasksData = generateMockTasksData();
        const mockUsernameMapping = generateMockUsernameMapping();
        const mockTeamStructure = generateMockTeamStructure();

        return res.json({
          status: 'success',
          tasks_info: mockTasksData,
          username_email_mapping: mockUsernameMapping,
          team_structure: mockTeamStructure,
          warning: 'Using fallback data due to Google Sheets connection issue'
        });
      }
    }

    return res.status(405).json({
      status: 'error',
      message: 'Method not allowed'
    });

  } catch (error) {
    console.error('Error in handleTaskTracker:', error);
    return res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}

export async function handleCreateTask(req: Request, res: Response) {
  try {
    const { taskId, title, assignedTo, priority, category, description, dueDate } = req.body;

    if (!taskId || !title || !assignedTo) {
      return res.status(400).json({
        status: 'error',
        message: 'Task ID, title, and assigned user are required'
      });
    }

    // Create new task object
    const newTask = {
      "Task ID": taskId,
      "Title": title,
      "Assigned To": assignedTo,
      "Status": "Created",
      "Priority": priority || "Medium",
      "Created Date": new Date().toISOString().split('T')[0],
      "Due Date": dueDate || "",
      "Category": category || "General",
      "Progress": "0%",
      "Description": description || ""
    };

    // TODO: In real implementation, this would append a new row to Google Sheets
    // For now, we'll just return success
    console.log('New task created:', newTask);

    return res.json({
      status: 'success',
      message: 'Task created successfully',
      task: newTask
    });

  } catch (error) {
    console.error('Error in handleCreateTask:', error);
    return res.status(500).json({
      status: 'error', 
      message: error instanceof Error ? error.message : 'Failed to create task'
    });
  }
}

export async function handleUpdateTaskStatus(req: Request, res: Response) {
  try {
    const { taskId, status, progress } = req.body;

    if (!taskId || !status) {
      return res.status(400).json({
        status: 'error',
        message: 'Task ID and status are required'
      });
    }

    // TODO: In real implementation, this would update the Google Sheets row
    // For now, we'll just return success with the updated task data
    const updatedTask = {
      "Task ID": taskId,
      "Status": status,
      "Progress": progress !== undefined ? `${progress}%` : "0%",
      "Updated Date": new Date().toISOString().split('T')[0]
    };

    console.log('Task updated:', updatedTask);

    return res.json({
      status: 'success',
      message: 'Task updated successfully',
      task: updatedTask
    });

  } catch (error) {
    console.error('Error in handleUpdateTaskStatus:', error);
    return res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Failed to update task'
    });
  }
}

// Generate realistic mock data matching Dashboard structure
function generateMockTasksData() {
  const domains = ['finance', 'healthcare', 'technology', 'education', 'retail'];
  const interfaces = ['1', '2', '3', '4', '5'];
  const weeks = ['week_1', 'week_2', 'week_3', 'week_4'];
  const complexities = ['medium', 'hard', 'expert'];
  const statuses = ['Merged', 'pending review', 'needs changes', 'ready to merge', 'resubmitted', 'discarded'];
  const calibrators = ['Alice Johnson', 'Bob Smith', 'Carol Davis', 'David Wilson'];
  const pods = ['Pod Alpha', 'Pod Beta', 'Pod Gamma', 'Pod Delta'];
  const usernames = ['john_doe', 'jane_smith', 'mike_chen', 'sarah_wilson', 'alex_brown', 'emma_davis', 'tom_johnson', 'lisa_garcia'];

  const tasks = [];
  
  // Generate 274 tasks to match Dashboard
  for (let i = 1; i <= 274; i++) {
    const taskId = `TSK-${String(i).padStart(3, '0')}`;
    const username = usernames[Math.floor(Math.random() * usernames.length)];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    const interface_ = interfaces[Math.floor(Math.random() * interfaces.length)];
    const week = weeks[Math.floor(Math.random() * weeks.length)];
    const complexity = complexities[Math.floor(Math.random() * complexities.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const calibrator = calibrators[Math.floor(Math.random() * calibrators.length)];
    const pod = pods[Math.floor(Math.random() * pods.length)];
    
    // Generate a date within the last 30 days
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    
    tasks.push({
      "Task ID": taskId,
      "GitHub username": username,
      "Week num": week,
      "Created Date (completed)": date.toISOString().split('T')[0],
      "Pull Request Status": status,
      "Complexity": complexity,
      "Domain": domain,
      "Interface": interface_,
      "Lead": pod,
      "Calibrator": calibrator,
      "Title": `Task ${i} - ${domain} analysis`,
      "Description": `Analysis task for ${domain} domain using interface ${interface_}`
    });
  }
  
  return tasks;
}

function generateMockUsernameMapping() {
  return [
    {
      "Username": "john_doe",
      "Email": "john.doe@company.com",
      "Full Name": "John Doe",
      "Role": "Senior Trainer"
    },
    {
      "Username": "jane_smith",
      "Email": "jane.smith@company.com",
      "Full Name": "Jane Smith",
      "Role": "ML Engineer"
    },
    {
      "Username": "mike_chen",
      "Email": "mike.chen@company.com",
      "Full Name": "Mike Chen",
      "Role": "Data Scientist"
    },
    {
      "Username": "sarah_wilson",
      "Email": "sarah.wilson@company.com",
      "Full Name": "Sarah Wilson",
      "Role": "Senior Trainer"
    },
    {
      "Username": "alex_brown",
      "Email": "alex.brown@company.com",
      "Full Name": "Alex Brown",
      "Role": "ML Engineer"
    },
    {
      "Username": "emma_davis",
      "Email": "emma.davis@company.com",
      "Full Name": "Emma Davis",
      "Role": "Data Scientist"
    },
    {
      "Username": "tom_johnson",
      "Email": "tom.johnson@company.com",
      "Full Name": "Tom Johnson",
      "Role": "Trainer"
    },
    {
      "Username": "lisa_garcia",
      "Email": "lisa.garcia@company.com",
      "Full Name": "Lisa Garcia",
      "Role": "Senior Trainer"
    }
  ];
}

function generateMockTeamStructure() {
  return [
    {
      "Team": "AI Training Team Alpha",
      "Lead": "Pod Alpha",
      "Members": "John Doe, Jane Smith, Mike Chen",
      "Department": "Machine Learning",
      "Focus Area": "Task Training & Validation"
    },
    {
      "Team": "AI Training Team Beta",
      "Lead": "Pod Beta",
      "Members": "Sarah Wilson, Alex Brown, Emma Davis",
      "Department": "Data Science",
      "Focus Area": "Model Development & Testing"
    },
    {
      "Team": "AI Training Team Gamma",
      "Lead": "Pod Gamma",
      "Members": "Tom Johnson, Lisa Garcia",
      "Department": "Quality Assurance",
      "Focus Area": "Task Review & Calibration"
    },
    {
      "Team": "AI Training Team Delta",
      "Lead": "Pod Delta",
      "Members": "John Doe, Sarah Wilson, Mike Chen",
      "Department": "Research & Development",
      "Focus Area": "Advanced Task Development"
    }
  ];
}