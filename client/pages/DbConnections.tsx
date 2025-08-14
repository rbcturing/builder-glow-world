import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Database, 
  Shield, 
  Code, 
  Sprout,
  CheckCircle,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type UtilityType = 'policy-creation' | 'api-implementation' | 'database-seeding' | 'scenario-realism';

interface UtilityData {
  status: string;
  initial_prompt?: string;
  example_policies?: string;
  example_apis?: string;
}

export default function DBConnections() {
  const [selectedUtility, setSelectedUtility] = useState<UtilityType | null>(null);
  const [initialPrompt, setInitialPrompt] = useState("");
  const [dbSchema, setDbSchema] = useState("");
  const [examplePolicies, setExamplePolicies] = useState("");
  const [interfaceApis, setInterfaceApis] = useState("");
  const [exampleApis, setExampleApis] = useState("");
  const [scenario, setScenario] = useState("");
  const [generatedOutput, setGeneratedOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();

  const utilities = [
    {
      id: 'policy-creation' as UtilityType,
      icon: Shield,
      title: 'Policy Creation',
      description: 'Generate and configure the policies that the agent LLM will use to determine database access permissions and restrictions'
    },
    {
      id: 'api-implementation' as UtilityType,
      icon: Code,
      title: 'API Implementation',
      description: 'Create comprehensive API tools and endpoints for seamless database interactions and data management operations'
    },
    {
      id: 'database-seeding' as UtilityType,
      icon: Sprout,
      title: 'Database Seeding',
      description: 'Generate realistic sample data and populate your database with meaningful test data for development and testing'
    },
    {
      id: 'scenario-realism' as UtilityType,
      icon: CheckCircle,
      title: 'Scenario Realism',
      description: 'Validate and assess the realism of database scenarios and use cases to ensure practical implementation'
    }
  ];

  const handleUtilityClick = async (utilityId: UtilityType) => {
    setSelectedUtility(utilityId);
    setGeneratedOutput("");
    
    try {
      const response = await fetch("/api/database_utilities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: utilityId.replace('-', '_'),
        }),
      });

      const data: UtilityData = await response.json();
      
      if (data.status === 'success') {
        if (data.initial_prompt) {
          setInitialPrompt(data.initial_prompt);
        }
        if (data.example_policies) {
          setExamplePolicies(data.example_policies);
        }
        if (data.example_apis) {
          setExampleApis(data.example_apis);
        }
      } else {
        console.error('Error loading utility data:', data);
      }
      
    } catch (error) {
      console.error('Error loading utility data:', error);
    }
  };

  const generateContent = async () => {
    if (!selectedUtility) return;

    const actionMap = {
      'policy-creation': 'generate_policy_prompt',
      'api-implementation': 'generate_api_prompt', 
      'database-seeding': 'generate_seed_prompt',
      'scenario-realism': 'check_scenario_realism'
    };

    const requiredFields = {
      'policy-creation': [initialPrompt, dbSchema, examplePolicies, interfaceApis],
      'api-implementation': [initialPrompt, dbSchema, exampleApis, interfaceApis],
      'database-seeding': [initialPrompt, dbSchema],
      'scenario-realism': [dbSchema, scenario]
    };

    const fields = requiredFields[selectedUtility];
    if (fields.some(field => !field?.trim())) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const body: any = {
        action: actionMap[selectedUtility],
        db_schema: dbSchema,
      };

      if (selectedUtility === 'policy-creation') {
        body.initial_prompt = initialPrompt;
        body.example_policies = examplePolicies;
        body.interface_apis = interfaceApis;
      } else if (selectedUtility === 'api-implementation') {
        body.initial_prompt = initialPrompt;
        body.example_apis = exampleApis;
        body.interface_apis = interfaceApis;
      } else if (selectedUtility === 'database-seeding') {
        body.initial_prompt = initialPrompt;
      } else if (selectedUtility === 'scenario-realism') {
        body.scenario = scenario;
      }

      const response = await fetch("/api/database_utilities_prompt_generation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.status === "success") {
        setGeneratedOutput(data.prompt || data.realism_check || "Generated successfully");
        toast({
          title: "Success",
          description: "Content generated successfully",
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to generate content",
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

  return (
    <div className="space-y-8">
      {/* Header - Matching Dashboard Style */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Database className="w-12 h-12 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Database Domain Utilities
        </h1>
        <div className="flex items-center justify-center gap-4">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-blue-500"></div>
          <span className="text-sm uppercase tracking-wider text-muted-foreground">
            Database Utilities Tooling
          </span>
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-blue-500"></div>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Streamline your database operations with our comprehensive suite of automation tools. 
          From policy creation to performance monitoring, everything you need to build robust database domains.
        </p>
      </div>

      {/* Utilities Overview - Matching Dashboard Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {utilities.map((utility) => {
          const Icon = utility.icon;
          return (
            <Card 
              key={utility.id}
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-2 border-2 ${
                selectedUtility === utility.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-border hover:border-blue-300'
              }`}
              onClick={() => handleUtilityClick(utility.id)}
            >
              <CardContent className="pt-6 text-center h-80 flex flex-col justify-between">
                <div>
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{utility.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {utility.description}
                  </p>
                </div>
                {selectedUtility === utility.id && (
                  <Badge className="mt-4 bg-blue-500 text-white">
                    Selected
                  </Badge>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Content Area - Matching Dashboard Style */}
      {selectedUtility && (
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {utilities.find(u => u.id === selectedUtility)?.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Initial Prompt - Show for ALL utilities including scenario-realism */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">Initial Prompt</Label>
              <Textarea
                value={initialPrompt}
                onChange={(e) => setInitialPrompt(e.target.value)}
                placeholder="Enter the initial prompt..."
                className="min-h-[120px] resize-none"
              />
            </div>

            {/* Database Schema */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">Database Schema</Label>
              <Textarea
                value={dbSchema}
                onChange={(e) => setDbSchema(e.target.value)}
                placeholder="Enter your database schema..."
                className="min-h-[120px] resize-none"
              />
            </div>

            {/* Policy Creation Fields */}
            {selectedUtility === 'policy-creation' && (
              <>
                <div className="space-y-2">
                  <Label className="text-base font-semibold">Example Policies</Label>
                  <Textarea
                    value={examplePolicies}
                    onChange={(e) => setExamplePolicies(e.target.value)}
                    placeholder="Enter example policies..."
                    className="min-h-[120px] resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-base font-semibold">Interface APIs</Label>
                  <Textarea
                    value={interfaceApis}
                    onChange={(e) => setInterfaceApis(e.target.value)}
                    placeholder="Enter interface APIs..."
                    className="min-h-[120px] resize-none"
                  />
                </div>
              </>
            )}

            {/* API Implementation Fields */}
            {selectedUtility === 'api-implementation' && (
              <>
                <div className="space-y-2">
                  <Label className="text-base font-semibold">Example APIs</Label>
                  <Textarea
                    value={exampleApis}
                    onChange={(e) => setExampleApis(e.target.value)}
                    placeholder="Enter example APIs..."
                    className="min-h-[120px] resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-base font-semibold">Interface APIs</Label>
                  <Textarea
                    value={interfaceApis}
                    onChange={(e) => setInterfaceApis(e.target.value)}
                    placeholder="Enter interface APIs..."
                    className="min-h-[120px] resize-none"
                  />
                </div>
              </>
            )}

            {/* Scenario Realism Fields */}
            {selectedUtility === 'scenario-realism' && (
              <div className="space-y-2">
                <Label className="text-base font-semibold">Scenario</Label>
                <Textarea
                  value={scenario}
                  onChange={(e) => setScenario(e.target.value)}
                  placeholder="Enter the scenario to validate..."
                  className="min-h-[120px] resize-none"
                />
              </div>
            )}

            {/* Generate Button */}
            <div className="flex justify-center pt-4">
              <Button
                onClick={generateContent}
                disabled={isLoading}
                className="px-8 py-3 text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                size="lg"
              >
                <Zap className="w-5 h-5 mr-2" />
                {isLoading ? "Generating..." : `Generate ${utilities.find(u => u.id === selectedUtility)?.title} Prompt`}
              </Button>
            </div>

            {/* Generated Output */}
            {generatedOutput && (
              <div className="space-y-2 pt-6">
                <Label className="text-base font-semibold">
                  {selectedUtility === 'scenario-realism' ? 'Realism Check Result' : 'Generated Prompt'}
                </Label>
                <Textarea
                  value={generatedOutput}
                  readOnly
                  className="min-h-[200px] resize-none bg-muted font-mono text-sm"
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}