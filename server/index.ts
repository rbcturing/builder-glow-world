import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleChooseEnvInterface, handleExecuteApi } from "./routes/task-framework";
import { handleTaskTracker, handleCreateTask, handleUpdateTaskStatus } from "./routes/task-tracker";
import { handleInstructionValidation, handleTaskValidation } from "./routes/validation";
import { 
  handleLoadPython, 
  handleLoadJson, 
  handleGetJsonData, 
  handleAnalyzeChains, 
  handleGetSessionInfo 
} from "./routes/chain-analyzer";
import { 
  handleDatabaseUtilitiesPromptGeneration, 
  handleDatabaseUtilities 
} from "./routes/database-utilities";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Logging middleware
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Task Framework routes
  app.post("/api/choose_env_interface", (req, res) => {
    console.log('Route /api/choose_env_interface called');
    handleChooseEnvInterface(req, res);
  });
  app.post("/api/execute_api", handleExecuteApi);

  // Task Tracker routes
  app.get("/api/tracker", handleTaskTracker);
  app.post("/api/tracker", handleTaskTracker);
  app.post("/api/tasks/create", handleCreateTask);
  app.post("/api/tasks/update-status", handleUpdateTaskStatus);

  // Validation routes
  app.post("/api/validate/instruction", handleInstructionValidation);
  app.post("/api/validate/task", handleTaskValidation);

  // Chain Analyzer routes
  app.post("/api/load_python", handleLoadPython);
  app.post("/api/load_json", handleLoadJson);
  app.post("/api/get_json_data", handleGetJsonData);
  app.post("/api/analyze_chains", handleAnalyzeChains);
  app.get("/api/get_session_info", handleGetSessionInfo);

  // Database Utilities routes
  app.post("/api/database_utilities_prompt_generation", handleDatabaseUtilitiesPromptGeneration);

  return app;
}
