import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Play, 
  Download, 
  Upload, 
  ChevronDown, 
  ChevronUp, 
  BarChart3,
  Network,
  RefreshCw
} from "lucide-react";

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
  const [environment, setEnvironment] = useState("");
  const [interface_, setInterface] = useState("");
  const [functionsInfo, setFunctionsInfo] = useState<FunctionInfo[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Graph editor state
  const [showGraphEditor, setShowGraphEditor] = useState(false);
  const [graphNodes, setGraphNodes] = useState<any[]>([]);
  const [graphEdges, setGraphEdges] = useState<any[]>([]);
  
  const { toast } = useToast();
  const actionsFileInputRef = useRef<HTMLInputElement>(null);
  const graphFileInputRef = useRef<HTMLInputElement>(null);

  const loadApis = async () => {
    if (!environment || !interface_) {
      toast({
        title: "Error",
        description: "Please select both environment and interface",
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
          description: `Loaded ${data.functions_info.length} APIs`,
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to load APIs",
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
        description: "Please load APIs first",
        variant: "destructive",
      });
      return;
    }

    const newAction: Action = {
      id: `action_${Date.now()}`,
      name: functionsInfo[0].name,
      parameters: {},
    };

    setActions([...actions, newAction]);
  };

  const executeActions = async () => {
    if (actions.length === 0) {
      toast({
        title: "Error",
        description: "No actions to execute",
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
        },
        body: JSON.stringify({
          environment,
          interface: interface_,
          actions,
        }),
      });

      const data = await response.json();
      
      if (data.status === "success") {
        toast({
          title: "Success",
          description: "Actions executed successfully",
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to execute actions",
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

  const populateNodesFromActions = () => {
    const nodes = actions.map((action, index) => ({
      id: action.id,
      label: action.name,
      group: 'action',
      x: (index % 5) * 150,
      y: Math.floor(index / 5) * 100
    }));
    setGraphNodes(nodes);
    
    toast({
      title: "Success",
      description: `Created ${nodes.length} nodes from actions`,
    });
  };

  const exportGraph = () => {
    const graphData = {
      nodes: graphNodes,
      edges: graphEdges
    };
    
    const blob = new Blob([JSON.stringify(graphData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'graph.json';
    a.click();
    URL.revokeObjectURL(url);
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
        const fileData = JSON.parse(e.target?.result as string);
        
        // Check if it's an interface file with APIs structure
        if (fileData.APIs && fileData.edges) {
          // Convert API interface format to graph format with better distribution
          const apiNames = Object.keys(fileData.APIs);
          const nodes = apiNames.map((apiName, index) => {
            // Create a more spread out circular/spiral layout
            const angle = (index * 2.4) % (2 * Math.PI); // Spiral angle
            const radius = 80 + (Math.floor(index / 8) * 60); // Increasing radius for spiral
            const centerX = 400;
            const centerY = 250;
            
            return {
              id: apiName,
              label: apiName,
              group: 'api',
              x: centerX + Math.cos(angle) * radius,
              y: centerY + Math.sin(angle) * radius,
              inputs: fileData.APIs[apiName].inputs || [],
              outputs: fileData.APIs[apiName].outputs || []
            };
          });
          
          const edges = fileData.edges.map((edge: any, index: number) => ({
            id: `edge_${index}`,
            from: edge.from,
            to: edge.to,
            label: edge.connections ? `${edge.connections.output} → ${edge.connections.input}` : '',
            explicit: edge.explicit || false
          }));
          
          setGraphNodes(nodes);
          setGraphEdges(edges);
          
          toast({
            title: "Success",
            description: `Interface imported successfully! Loaded ${nodes.length} APIs and ${edges.length} connections`,
          });
        } 
        // Check if it's a standard graph format
        else if (fileData.nodes && fileData.edges) {
          setGraphNodes(fileData.nodes || []);
          setGraphEdges(fileData.edges || []);
          toast({
            title: "Success",
            description: "Graph imported successfully",
          });
        }
        // Try to handle other formats
        else {
          toast({
            title: "Error",
            description: "Unsupported file format. Expected either API interface format or standard graph format.",
            variant: "destructive",
          });
        }
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

  const importActions = () => {
    actionsFileInputRef.current?.click();
  };

  const exportActions = () => {
    const blob = new Blob([JSON.stringify(actions, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'actions.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleActionsFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedActions = JSON.parse(e.target?.result as string);
        setActions(importedActions);
        toast({
          title: "Success",
          description: `Imported ${importedActions.length} actions`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to parse actions JSON file",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Task Framework
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Configure environments, load APIs, and manage action sequences with our comprehensive task framework.
        </p>
      </div>

      {/* Environment and Interface Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Environment Configuration</CardTitle>
          <CardDescription>
            Select your environment and interface to load available APIs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="environment">Environment</Label>
              <Input
                id="environment"
                type="text"
                placeholder="Enter environment name (e.g., finance)"
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="interface">Interface</Label>
              <Select value={interface_} onValueChange={setInterface}>
                <SelectTrigger>
                  <SelectValue placeholder="Select interface" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Interface 1</SelectItem>
                  <SelectItem value="2">Interface 2</SelectItem>
                  <SelectItem value="3">Interface 3</SelectItem>
                  <SelectItem value="4">Interface 4</SelectItem>
                  <SelectItem value="5">Interface 5</SelectItem>
                  <SelectItem value="6">Interface 6</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button onClick={loadApis} disabled={isLoading} className="w-full">
            {isLoading ? "Loading..." : "Load APIs"}
          </Button>
          
          {functionsInfo.length > 0 && (
            <div className="text-center">
              <Badge variant="secondary">
                {functionsInfo.length} APIs loaded
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions Management */}
      {functionsInfo.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Actions Management</CardTitle>
            <CardDescription>
              Configure and execute API actions in sequence
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={addAction} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Action
              </Button>
              <Button onClick={executeActions} disabled={isLoading || actions.length === 0}>
                <Play className="w-4 h-4 mr-2" />
                Execute Actions
              </Button>
              <Button onClick={importActions} variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
              <Button onClick={exportActions} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
            
            {actions.length > 0 && (
              <div className="space-y-4">
                {actions.map((action, index) => (
                  <Card key={action.id}>
                    <CardContent className="pt-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">Action {index + 1}</h4>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setActions(actions.filter(a => a.id !== action.id))}
                          >
                            Remove
                          </Button>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>API Function</Label>
                          <Select
                            value={action.name}
                            onValueChange={(value) => {
                              const updatedActions = actions.map(a =>
                                a.id === action.id ? { ...a, name: value, parameters: {} } : a
                              );
                              setActions(updatedActions);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
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
                        
                        {/* Parameters */}
                        {(() => {
                          const selectedFunction = functionsInfo.find(f => f.name === action.name);
                          if (!selectedFunction) return null;
                          
                          return (
                            <div className="space-y-2">
                              <Label>Parameters</Label>
                              {Object.entries(selectedFunction.parameters).map(([paramName, paramInfo]) => (
                                <div key={paramName} className="space-y-1">
                                  <Label className="text-sm">
                                    {paramName}
                                    {selectedFunction.required.includes(paramName) && (
                                      <span className="text-red-500 ml-1">*</span>
                                    )}
                                  </Label>
                                  <Input
                                    placeholder={`Enter ${paramName}`}
                                    value={action.parameters[paramName] || ""}
                                    onChange={(e) => {
                                      const updatedActions = actions.map(a =>
                                        a.id === action.id
                                          ? {
                                              ...a,
                                              parameters: {
                                                ...a.parameters,
                                                [paramName]: e.target.value
                                              }
                                            }
                                          : a
                                      );
                                      setActions(updatedActions);
                                    }}
                                  />
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                        
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
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
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
              <div className="border rounded-lg p-4 min-h-[500px] bg-muted/10">
                {graphNodes.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm">Graph Visualization</h4>
                      <span className="text-sm text-muted-foreground">
                        Nodes: {graphNodes.length} | Edges: {graphEdges.length}
                      </span>
                    </div>
                    
                    {/* Improved Network Graph Container */}
                    <div className="w-full h-[600px] border-2 border-gray-200 rounded-xl bg-white shadow-lg relative overflow-hidden">
                      {/* Graph Info Header */}
                      <div className="absolute top-4 right-4 z-20 bg-white/95 backdrop-blur-sm rounded-lg px-4 py-2 shadow-md border">
                        <div className="text-sm font-medium text-gray-700">
                          📊 {graphNodes.length} APIs • {graphEdges.length} connections
                        </div>
                      </div>
                      
                      {/* Graph Canvas */}
                      <div className="w-full h-full relative" style={{ 
                        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                        backgroundImage: `
                          radial-gradient(circle at 25px 25px, #cbd5e1 2px, transparent 2px),
                          radial-gradient(circle at 75px 75px, #cbd5e1 1px, transparent 1px)
                        `,
                        backgroundSize: '100px 100px, 50px 50px'
                      }}>
                        
                        {/* SVG for connections */}
                        <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
                          <defs>
                            <marker
                              id="arrowhead"
                              markerWidth="10"
                              markerHeight="10"
                              refX="8"
                              refY="3"
                              orient="auto"
                            >
                              <path d="M0,0 L0,6 L9,3 z" fill="#4f46e5" />
                            </marker>
                          </defs>
                          
                          {/* Render connections */}
                          {graphEdges.map((edge, index) => {
                            const fromNode = graphNodes.find(n => n.id === edge.from);
                            const toNode = graphNodes.find(n => n.id === edge.to);
                            
                            if (!fromNode || !toNode) return null;
                            
                            // Calculate connection line
                            const dx = toNode.x - fromNode.x;
                            const dy = toNode.y - fromNode.y;
                            const length = Math.sqrt(dx * dx + dy * dy);
                            const unitX = dx / length;
                            const unitY = dy / length;
                            
                            // Adjust for node size (50px radius)
                            const startX = fromNode.x + unitX * 50;
                            const startY = fromNode.y + unitY * 50;
                            const endX = toNode.x - unitX * 50;
                            const endY = toNode.y - unitY * 50;
                            
                            const isExplicit = edge.explicit;
                            const strokeColor = isExplicit ? "#10b981" : "#6366f1";
                            
                            return (
                              <g key={edge.id || `edge_${index}`}>
                                {/* Connection line */}
                                <line
                                  x1={startX}
                                  y1={startY}
                                  x2={endX}
                                  y2={endY}
                                  stroke={strokeColor}
                                  strokeWidth="3"
                                  markerEnd="url(#arrowhead)"
                                  opacity="0.8"
                                  className="hover:stroke-width-4 transition-all"
                                />
                                
                                {/* Connection label */}
                                {edge.label && (
                                  <g>
                                    <rect
                                      x={(startX + endX) / 2 - 50}
                                      y={(startY + endY) / 2 - 10}
                                      width="100"
                                      height="20"
                                      fill="white"
                                      stroke={strokeColor}
                                      strokeWidth="1"
                                      rx="10"
                                      opacity="0.95"
                                    />
                                    <text
                                      x={(startX + endX) / 2}
                                      y={(startY + endY) / 2 + 4}
                                      textAnchor="middle"
                                      fontSize="10"
                                      fill={strokeColor}
                                      fontWeight="600"
                                    >
                                      {edge.label.length > 15 ? edge.label.substring(0, 15) + '...' : edge.label}
                                    </text>
                                  </g>
                                )}
                              </g>
                            );
                          })}
                        </svg>

                        {/* Render nodes as HTML elements for better interactivity */}
                        <div className="absolute inset-0" style={{ zIndex: 2 }}>
                          {graphNodes.map((node, index) => {
                            const nodeLabel = node.label || node.id || `Node ${index + 1}`;
                            const displayName = nodeLabel.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim();
                            const shortName = displayName.length > 20 ? displayName.substring(0, 20) + '...' : displayName;
                            
                            return (
                              <div
                                key={node.id || index}
                                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-move group"
                                style={{
                                  left: `${node.x}px`,
                                  top: `${node.y}px`,
                                }}
                                title={`${nodeLabel}\nInputs: ${node.inputs?.length || 0}\nOutputs: ${node.outputs?.length || 0}`}
                              >
                                {/* Node container */}
                                <div className="relative">
                                  {/* Glow effect */}
                                  <div className="absolute inset-0 w-24 h-24 bg-blue-400 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-lg"></div>
                                  
                                  {/* Main node circle */}
                                  <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full border-4 border-white shadow-xl group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300 flex items-center justify-center">
                                    {/* Node text */}
                                    <div className="text-center px-2">
                                      <div className="text-white font-bold text-xs leading-tight">
                                        {shortName.split(' ').slice(0, 2).map((word, i) => (
                                          <div key={i} className="truncate">{word}</div>
                                        ))}
                                      </div>
                                    </div>
                                    
                                    {/* API count badge */}
                                    {node.inputs && node.outputs && (
                                      <div className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold border-2 border-white shadow-md">
                                        {node.inputs.length + node.outputs.length}
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Hover tooltip */}
                                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-3 bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                                    <div className="font-semibold">{nodeLabel}</div>
                                    {node.group && <div className="text-gray-300 text-xs">Type: {node.group}</div>}
                                    {node.inputs && <div className="text-green-300 text-xs">📥 {node.inputs.length} inputs</div>}
                                    {node.outputs && <div className="text-orange-300 text-xs">📤 {node.outputs.length} outputs</div>}
                                    {/* Tooltip arrow */}
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900"></div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Node Details Below Graph */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h5 className="font-semibold text-sm text-gray-700">API Details</h5>
                        <Badge variant="secondary" className="text-xs">
                          {graphNodes.length} APIs loaded
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[200px] overflow-y-auto">
                        {graphNodes.map((node, index) => (
                          <div 
                            key={node.id || index} 
                            className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="font-semibold text-sm text-blue-600 truncate mb-1">
                                  {node.label || node.id || `Node ${index + 1}`}
                                </div>
                                {node.group && (
                                  <Badge variant="outline" className="text-xs">
                                    {node.group}
                                  </Badge>
                                )}
                              </div>
                              <div className="w-3 h-3 rounded-full bg-blue-500 flex-shrink-0 ml-2"></div>
                            </div>
                            
                            {/* API Input/Output Info */}
                            {node.inputs && node.outputs && (
                              <div className="flex justify-between text-xs text-gray-500 mt-2">
                                <span className="flex items-center gap-1">
                                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                                  {node.inputs.length} inputs
                                </span>
                                <span className="flex items-center gap-1">
                                  <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                                  {node.outputs.length} outputs
                                </span>
                              </div>
                            )}
                            
                            {/* Position Info */}
                            {node.x !== undefined && node.y !== undefined && (
                              <div className="text-xs text-gray-400 mt-1">
                                Position: ({Math.round(node.x)}, {Math.round(node.y)})
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {/* Connection Summary */}
                      {graphEdges.length > 0 && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <h6 className="font-medium text-sm text-gray-700 mb-2">Connection Summary</h6>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className="text-xs">
                              <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                              {graphEdges.filter(e => e.explicit).length} explicit
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              <div className="w-2 h-2 rounded-full bg-blue-500 mr-1"></div>
                              {graphEdges.filter(e => !e.explicit).length} implicit
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              Total: {graphEdges.length} connections
                            </Badge>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <BarChart3 className="w-12 h-12 mb-4 text-muted-foreground/50" />
                    <p className="text-sm">No graph data loaded</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      Import a graph file or populate nodes from actions to get started
                    </p>
                  </div>
                )}
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