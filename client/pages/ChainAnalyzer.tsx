import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload,
  FileCode,
  FileJson,
  Zap,
  Link,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Settings,
  Search
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FunctionInfo {
  [key: string]: {
    name: string;
    args: string[];
    returns: string | null;
    docstring: string;
    body: string;
    type: string;
    outputs: string[];
  };
}

interface JsonFileInfo {
  [key: string]: {
    structure: any;
  };
}

interface Chain {
  chain: string[];
  steps: any[];
  description: string;
  starting_variable: string;
  length: number;
  confidence: number;
  unique_variables: string[];
}

interface SessionInfo {
  functions_count: number;
  json_files_count: number;
  functions: FunctionInfo;
  json_files: JsonFileInfo;
}

export default function ChainAnalyzer() {
  const [pythonDirectory, setPythonDirectory] = useState("");
  const [jsonDirectory, setJsonDirectory] = useState("");
  const [startingVariable, setStartingVariable] = useState("");
  const [functions, setFunctions] = useState<FunctionInfo>({});
  const [jsonFiles, setJsonFiles] = useState<JsonFileInfo>({});
  const [chains, setChains] = useState<Chain[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedJsonFile, setSelectedJsonFile] = useState("");
  const [jsonData, setJsonData] = useState<any>(null);
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);

  const { toast } = useToast();

  // Load session info on component mount
  useEffect(() => {
    loadSessionInfo();
  }, []);

  const loadSessionInfo = async () => {
    try {
      const response = await fetch("/api/get_session_info");
      const data = await response.json();

      setSessionInfo(data);
      setFunctions(data.functions || {});
      setJsonFiles(data.json_files || {});
    } catch (error) {
      console.error('Error loading session info:', error);
    }
  };

  const loadPythonFiles = async () => {
    if (!pythonDirectory.trim()) {
      toast({
        title: "Error",
        description: "Please enter a Python directory path",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/load_python", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          directory_path: pythonDirectory,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setFunctions(data.functions);
        toast({
          title: "Success",
          description: `Loaded ${data.functions_count} functions from ${data.python_files_count} Python files`,
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to load Python files",
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

  const loadJsonFiles = async () => {
    if (!jsonDirectory.trim()) {
      toast({
        title: "Error",
        description: "Please enter a JSON directory path",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/load_json", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          directory_path: jsonDirectory,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setJsonFiles(data.json_files);
        toast({
          title: "Success",
          description: `Loaded ${data.json_files_count} JSON files`,
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to load JSON files",
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

  const analyzeChains = async () => {
    if (!startingVariable.trim()) {
      toast({
        title: "Error",
        description: "Please enter a starting variable",
        variant: "destructive",
      });
      return;
    }

    if (Object.keys(functions).length === 0) {
      toast({
        title: "Error",
        description: "Please load Python functions first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/analyze_chains", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          starting_variable: startingVariable,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setChains(data.chains);
        toast({
          title: "Success",
          description: `Generated ${data.chains_count} chains from ${data.functions_count} functions`,
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to analyze chains",
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

  const getJsonData = async (filename: string) => {
    try {
      const response = await fetch("/api/get_json_data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filename,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setJsonData(data.data);
        setSelectedJsonFile(filename);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to get JSON data",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get JSON data",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Link className="w-8 h-8" />
            Function Chain Analyzer
          </h1>
          <p className="text-muted-foreground">
            Analyze Python functions and JSON data to suggest optimal chaining patterns
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            Functions: {Object.keys(functions).length}
          </Badge>
          <Badge variant="outline">
            JSON Files: {Object.keys(jsonFiles).length}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Starting Variable
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>What variable do you start with?</Label>
                <Input
                  placeholder="e.g., user_id, incident_id, data"
                  value={startingVariable}
                  onChange={(e) => setStartingVariable(e.target.value)}
                />
              </div>

              <Button
                onClick={analyzeChains}
                disabled={isLoading || !startingVariable.trim() || Object.keys(functions).length === 0}
                className="w-full"
              >
                <Search className="w-4 h-4 mr-2" />
                {isLoading ? "Analyzing..." : "Analyze Chains"}
              </Button>

              <div className="mt-8 space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Session Info
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Settings className="w-4 h-4" />
                    <span>{Object.keys(functions).length} functions loaded</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <FileJson className="w-4 h-4" />
                    <span>{Object.keys(jsonFiles).length} JSON files loaded</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          <Card>
            {/* Status Bar */}
            <div className="bg-muted/50 p-4 border-b flex gap-5 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Settings className="w-4 h-4" />
                <span>Functions: {Object.keys(functions).length}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Zap className="w-4 h-4" />
                <span>Starting: {startingVariable || "Not specified"}</span>
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="functions">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="functions" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Functions
                </TabsTrigger>
                <TabsTrigger value="json" className="flex items-center gap-2">
                  <FileJson className="w-4 h-4" />
                  JSON Data
                </TabsTrigger>
                <TabsTrigger value="analysis" className="flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Analysis
                </TabsTrigger>
              </TabsList>

              <div className="p-6 space-y-6">
                <TabsContent value="functions" className="mt-0 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Python Function Definitions
                    </h2>
                  </div>

                  <div className="flex gap-2">
                    <Input
                      placeholder="Python Files Directory Path"
                      value={pythonDirectory}
                      onChange={(e) => setPythonDirectory(e.target.value)}
                    />
                    <Button
                      onClick={loadPythonFiles}
                      disabled={isLoading}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {isLoading ? "Loading..." : "Load Python Files"}
                    </Button>
                  </div>

                  {/* Functions List */}
                  <div className="space-y-4">
                    {Object.keys(functions).length === 0 ? (
                      <p className="text-muted-foreground">No functions loaded. Enter a directory path and click "Load Python Files".</p>
                    ) : (
                      Object.entries(functions).map(([funcName, funcInfo]) => (
                        <Card key={funcName} className="hover:shadow-md transition-shadow">
                          <CardContent className="pt-4">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="font-bold text-lg">{funcInfo.name}</h3>
                              <Badge>
                                {funcInfo.type}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <h5 className="font-medium mb-2">Arguments:</h5>
                                <div className="flex flex-wrap gap-1">
                                  {funcInfo.args.map((arg, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {arg}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <h5 className="font-medium mb-2">Outputs:</h5>
                                <div className="flex flex-wrap gap-1">
                                  {funcInfo.outputs.map((output, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {output}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {funcInfo.docstring && (
                              <div className="mt-3">
                                <p className="text-muted-foreground text-sm">{funcInfo.docstring}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="json" className="mt-0 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <FileJson className="w-5 h-5" />
                      JSON Data Structure
                    </h2>
                  </div>

                  <div className="flex gap-2">
                    <Input
                      placeholder="JSON Files Directory Path"
                      value={jsonDirectory}
                      onChange={(e) => setJsonDirectory(e.target.value)}
                    />
                    <Button
                      onClick={loadJsonFiles}
                      disabled={isLoading}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {isLoading ? "Loading..." : "Load JSON Files"}
                    </Button>
                  </div>

                  {Object.keys(jsonFiles).length > 0 && (
                    <div className="space-y-4">
                      <div>
                        <Label>Select a JSON file to analyze:</Label>
                        <Select value={selectedJsonFile} onValueChange={(value) => {
                          setSelectedJsonFile(value);
                          getJsonData(value);
                        }}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a file..." />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.keys(jsonFiles).map((filename) => (
                              <SelectItem key={filename} value={filename}>
                                {filename}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {jsonData && selectedJsonFile && (
                        <div>
                          <h3 className="text-lg font-semibold mb-2">
                            📄 {selectedJsonFile} - Preview
                          </h3>
                          <div className="bg-muted rounded-lg p-4 max-h-96 overflow-auto">
                            <pre className="text-sm font-mono">
                              {JSON.stringify(jsonData, null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="analysis" className="mt-0 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <Search className="w-5 h-5" />
                      Chain Analysis & Suggestions
                    </h2>
                  </div>

                  {chains.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">No chains analyzed yet</p>
                      <p className="text-sm">Load Python functions and enter a starting variable to begin analysis</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="text-center mb-6">
                        <h3 className="text-lg font-semibold">
                          Generated Chains starting from "{startingVariable}"
                        </h3>
                        <p className="text-muted-foreground">Found {chains.length} possible execution chains</p>
                      </div>

                      {chains.map((chain, index) => (
                        <Card key={index} className="border-l-4 border-l-blue-500">
                          <CardContent className="pt-4">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-lg font-semibold">Chain {index + 1}</h4>
                              <div className="flex gap-2">
                                <Badge variant="outline">
                                  Length: {chain.length}
                                </Badge>
                                <Badge variant="outline">
                                  Confidence: {Math.round(chain.confidence * 100)}%
                                </Badge>
                              </div>
                            </div>

                            <p className="text-muted-foreground mb-4">{chain.description}</p>

                            <div className="space-y-3">
                              <h5 className="font-medium">Execution Steps:</h5>
                              <div className="space-y-2">
                                {chain.steps.map((step, stepIndex) => (
                                  <div key={stepIndex} className="flex items-center gap-3 p-3 bg-muted rounded-lg border-l-4 border-l-blue-500">
                                    <Badge className="w-8 h-8 rounded-full flex items-center justify-center p-0">
                                      {stepIndex + 1}
                                    </Badge>
                                    <div className="flex items-center gap-2 text-sm">
                                      <code className="bg-background px-2 py-1 rounded">{step.input}</code>
                                      <span className="text-muted-foreground">→</span>
                                      <span className="font-medium">{step.function}</span>
                                      <span className="text-muted-foreground">→</span>
                                      <code className="bg-background px-2 py-1 rounded">{step.chosen_output}</code>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="mt-4">
                              <h5 className="font-medium mb-2">Variables Used:</h5>
                              <div className="flex flex-wrap gap-1">
                                {chain.unique_variables.map((variable, varIndex) => (
                                  <Badge key={varIndex} variant="outline" className="text-xs">
                                    {variable}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
}