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
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Zap, 
  FileText,
  Lightbulb,
  Target
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ValidationResult {
  isValid: boolean;
  score: number;
  feedback: string[];
  suggestions: string[];
  errors: string[];
}

export default function InstructionValidation() {
  const [instruction, setInstruction] = useState("");
  const [environment, setEnvironment] = useState("");
  const [interface_, setInterface] = useState("");
  const [taskType, setTaskType] = useState("");
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  
  const { toast } = useToast();

  const validateInstruction = async () => {
    if (!instruction.trim()) {
      toast({
        title: "Error",
        description: "Please enter an instruction to validate",
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
          instruction,
          environment,
          interface: interface_,
          taskType,
        }),
      });

      const data = await response.json();

      if (data.status === "success") {
        setValidation(data.validation);
        toast({
          title: "Validation Complete",
          description: `Score: ${data.validation.score}/100`,
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Instruction Validation</h1>
          <p className="text-muted-foreground">
            Validate and improve your task instructions for better AI performance
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Target className="w-4 h-4" />
          Instruction Quality Checker
        </Badge>
      </div>

      {/* Example Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Example Instructions
          </CardTitle>
          <CardDescription>
            Click on an example to load it for validation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {exampleInstructions.map((example, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">{example.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-3">
                      {example.instruction}
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => loadExample(example.instruction)}
                      className="w-full"
                    >
                      Load Example
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Instruction Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Instruction to Validate
          </CardTitle>
          <CardDescription>
            Enter the instruction you want to validate and improve
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="instruction">Instruction Text</Label>
            <Textarea
              id="instruction"
              placeholder="Enter your task instruction here..."
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              className="min-h-[150px]"
            />
            <div className="text-xs text-muted-foreground">
              Character count: {instruction.length}
            </div>
          </div>

          {/* Optional Context Fields */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="environment">Environment (Optional)</Label>
              <Input
                id="environment"
                placeholder="e.g., hr_payroll, finance"
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="interface">Interface (Optional)</Label>
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
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-type">Task Type (Optional)</Label>
              <Select value={taskType} onValueChange={setTaskType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select task type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="classification">Classification</SelectItem>
                  <SelectItem value="sentiment">Sentiment Analysis</SelectItem>
                  <SelectItem value="extraction">Data Extraction</SelectItem>
                  <SelectItem value="summarization">Summarization</SelectItem>
                  <SelectItem value="qa">Question Answering</SelectItem>
                  <SelectItem value="generation">Text Generation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={validateInstruction}
            disabled={isValidating || !instruction.trim()}
            className="w-full"
            size="lg"
          >
            <Zap className="w-4 h-4 mr-2" />
            {isValidating ? "Validating..." : "Validate Instruction"}
          </Button>
        </CardContent>
      </Card>

      {/* Validation Results */}
      {validation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {validation.isValid ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                Validation Results
              </div>
              <Badge className={getScoreBadge(validation.score).color}>
                {getScoreBadge(validation.score).label}
              </Badge>
            </CardTitle>
            <CardDescription>
              Overall Quality Score: {validation.score}/100
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Score Progress */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Quality Score</Label>
                <span className={`font-bold ${getScoreColor(validation.score)}`}>
                  {validation.score}/100
                </span>
              </div>
              <Progress value={validation.score} className="w-full" />
            </div>

            {/* Errors */}
            {validation.errors.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                  <h4 className="font-semibold text-red-600">Errors ({validation.errors.length})</h4>
                </div>
                <div className="space-y-2">
                  {validation.errors.map((error, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-red-700">{error}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {validation.suggestions.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                  <h4 className="font-semibold text-yellow-600">Suggestions ({validation.suggestions.length})</h4>
                </div>
                <div className="space-y-2">
                  {validation.suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-yellow-700">{suggestion}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Positive Feedback */}
            {validation.feedback.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <h4 className="font-semibold text-green-600">Positive Feedback ({validation.feedback.length})</h4>
                </div>
                <div className="space-y-2">
                  {validation.feedback.map((feedback, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-green-700">{feedback}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Validation Summary */}
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">Validation Summary</h4>
              <div className="grid gap-2 md:grid-cols-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <span className={`ml-2 font-medium ${validation.isValid ? 'text-green-600' : 'text-red-600'}`}>
                    {validation.isValid ? 'Valid' : 'Needs Improvement'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Errors:</span>
                  <span className="ml-2 font-medium text-red-600">{validation.errors.length}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Suggestions:</span>
                  <span className="ml-2 font-medium text-yellow-600">{validation.suggestions.length}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validation Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Tips for Better Instructions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-semibold text-green-600">✅ Do</h4>
              <ul className="space-y-1 text-sm">
                <li>• Be specific and clear about the expected output</li>
                <li>• Include examples when possible</li>
                <li>• Specify the output format (JSON, list, etc.)</li>
                <li>• Use action verbs (analyze, classify, extract)</li>
                <li>• Add constraints and requirements</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-red-600">❌ Don't</h4>
              <ul className="space-y-1 text-sm">
                <li>• Use ambiguous language (maybe, might, could)</li>
                <li>• Make instructions too short or vague</li>
                <li>• Forget to specify output requirements</li>
                <li>• Use overly complex sentences</li>
                <li>• Leave room for multiple interpretations</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}