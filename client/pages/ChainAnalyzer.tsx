import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Upload, 
  FileCode, 
  FileJson, 
  Zap, 
  Link, 
  RefreshCw,
  CheckCircle,
  AlertCircle
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
  
  const { toast } = useToast();

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
          <h1 className="text-3xl font-bold tracking-tight">Chain Analyzer</h1>
          <p className="text-muted-foreground">
            Analyze Python functions and build execution chains
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

      {/* File Loading Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCode className="w-5 h-5" />
              Load Python Files
            </CardTitle>
            <CardDescription>
              Load Python files from a directory to analyze functions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="python-dir">Python Directory Path</Label>
              <Input
                id="python-dir"
                placeholder="Enter directory path (e.g., ./src/functions)"
                value={pythonDirectory}
                onChange={(e) => setPythonDirectory(e.target.value)}
              />
            </div>
            <Button 
              onClick={loadPythonFiles}
              disabled={isLoading}
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              {isLoading ? "Loading..." : "Load Python Files"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileJson className="w-5 h-5" />
              Load JSON Files
            </CardTitle>
            <CardDescription>
              Load JSON files from a directory for data analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="json-dir">JSON Directory Path</Label>
              <Input
                id="json-dir"
                placeholder="Enter directory path (e.g., ./data)"
                value={jsonDirectory}
                onChange={(e) => setJsonDirectory(e.target.value)}
              />
            </div>
            <Button 
              onClick={loadJsonFiles}
              disabled={isLoading}
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              {isLoading ? "Loading..." : "Load JSON Files"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Functions Overview */}
      {Object.keys(functions).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Loaded Functions</CardTitle>
            <CardDescription>
              Overview of loaded Python functions and their capabilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto max-h-64">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Function Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Arguments</TableHead>
                    <TableHead>Outputs</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(functions).map(([name, func]) => (
                    <TableRow key={name}>
                      <TableCell className="font-medium">{func.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{func.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {func.args.map((arg, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {arg}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {func.outputs.map((output, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {output}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {func.docstring}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* JSON Files Overview */}
      {Object.keys(jsonFiles).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>JSON Files</CardTitle>
            <CardDescription>
              Click on a file to view its structure and data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-3">
              {Object.entries(jsonFiles).map(([filename, fileInfo]) => (
                <Button
                  key={filename}
                  variant={selectedJsonFile === filename ? "default" : "outline"}
                  onClick={() => getJsonData(filename)}
                  className="justify-start"
                >
                  <FileJson className="w-4 h-4 mr-2" />
                  {filename}
                </Button>
              ))}
            </div>
            
            {jsonData && selectedJsonFile && (
              <div className="mt-4 space-y-2">
                <Label>Data from {selectedJsonFile}:</Label>
                <Textarea
                  value={JSON.stringify(jsonData, null, 2)}
                  readOnly
                  className="min-h-[200px] font-mono text-sm"
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Chain Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="w-5 h-5" />
            Chain Analysis
          </CardTitle>
          <CardDescription>
            Analyze function chains starting from a variable
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="starting-var">Starting Variable</Label>
            <Input
              id="starting-var"
              placeholder="Enter starting variable (e.g., user_data, input_text)"
              value={startingVariable}
              onChange={(e) => setStartingVariable(e.target.value)}
            />
          </div>
          <Button 
            onClick={analyzeChains}
            disabled={isLoading || Object.keys(functions).length === 0}
            className="w-full"
          >
            <Zap className="w-4 h-4 mr-2" />
            {isLoading ? "Analyzing..." : "Analyze Chains"}
          </Button>
        </CardContent>
      </Card>

      {/* Chain Results */}
      {chains.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Chains</CardTitle>
            <CardDescription>
              Function execution chains starting from "{startingVariable}"
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {chains.map((chain, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">Chain {index + 1}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            Length: {chain.length}
                          </Badge>
                          <Badge variant="outline">
                            Confidence: {Math.round(chain.confidence * 100)}%
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        {chain.description}
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm">Execution Steps:</Label>
                        <div className="space-y-1">
                          {chain.steps.map((step, stepIndex) => (
                            <div key={stepIndex} className="flex items-center gap-2 text-sm">
                              <Badge variant="secondary" className="text-xs">
                                {stepIndex + 1}
                              </Badge>
                              <span className="text-blue-600">{step.input}</span>
                              <span>→</span>
                              <span className="font-medium">{step.function}</span>
                              <span>→</span>
                              <span className="text-green-600">{step.chosen_output}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <Label className="text-sm">Variables Used:</Label>
                        <div className="flex flex-wrap gap-1">
                          {chain.unique_variables.map((variable, varIndex) => (
                            <Badge key={varIndex} variant="outline" className="text-xs">
                              {variable}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}