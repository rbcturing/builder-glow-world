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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Database, 
  FileText, 
  Zap, 
  CheckCircle, 
  Copy,
  Download,
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DbConnections() {
  const [dbSchema, setDbSchema] = useState("");
  const [examplePolicies, setExamplePolicies] = useState("");
  const [exampleApis, setExampleApis] = useState("");
  const [interfaceApis, setInterfaceApis] = useState("");
  const [initialPrompt, setInitialPrompt] = useState("");
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [selectedAction, setSelectedAction] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [scenario, setScenario] = useState("");
  const [realismCheck, setRealismCheck] = useState("");
  
  const { toast } = useToast();

  const promptTemplates = {
    policy_creation: `Generate database access policies based on the following schema and examples:

Database Schema:
{db_schema}

Example Policies:
{example_policy_document}

APIs Documentation:
{apis_documentation}

Please create comprehensive access policies that ensure data security and proper authorization.`,

    api_generation: `Generate API tools based on the database schema and requirements:

Database Schema:
{db_schema}

Example Tools:
{examples_tools}

Required Tools:
{required_tools}

Please create API functions that provide secure and efficient database access.`,

    seed_generation: `Generate seed data for the database based on the schema:

Database Schema:
{db_schema}

Please create realistic sample data that follows the schema constraints and relationships.`,

    scenario_generation: `Generate realistic scenarios for the database:

Database Schema:
{db_schema}

Please create practical use cases and scenarios that demonstrate the database functionality.`
  };

  const generatePrompt = async () => {
    if (!selectedAction) {
      toast({
        title: "Error",
        description: "Please select an action",
        variant: "destructive",
      });
      return;
    }

    if (!dbSchema.trim()) {
      toast({
        title: "Error", 
        description: "Please enter a database schema",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/database_utilities_prompt_generation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: selectedAction,
          db_schema: dbSchema,
          example_policies: examplePolicies,
          interface_apis: interfaceApis,
          initial_prompt: promptTemplates[selectedAction as keyof typeof promptTemplates],
          example_apis: exampleApis,
        }),
      });

      const data = await response.json();

      if (data.status === "success") {
        setGeneratedPrompt(data.prompt);
        toast({
          title: "Success",
          description: "Prompt generated successfully",
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to generate prompt",
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

  const checkScenarioRealism = async () => {
    if (!scenario.trim() || !dbSchema.trim()) {
      toast({
        title: "Error",
        description: "Please enter both database schema and scenario",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/database_utilities_prompt_generation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "check_scenario_realism",
          db_schema: dbSchema,
          scenario: scenario,
        }),
      });

      const data = await response.json();

      if (data.status === "success") {
        setRealismCheck(data.realism_check);
        toast({
          title: "Success",
          description: "Scenario realism checked",
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to check scenario realism",
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Success",
      description: "Copied to clipboard",
    });
  };

  const downloadPrompt = () => {
    if (!generatedPrompt) return;
    
    const blob = new Blob([generatedPrompt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedAction}_prompt.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Database Connections</h1>
          <p className="text-muted-foreground">
            Generate database utilities, policies, and scenarios
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Database className="w-4 h-4" />
          Database Utilities
        </Badge>
      </div>

      {/* Action Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Select Action
          </CardTitle>
          <CardDescription>
            Choose what you want to generate for your database
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Action Type</Label>
            <Select value={selectedAction} onValueChange={setSelectedAction}>
              <SelectTrigger>
                <SelectValue placeholder="Select an action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="policy_creation">Policy Creation</SelectItem>
                <SelectItem value="api_generation">API Generation</SelectItem>
                <SelectItem value="seed_generation">Seed Data Generation</SelectItem>
                <SelectItem value="scenario_generation">Scenario Generation</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Database Schema Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Database Schema
          </CardTitle>
          <CardDescription>
            Enter your database schema (required for all actions)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="db-schema">Database Schema</Label>
            <Textarea
              id="db-schema"
              placeholder="Enter your database schema (SQL DDL, JSON schema, etc.)"
              value={dbSchema}
              onChange={(e) => setDbSchema(e.target.value)}
              className="min-h-[200px] font-mono text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Conditional Input Fields */}
      {selectedAction === "policy_creation" && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Example Policies</CardTitle>
              <CardDescription>
                Provide example policies for reference
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Enter example database access policies..."
                value={examplePolicies}
                onChange={(e) => setExamplePolicies(e.target.value)}
                className="min-h-[150px] text-sm"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Interface APIs</CardTitle>
              <CardDescription>
                API documentation for the interface
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Enter interface APIs documentation..."
                value={interfaceApis}
                onChange={(e) => setInterfaceApis(e.target.value)}
                className="min-h-[150px] text-sm"
              />
            </CardContent>
          </Card>
        </div>
      )}

      {selectedAction === "api_generation" && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Example APIs</CardTitle>
              <CardDescription>
                Provide example API implementations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Enter example API tools..."
                value={exampleApis}
                onChange={(e) => setExampleApis(e.target.value)}
                className="min-h-[150px] text-sm"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Required Tools</CardTitle>
              <CardDescription>
                Specify required API tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Enter required API tools..."
                value={interfaceApis}
                onChange={(e) => setInterfaceApis(e.target.value)}
                className="min-h-[150px] text-sm"
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Generate Button */}
      <Card>
        <CardContent className="pt-6">
          <Button 
            onClick={generatePrompt}
            disabled={isLoading || !selectedAction || !dbSchema.trim()}
            className="w-full"
            size="lg"
          >
            <Zap className="w-4 h-4 mr-2" />
            {isLoading ? "Generating..." : `Generate ${selectedAction?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Prompt`}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Prompt */}
      {generatedPrompt && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Generated Prompt
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(generatedPrompt)}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadPrompt}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={generatedPrompt}
              readOnly
              className="min-h-[300px] font-mono text-sm"
            />
          </CardContent>
        </Card>
      )}

      {/* Scenario Realism Checker */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Scenario Realism Checker
          </CardTitle>
          <CardDescription>
            Check if a scenario is realistic for your database schema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="scenario">Scenario</Label>
            <Textarea
              id="scenario"
              placeholder="Enter a scenario to check for realism..."
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          
          <Button 
            onClick={checkScenarioRealism}
            disabled={isLoading || !scenario.trim() || !dbSchema.trim()}
            variant="outline"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            {isLoading ? "Checking..." : "Check Realism"}
          </Button>

          {realismCheck && (
            <div className="mt-4 space-y-2">
              <Label>Realism Check Result:</Label>
              <Textarea
                value={realismCheck}
                readOnly
                className="min-h-[150px] text-sm"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}