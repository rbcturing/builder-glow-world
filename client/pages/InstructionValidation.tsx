import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  CheckCircle, 
  Zap, 
  FileText,
  Target,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function InstructionValidation() {
  const [initialPrompt, setInitialPrompt] = useState("");
  const [examples, setExamples] = useState("");
  const [policy, setPolicy] = useState("");
  const [instruction, setInstruction] = useState("");
  const [model, setModel] = useState("claude-3-5-sonnet-20241022");
  const [validationResult, setValidationResult] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const { toast } = useToast();

  // Load initial prompt and examples on component mount
  useEffect(() => {
    const fetchInitialPrompt = async () => {
      try {
        const response = await fetch("/api/validate/instruction", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "fetch_initial_prompt"
          }),
        });

        const data = await response.json();
        if (data.status === "success") {
          setInitialPrompt(data.initial_prompt || "");
          setExamples(data.examples || "");
        }
      } catch (error) {
        console.error("Failed to fetch initial prompt:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialPrompt();
  }, []);

  const validateInstruction = async () => {
    if (!initialPrompt || !policy || !instruction) {
      toast({
        title: "Error",
        description: "Please fill in all required fields before validating.",
        variant: "destructive",
      });
      return;
    }

    if (!model) {
      toast({
        title: "Error", 
        description: "Please select a model before validating.",
        variant: "destructive",
      });
      return;
    }

    setIsValidating(true);
    try {
      const response = await fetch("/api/validate/instruction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "validate_instruction",
          initial_prompt: initialPrompt,
          policy: policy,
          instruction: instruction,
          model: model,
          examples: examples
        }),
      });

      const data = await response.json();

      if (data.status === "success") {
        setValidationResult(data.validation_result);
        toast({
          title: "Validation Complete",
          description: "Instruction validated successfully",
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Validation failed",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to validate instruction",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { variant: "default", label: "Excellent", color: "bg-green-100 text-green-800" };
    if (score >= 80) return { variant: "default", label: "Good", color: "bg-blue-100 text-blue-800" };
    if (score >= 70) return { variant: "default", label: "Acceptable", color: "bg-yellow-100 text-yellow-800" };
    return { variant: "destructive", label: "Needs Improvement", color: "bg-red-100 text-red-800" };
  };

  const exampleInstructions = [
    {
      title: "Classification Task",
      instruction: "Classify the sentiment of the given text as positive, negative, or neutral. Analyze the emotional tone and context carefully. Return only one of these three labels: 'positive', 'negative', or 'neutral'."
    },
    {
      title: "Data Extraction",
      instruction: "Extract all email addresses from the provided text. Return them as a JSON array. If no email addresses are found, return an empty array []."
    },
    {
      title: "Text Summarization", 
      instruction: "Summarize the given article in exactly 3 sentences. Focus on the main points and key findings. Ensure the summary is concise and captures the essential information."
    }
  ];

  const loadExample = (instruction: string) => {
    setInstruction(instruction);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Loading initial prompt...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header - Matching Dashboard Style */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Instruction Validation
        </h1>
        <div className="flex items-center justify-center gap-4">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-blue-500"></div>
          <span className="text-sm uppercase tracking-wider text-muted-foreground">
            Validation & Quality Assurance
          </span>
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-blue-500"></div>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Ensure your instructions meet the highest standards.
        </p>
      </div>

      {/* Main Content Card - Matching Dashboard Layout */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Instruction Validation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Model Selection */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Select Anthropic Model</Label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="claude-3-5-sonnet-20241022">claude-3-5-sonnet</SelectItem>
                <SelectItem value="claude-3-5-haiku-20241022">claude-3-5-haiku</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Initial Prompt */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Initial Prompt</Label>
            <Textarea
              value={initialPrompt}
              onChange={(e) => setInitialPrompt(e.target.value)}
              placeholder="Enter the initial task prompt here..."
              className="min-h-[200px] resize-none"
            />
          </div>

          {/* Examples */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Examples</Label>
            <Textarea
              value={examples}
              onChange={(e) => setExamples(e.target.value)}
              placeholder="Enter examples for validation..."
              className="min-h-[200px] resize-none"
            />
          </div>

          {/* Instruction */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Instruction</Label>
            <Textarea
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="Enter the instruction to validate..."
              className="min-h-[200px] resize-none"
            />
          </div>

          {/* Policy */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Policy</Label>
            <Textarea
              value={policy}
              onChange={(e) => setPolicy(e.target.value)}
              placeholder="Enter the policy to validate against..."
              className="min-h-[200px] resize-none"
            />
          </div>

          {/* Validate Button */}
          <div className="flex justify-center pt-4">
            <Button
              onClick={validateInstruction}
              disabled={isValidating || !initialPrompt || !policy || !instruction}
              className="px-8 py-3 text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              size="lg"
            >
              {isValidating ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Validating...
                </div>
              ) : (
                "Validate Instruction"
              )}
            </Button>
          </div>

          {/* Validation Result */}
          {validationResult && (
            <div className="space-y-2 pt-6">
              <Label className="text-base font-semibold">LLM Response</Label>
              <Textarea
                value={validationResult}
                readOnly
                className="min-h-[200px] resize-none bg-muted"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}