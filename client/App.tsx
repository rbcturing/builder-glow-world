import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import Index from "./pages/Index";
import CreateTask from "./pages/CreateTask";
import ReviewQueue from "./pages/ReviewQueue";
import Calibration from "./pages/Calibration";
import DeliveryBatch from "./pages/DeliveryBatch";
import TaskFramework from "./pages/TaskFramework";
import TaskTracker from "./pages/TaskTracker";
import ChainAnalyzer from "./pages/ChainAnalyzer";
import DbConnections from "./pages/DbConnections";
import InterfaceConnections from "./pages/InterfaceConnections";
import InstructionValidation from "./pages/InstructionValidation";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/create" element={<CreateTask />} />
              <Route path="/review" element={<ReviewQueue />} />
              <Route path="/calibration" element={<Calibration />} />
              <Route path="/delivery" element={<DeliveryBatch />} />
              <Route path="/framework" element={<TaskFramework />} />
              <Route path="/tracker" element={<TaskTracker />} />
              <Route path="/chain-analyzer" element={<ChainAnalyzer />} />
              <Route path="/db-connections" element={<DbConnections />} />
              <Route path="/interface-connections" element={<InterfaceConnections />} />
              <Route path="/instruction-validation" element={<InstructionValidation />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

// Only create root once
let root: ReturnType<typeof createRoot> | null = null;

function initializeApp() {
  const container = document.getElementById("root")!;
  if (!root) {
    root = createRoot(container);
  }
  root.render(<App />);
}

initializeApp();
