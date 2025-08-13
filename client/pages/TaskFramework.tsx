import { useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Play, 
  Settings, 
  Database, 
  Zap, 
  CheckCircle, 
  Plus,
  Download,
  Upload,
  Save,
  Trash2,
  BarChart3,
  Network,
  ChevronDown,
  ChevronUp,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FunctionInfo {
  name: string;
  description: string;
  parameters: Record<string, any>;
  required: string[];
}

interface ApiResponse {
  status: string;
  message?: string;
  functions_info?: FunctionInfo[];
  output?: any;
}

interface Action {
  id: string;
  name: string;
  parameters: Record<string, string>;
  output?: any;
}

export default function TaskFramework() {
  // Main state
  const [environment, setEnvironment] = useState(""); // Domain like hr_payroll, finance
  const [interface_, setInterface] = useState("");
  const [functionsInfo, setFunctionsInfo] = useState<FunctionInfo[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Graph editor state
  const [showGraphEditor, setShowGraphEditor] = useState(false);
  const [graphNodes, setGraphNodes] = useState<any[]>([]);
  const [graphEdges, setGraphEdges] = useState<any[]>([]);
  
  // File input refs
  const actionsFileInputRef = useRef<HTMLInputElement>(null);
  const graphFileInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();

  const handleGoClick = async () => {
    if (!environment || !interface_) {
      toast({
        title: "Error",
        description: "Please enter both environment (domain) and interface",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/choose_env_interface", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Session-Id": "default",
        },
        body: JSON.stringify({
          environment,
          interface: interface_,
        }),
      });

      const data: ApiResponse = await response.json();

      if (data.status === "success" && data.functions_info) {
        setFunctionsInfo(data.functions_info);
        toast({
          title: "Success",
          description: `Environment and Interface selected successfully! Loaded ${data.functions_info.length} APIs`,
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to load functions",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addAction = () => {
    if (functionsInfo.length === 0) {
      toast({
        title: "Error",
        description: "Please select an environment and interface first by clicking GO.",
        variant: "destructive",
      });
      return;
    }

    const newAction: Action = {
      id: `action_${Date.now()}`,
      name: "",
      parameters: {},
      output: undefined
    };

    setActions(prev => [...prev, newAction]);
  };

  const removeAction = (actionId: string) => {
    setActions(prev => prev.filter(action => action.id !== actionId));
  };

  const updateAction = (actionId: string, field: keyof Action, value: any) => {
    setActions(prev => prev.map(action => 
      action.id === actionId ? { ...action, [field]: value } : action
    ));
  };

  const updateActionParameter = (actionId: string, paramName: string, value: string) => {
    setActions(prev => prev.map(action => 
      action.id === actionId 
        ? { ...action, parameters: { ...action.parameters, [paramName]: value } }
        : action
    ));
  };

  const executeAction = async (actionId: string) => {
    const action = actions.find(a => a.id === actionId);
    if (!action || !action.name) {
      toast({
        title: "Error",
        description: "Please select an API for this action",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/execute_api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Session-Id": "default",
        },
        body: JSON.stringify({
          api_name: action.name,
          parameters: action.parameters,
          environment,
        }),
      });

      const data: ApiResponse = await response.json();

      if (data.output) {
        updateAction(actionId, 'output', data.output);
        toast({
          title: "Success",
          description: "API executed successfully",
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Execution failed",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to execute API",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportActions = () => {
    const exportData = actions.map(action => ({
      name: action.name,
      arguments: action.parameters,
      output: action.output || ""
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `actions_${environment}_interface_${interface_}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Actions exported successfully",
    });
  };

  const importActions = () => {
    actionsFileInputRef.current?.click();
  };

  const handleActionsFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedActions = JSON.parse(e.target?.result as string);
        const newActions: Action[] = importedActions.map((action: any, index: number) => ({
          id: `imported_action_${Date.now()}_${index}`,
          name: action.name || "",
          parameters: action.arguments || {},
          output: action.output
        }));

        setActions(prev => [...prev, ...newActions]);
        toast({
          title: "Success",
          description: `Imported ${newActions.length} actions`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to parse JSON file",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  const populateNodesFromActions = () => {
    const nodes = actions.map((action, index) => ({
      id: action.id,
      label: action.name || `Action ${index + 1}`,
      x: (index % 5) * 150,
      y: Math.floor(index / 5) * 100
    }));
    setGraphNodes(nodes);
    toast({
      title: "Success",
      description: `Populated ${nodes.length} nodes from actions`,
    });
  };

  const exportGraph = () => {
    const graphData = {
      nodes: graphNodes,
      edges: graphEdges
    };

    const blob = new Blob([JSON.stringify(graphData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `graph_${environment}_interface_${interface_}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Graph exported successfully",
    });
  };

  const importGraph = () => {
    graphFileInputRef.current?.click();
  };

  const handleGraphFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const graphData = JSON.parse(e.target?.result as string);
        setGraphNodes(graphData.nodes || []);
        setGraphEdges(graphData.edges || []);
        toast({
          title: "Success",
          description: "Graph imported successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to parse graph JSON file",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  const savePage = () => {
    const pageState = {
      environment,
      interface: interface_,
      actions,
      graphNodes,
      graphEdges,
      timestamp: new Date().toISOString()
    };

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Task Framework State - ${environment}</title>
    <meta charset="UTF-8">
</head>
<body>
    <h1>Task Framework State</h1>
    <p>Environment: ${environment}</p>
    <p>Interface: ${interface_}</p>
    <p>Saved: ${new Date().toLocaleString()}</p>
    <script>
        window.taskFrameworkState = ${JSON.stringify(pageState, null, 2)};
        console.log('Task Framework State:', window.taskFrameworkState);
    </script>
    <pre>${JSON.stringify(pageState, null, 2)}</pre>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `task_framework_${environment}_${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Page state saved successfully",
    });
  };

  const getSelectedFunctionInfo = (functionName: string) => {
    return functionsInfo.find(f => f.name === functionName);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Task Framework</h1>
          <p className="text-muted-foreground">
            Execute API functions within different domains and interfaces
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Domain: {environment || "None"}
          </Badge>
          <Button variant="outline" onClick={savePage}>
            <Save className="w-4 h-4 mr-2" />
            Save Page
          </Button>
        </div>
      </div>

      {/* Environment & Interface Setup - Matching Dashboard Design */}
      <Card className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 shadow-xl">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Task Framework
          </CardTitle>
          <CardDescription className="text-base">
            Enter the domain (environment) and interface to load available APIs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-8 pb-8">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <Label htmlFor="environment" className="text-base font-semibold text-gray-700">
                Environment (Domain)
              </Label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-xl">
                  🌍
                </div>
                <Input
                  id="environment"
                  placeholder="Enter environment name (e.g., hr_payroll, finance)"
                  value={environment}
                  onChange={(e) => setEnvironment(e.target.value)}
                  className="pl-12 h-12 text-base border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-gray-50"
                />
              </div>
            </div>
            <div className="space-y-3">
              <Label htmlFor="interface" className="text-base font-semibold text-gray-700">
                Interface
              </Label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-xl z-10">
                  🔧
                </div>
                <Select value={interface_} onValueChange={setInterface}>
                  <SelectTrigger className="pl-12 h-12 text-base border-2 border-gray-300 rounded-xl focus:border-blue-500 bg-gray-50">
                    <SelectValue placeholder="Select an interface" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Interface 1</SelectItem>
                    <SelectItem value="2">Interface 2</SelectItem>
                    <SelectItem value="3">Interface 3</SelectItem>
                    <SelectItem value="4">Interface 4</SelectItem>
                    <SelectItem value="5">Interface 5</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          {/* GO Button - Matching Dashboard Style */}
          <div className="flex justify-center pt-4">
            <Button 
              onClick={handleGoClick}
              disabled={isLoading || !environment || !interface_}
              className="w-1/4 min-w-[200px] h-16 text-xl font-bold uppercase tracking-wider bg-gradient-to-r from-cyan-400 to-purple-500 hover:from-cyan-500 hover:to-purple-600 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 rounded-2xl"
              size="lg"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Loading...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  🚀 GO
                </div>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Actions Section */}
      {functionsInfo.length > 0 && (
        <div className="space-y-6">
          {/* Add Action Button - Large Circular like Dashboard */}
          {actions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Button
                onClick={addAction}
                className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                size="lg"
              >
                <Plus className="w-8 h-8" />
              </Button>
              <span className="text-lg font-medium text-gray-600">Add Action</span>
            </div>
          )}

          {/* Actions List and Management */}
          {actions.length > 0 && (
            <div className="space-y-6">
              {/* Actions List */}
              <div className="space-y-4">
                {actions.map((action) => {
                  const functionInfo = getSelectedFunctionInfo(action.name);
                  return (
                    <Card key={action.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="pt-4">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 space-y-2">
                              <Label>API Function</Label>
                              <Select 
                                value={action.name} 
                                onValueChange={(value) => updateAction(action.id, 'name', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select API function" />
                                </SelectTrigger>
                                <SelectContent>
                                  {functionsInfo.map((func) => (
                                    <SelectItem key={func.name} value={func.name}>
                                      {func.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => removeAction(action.id)}
                              className="ml-4"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          {functionInfo && (
                            <div className="space-y-3">
                              <div className="text-sm text-muted-foreground">
                                {functionInfo.description}
                              </div>
                              
                              {/* Parameters */}
                              {Object.keys(functionInfo.parameters).length > 0 && (
                                <div className="space-y-2">
                                  <Label>Parameters</Label>
                                  <div className="grid gap-2 md:grid-cols-2">
                                    {Object.entries(functionInfo.parameters).map(([paramName, paramInfo]) => (
                                      <div key={paramName} className="space-y-1">
                                        <Label className="text-xs">
                                          {paramName}
                                          {functionInfo.required.includes(paramName) && (
                                            <span className="text-red-500 ml-1">*</span>
                                          )}
                                        </Label>
                                        <Input
                                          placeholder={`Enter ${paramName}`}
                                          value={action.parameters[paramName] || ""}
                                          onChange={(e) => updateActionParameter(action.id, paramName, e.target.value)}
                                          size="sm"
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Execute Button */}
                              <div className="flex gap-2">
                                <Button 
                                  onClick={() => executeAction(action.id)}
                                  disabled={isLoading}
                                  size="sm"
                                >
                                  <Play className="w-4 h-4 mr-2" />
                                  Execute
                                </Button>
                              </div>

                              {/* Output */}
                              {action.output && (
                                <div className="space-y-2">
                                  <Label>Output</Label>
                                  <Textarea
                                    value={JSON.stringify(action.output, null, 2)}
                                    readOnly
                                    className="min-h-[100px] font-mono text-xs"
                                  />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Add Another Action Button + Import/Export - Dashboard Style */}
              <div className="flex flex-col items-center space-y-6">
                {/* Add Action Button */}
                <div className="flex flex-col items-center space-y-2">
                  <Button
                    onClick={addAction}
                    className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    <Plus className="w-6 h-6" />
                  </Button>
                  <span className="text-sm font-medium text-gray-600">Add Action</span>
                </div>

                {/* Import/Export Buttons - Dashboard Style */}
                <div className="flex gap-4">
                  <Button 
                    onClick={importActions} 
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    Import Actions
                  </Button>
                  <Button 
                    onClick={exportActions} 
                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    Export Actions
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Graph Editor Section */}
      {functionsInfo.length > 0 && (
        <Card>
          <CardHeader 
            className="cursor-pointer"
            onClick={() => setShowGraphEditor(!showGraphEditor)}
          >
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Graph Editor Playground
              </div>
              {showGraphEditor ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </CardTitle>
            <CardDescription>
              Visualize and manage action relationships
            </CardDescription>
          </CardHeader>
          
          {showGraphEditor && (
            <CardContent className="space-y-4">
              {/* Graph Management Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button onClick={populateNodesFromActions} variant="outline" size="sm">
                  <Network className="w-4 h-4 mr-2" />
                  Populate Nodes from Actions
                </Button>
                <Button onClick={importGraph} variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Import Graph
                </Button>
                <Button onClick={exportGraph} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export Graph
                </Button>
              </div>

              {/* Graph Visualization Area */}
              <div className="border rounded-lg p-4 min-h-[300px] bg-muted/10">
                <div className="text-center text-muted-foreground">
                  Graph visualization area
                  <br />
                  <span className="text-sm">
                    Nodes: {graphNodes.length} | Edges: {graphEdges.length}
                  </span>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Hidden file inputs */}
      <input
        type="file"
        ref={actionsFileInputRef}
        onChange={handleActionsFileChange}
        accept=".json"
        style={{ display: 'none' }}
      />
      <input
        type="file"
        ref={graphFileInputRef}
        onChange={handleGraphFileChange}
        accept=".json"
        style={{ display: 'none' }}
      />
    </div>
  );
}