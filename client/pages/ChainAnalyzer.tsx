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
    <div className="min-h-screen bg-black text-white">
      {/* Header - Matching Dashboard Style */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20 p-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold">T</span>
          </div>
        </div>
        <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
          🔗 Function Chain Analyzer
        </h1>
        <p className="text-lg text-white/80">
          Analyze Python functions and JSON data to suggest optimal chaining patterns
        </p>
      </div>

      <div className="max-w-7xl mx-auto p-5">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 h-[calc(100vh-200px)]">
          {/* Sidebar - Matching Dashboard Style */}
          <div className="lg:col-span-1">
            <Card className="bg-white/5 backdrop-blur-md border-white/10 h-full">
              <CardHeader>
                <CardTitle className="text-blue-400 flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Starting Variable
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white/90">What variable do you start with?</Label>
                  <Input
                    placeholder="e.g., user_id, incident_id, data"
                    value={startingVariable}
                    onChange={(e) => setStartingVariable(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>
                
                <Button 
                  onClick={analyzeChains}
                  disabled={isLoading || !startingVariable.trim() || Object.keys(functions).length === 0}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  <Search className="w-4 h-4 mr-2" />
                  {isLoading ? "Analyzing..." : "Analyze Chains"}
                </Button>

                <div className="mt-8 space-y-4">
                  <h3 className="text-blue-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Session Info
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-white/80">
                      <Settings className="w-4 h-4 text-blue-400" />
                      <span>{Object.keys(functions).length} functions loaded</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/80">
                      <FileJson className="w-4 h-4 text-blue-400" />
                      <span>{Object.keys(jsonFiles).length} JSON files loaded</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area - Matching Dashboard Style */}
          <div className="lg:col-span-3">
            <Card className="bg-white/5 backdrop-blur-md border-white/10 h-full">
              {/* Status Bar */}
              <div className="bg-white/8 p-4 border-b border-white/20 flex gap-5 text-sm">
                <div className="flex items-center gap-2 text-white/80">
                  <Settings className="w-4 h-4 text-blue-400" />
                  <span>Functions: {Object.keys(functions).length}</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <Zap className="w-4 h-4 text-blue-400" />
                  <span>Starting: {startingVariable || "Not specified"}</span>
                </div>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="functions" className="h-[calc(100%-60px)]">
                <TabsList className="bg-white/10 border-b border-white/20 rounded-none w-full justify-start">
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

                <div className="p-6 h-[calc(100%-48px)] overflow-y-auto">
                  <TabsContent value="functions" className="mt-0 space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold text-blue-400 flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        Python Function Definitions
                      </h2>
                    </div>
                    
                    <div className="flex gap-2">
                      <Input
                        placeholder="Python Files Directory Path"
                        value={pythonDirectory}
                        onChange={(e) => setPythonDirectory(e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      />
                      <Button 
                        onClick={loadPythonFiles}
                        disabled={isLoading}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {isLoading ? "Loading..." : "Load Python Files"}
                      </Button>
                    </div>

                    {/* Functions List */}
                    <div className="space-y-4">
                      {Object.keys(functions).length === 0 ? (
                        <p className="text-white/70">No functions loaded. Enter a directory path and click "Load Python Files".</p>
                      ) : (
                        Object.entries(functions).map(([funcName, funcInfo]) => (
                          <Card key={funcName} className="bg-white/8 border-white/10 hover:bg-white/12 transition-colors">
                            <CardContent className="pt-4">
                              <div className="flex items-center justify-between mb-3">
                                <h3 className="font-bold text-blue-400 text-lg">{funcInfo.name}</h3>
                                <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                                  {funcInfo.type}
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <h5 className="text-white/90 mb-2">Arguments:</h5>
                                  <div className="flex flex-wrap gap-1">
                                    {funcInfo.args.map((arg, index) => (
                                      <Badge key={index} variant="outline" className="text-xs border-white/20 text-white/80">
                                        {arg}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                                
                                <div>
                                  <h5 className="text-white/90 mb-2">Outputs:</h5>
                                  <div className="flex flex-wrap gap-1">
                                    {funcInfo.outputs.map((output, index) => (
                                      <Badge key={index} variant="outline" className="text-xs border-white/20 text-white/80">
                                        {output}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              
                              {funcInfo.docstring && (
                                <div className="mt-3">
                                  <p className="text-white/70 text-sm">{funcInfo.docstring}</p>
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
                      <h2 className="text-xl font-bold text-blue-400 flex items-center gap-2">
                        <FileJson className="w-5 h-5" />
                        JSON Data Structure
                      </h2>
                    </div>
                    
                    <div className="flex gap-2">
                      <Input
                        placeholder="JSON Files Directory Path"
                        value={jsonDirectory}
                        onChange={(e) => setJsonDirectory(e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      />
                      <Button 
                        onClick={loadJsonFiles}
                        disabled={isLoading}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {isLoading ? "Loading..." : "Load JSON Files"}
                      </Button>
                    </div>

                    {Object.keys(jsonFiles).length > 0 && (
                      <div className="space-y-4">
                        <div>
                          <Label className="text-white/90">Select a JSON file to analyze:</Label>
                          <Select value={selectedJsonFile} onValueChange={(value) => {
                            setSelectedJsonFile(value);
                            getJsonData(value);
                          }}>
                            <SelectTrigger className="bg-white/10 border-white/20 text-white">
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
                            <h3 className="text-lg font-semibold text-blue-400 mb-2">
                              📄 {selectedJsonFile} - Preview
                            </h3>
                            <div className="bg-white/5 border border-white/10 rounded-lg p-4 max-h-96 overflow-auto">
                              <pre className="text-sm text-white/80 font-mono">
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
                      <h2 className="text-xl font-bold text-blue-400 flex items-center gap-2">
                        <Search className="w-5 h-5" />
                        Chain Analysis & Suggestions
                      </h2>
                    </div>

                    {chains.length === 0 ? (
                      <div className="text-center py-12 text-white/70">
                        <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">No chains analyzed yet</p>
                        <p className="text-sm">Load Python functions and enter a starting variable to begin analysis</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="text-center mb-6">
                          <h3 className="text-lg font-semibold text-white">
                            Generated Chains starting from "{startingVariable}"
                          </h3>
                          <p className="text-white/70">Found {chains.length} possible execution chains</p>
                        </div>

                        {chains.map((chain, index) => (
                          <Card key={index} className="bg-white/5 border-l-4 border-l-blue-500 border-white/10">
                            <CardContent className="pt-4">
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-semibold text-white">Chain {index + 1}</h4>
                                <div className="flex gap-2">
                                  <Badge variant="outline" className="border-white/20 text-white/80">
                                    Length: {chain.length}
                                  </Badge>
                                  <Badge variant="outline" className="border-white/20 text-white/80">
                                    Confidence: {Math.round(chain.confidence * 100)}%
                                  </Badge>
                                </div>
                              </div>
                              
                              <p className="text-white/70 mb-4">{chain.description}</p>
                              
                              <div className="space-y-3">
                                <h5 className="text-white/90 font-medium">Execution Steps:</h5>
                                <div className="space-y-2">
                                  {chain.steps.map((step, stepIndex) => (
                                    <div key={stepIndex} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border-l-4 border-l-blue-500">
                                      <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center p-0">
                                        {stepIndex + 1}
                                      </Badge>
                                      <div className="flex items-center gap-2 text-sm">
                                        <code className="bg-white/10 px-2 py-1 rounded text-blue-300">{step.input}</code>
                                        <span className="text-white/50">→</span>
                                        <span className="font-medium text-blue-400">{step.function}</span>
                                        <span className="text-white/50">→</span>
                                        <code className="bg-white/10 px-2 py-1 rounded text-green-300">{step.chosen_output}</code>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              <div className="mt-4">
                                <h5 className="text-white/90 font-medium mb-2">Variables Used:</h5>
                                <div className="flex flex-wrap gap-1">
                                  {chain.unique_variables.map((variable, varIndex) => (
                                    <Badge key={varIndex} variant="outline" className="text-xs border-white/20 text-white/80">
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
    </div>
  );
}