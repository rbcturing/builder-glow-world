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
import { Plus, Upload, FileText, Save, Send, CheckCircle, AlertCircle, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ValidationResult {
  isValid: boolean;
  score: number;
  feedback: string[];
  suggestions: string[];
  errors: string[];
}

export default function CreateTask() {
  const [taskData, setTaskData] = useState({
    taskId: "",
    title: "",
    database: "",
    interface: "",
    description: "",
    category: "",
    priority: "",
    duration: "",
    jsonConfig: ""
  });
  
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setTaskData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateInstruction = async () => {
    if (!taskData.description) {
      toast({
        title: "Error",
        description: "Please enter a description to validate",
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
          instruction: taskData.description,
          environment: taskData.database,
          interface: taskData.interface,
          taskType: taskData.category,
        }),
      });

      const data = await response.json();
      if (data.status === "success") {
        setValidation(data.validation);
        toast({
          title: "Validation Complete",
          description: `Score: ${data.validation.score}/100`,
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

  const validateTask = async () => {
    setIsValidating(true);
    try {
      const response = await fetch("/api/validate/task", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          taskData,
        }),
      });

      const data = await response.json();
      if (data.status === "success") {
        setValidation(data.validation);
        toast({
          title: "Task Validation Complete",
          description: `Score: ${data.validation.score}/100`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to validate task",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const submitTask = async () => {
    try {
      const response = await fetch("/api/tasks/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          taskId: taskData.taskId,
          title: taskData.title,
          assignedTo: "current-user@company.com", // In real app, get from auth
          priority: taskData.priority,
          category: taskData.category,
          description: taskData.description,
          dueDate: "", // Could add date picker
        }),
      });

      const data = await response.json();
      if (data.status === "success") {
        toast({
          title: "Success",
          description: "Task created successfully",
        });
        // Reset form
        setTaskData({
          taskId: "",
          title: "",
          database: "",
          interface: "",
          description: "",
          category: "",
          priority: "",
          duration: "",
          jsonConfig: ""
        });
        setValidation(null);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Task</h1>
          <p className="text-muted-foreground">
            Create new training tasks with JSON configuration
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import JSON
          </Button>
          <Button onClick={submitTask} disabled={!taskData.taskId || !taskData.title}>
            <Send className="w-4 h-4 mr-2" />
            Submit Task
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Task Details</CardTitle>
              <CardDescription>
                Define the basic information for your training task
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="task-id">Task ID</Label>
                  <Input 
                    id="task-id" 
                    placeholder="TSK-001" 
                    value={taskData.taskId}
                    onChange={(e) => handleInputChange("taskId", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={taskData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Task Title</Label>
                <Input
                  id="title"
                  placeholder="Enter a descriptive title for the task"
                  value={taskData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="database">Database</Label>
                <Input
                  id="database"
                  placeholder="Enter the database name"
                  value={taskData.database}
                  onChange={(e) => handleInputChange("database", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="interface">Interface</Label>
                <Input
                  id="interface"
                  placeholder="Enter the interface number"
                  value={taskData.interface}
                  onChange={(e) => handleInputChange("interface", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Provide detailed instructions for this training task..."
                  className="min-h-[100px]"
                  value={taskData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                />
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={validateInstruction}
                    disabled={isValidating || !taskData.description}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    {isValidating ? "Validating..." : "Validate Instruction"}
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={taskData.category} onValueChange={(value) => handleInputChange("category", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text-analysis">
                        Text Analysis
                      </SelectItem>
                      <SelectItem value="sentiment">
                        Sentiment Analysis
                      </SelectItem>
                      <SelectItem value="classification">
                        Classification
                      </SelectItem>
                      <SelectItem value="qa">Q&A Training</SelectItem>
                      <SelectItem value="dialogue">
                        Dialogue Training
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expected-duration">Expected Duration</Label>
                  <Select value={taskData.duration} onValueChange={(value) => handleInputChange("duration", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15min">15 minutes</SelectItem>
                      <SelectItem value="30min">30 minutes</SelectItem>
                      <SelectItem value="1hour">1 hour</SelectItem>
                      <SelectItem value="2hours">2 hours</SelectItem>
                      <SelectItem value="4hours">4+ hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>JSON Configuration</CardTitle>
              <CardDescription>
                Define the task configuration in JSON format
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  value={taskData.jsonConfig}
                  onChange={(e) => handleInputChange("jsonConfig", e.target.value)}
                  placeholder={`{
  "task_type": "text_classification",
  "instructions": "Classify the sentiment of the given text",
  "examples": [
    {
      "input": "I love this product!",
      "output": "positive"
    }
  ],
  "validation_rules": {
    "min_examples": 5,
    "required_fields": ["input", "output"]
  }
}`}
                  className="min-h-[300px] font-mono text-sm"
                />
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={validateTask}
                    disabled={isValidating}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    {isValidating ? "Validating..." : "Validate Task"}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Load Template
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Validation Results */}
          {validation && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {validation.isValid ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                  Validation Results
                </CardTitle>
                <CardDescription>
                  Score: {validation.score}/100
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={validation.score} className="w-full" />
                
                {validation.errors.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-red-600">Errors</h4>
                    <ul className="text-sm space-y-1">
                      {validation.errors.map((error, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <AlertCircle className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {validation.suggestions.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-yellow-600">Suggestions</h4>
                    <ul className="text-sm space-y-1">
                      {validation.suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <AlertCircle className="w-3 h-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {validation.feedback.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-green-600">Feedback</h4>
                    <ul className="text-sm space-y-1">
                      {validation.feedback.map((feedback, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                          {feedback}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Task Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Configuration</span>
                <Badge variant="secondary">In Progress</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Validation</span>
                <Badge variant="outline">Pending</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Review</span>
                <Badge variant="outline">Pending</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Approval</span>
                <Badge variant="outline">Pending</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Preview Task
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Plus className="w-4 h-4 mr-2" />
                Add Example
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Validation Rules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Task ID must be unique</p>
              <p>• JSON must be valid format</p>
              <p>• At least 3 examples required</p>
              <p>• All required fields must be present</p>
              <p>• Instructions must be clear and concise</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
