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
import { Plus, Upload, FileText, Save, Send } from "lucide-react";

export default function CreateTask() {
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
          <Button>
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
                  <Input id="task-id" placeholder="TSK-001" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Complexity</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select complexity" />
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
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="database">Database</Label>
                <Input
                  id="database"
                  placeholder="Enter a descriptive title for the task"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Provide detailed instructions for this training task..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select>
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
                  <Select>
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
                  <Button variant="outline" size="sm">
                    <FileText className="w-4 h-4 mr-2" />
                    Validate JSON
                  </Button>
                  <Button variant="outline" size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Load Template
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
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
