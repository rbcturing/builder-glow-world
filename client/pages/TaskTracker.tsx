import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { 
  RefreshCw, 
  Plus, 
  Users, 
  Calendar, 
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  Filter,
  BarChart3,
  Target,
  GitMerge,
  GitPullRequest,
  XCircle,
  Zap,
  Search
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Matching the original Dashboard data structure
interface TaskData {
  "Task ID": string;
  "GitHub username": string;
  "Week num": string;
  "Created Date (completed)": string;
  "Pull Request Status": string;
  "Complexity": string;
  "Domain": string;
  "Interface": string;
  "Lead": string;
  "Calibrator": string;
  [key: string]: any;
}

interface UserMapping {
  "Username": string;
  "Email": string;
  "Full Name": string;
  "Role": string;
}

interface TeamStructure {
  "Team": string;
  "Lead": string;
  "Members": string;
  "Department": string;
  "Focus Area": string;
}

interface TrackerData {
  tasks_info: TaskData[];
  username_email_mapping: UserMapping[];
  team_structure: TeamStructure[];
}

interface FilterState {
  domain: string;
  interface: string;
  week: string;
  calibrator: string;
  pod: string;
  trainer: string;
  complexity: string;
  search: string;
}

interface Analytics {
  totalTasks: number;
  totalMergedTasks: number;
  totalResubmittedTasks: number;
  totalNeedsChangesTasks: number;
  pendingReviewTasks: number;
  totalDiscardedTasks: number;
  readyToMergeTasks: number;
  activePods: number;
  completionRate: number;
}

interface TrainerStats {
  name: string;
  merged: number;
  resubmitted: number;
  discarded: number;
  pending_review: number;
  ready_to_merge: number;
  needs_changes: number;
  total: number;
}

export default function TaskTracker() {
  const [trackerData, setTrackerData] = useState<TrackerData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    domain: "finance", // Set default current domain like in Dashboard
    interface: "all",
    week: "all",
    calibrator: "all",
    pod: "all",
    trainer: "all",
    complexity: "all",
    search: ""
  });
  
  const [currentDomain, setCurrentDomain] = useState("finance"); // Current working domain
  const { toast } = useToast();

  // Create username mapping for quick lookup
  const usernameMapping = useMemo(() => {
    if (!trackerData?.username_email_mapping) return {};
    const mapping: Record<string, string> = {};
    trackerData.username_email_mapping.forEach(user => {
      mapping[user.Username.toLowerCase()] = user["Full Name"];
    });
    return mapping;
  }, [trackerData?.username_email_mapping]);

  // Extract unique values for dropdowns
  const filterOptions = useMemo(() => {
    if (!trackerData?.tasks_info) return {
      domains: [],
      interfaces: [],
      weeks: [],
      calibrators: [],
      pods: [],
      trainers: [],
      complexities: []
    };

    const tasks = trackerData.tasks_info;
    const domains = [...new Set(tasks.map(t => t.Domain).filter(Boolean))];
    const interfaces = [...new Set(tasks.map(t => t.Interface).filter(Boolean))];
    const weeks = [...new Set(tasks.map(t => t["Week num"]).filter(Boolean))];
    const calibrators = [...new Set(tasks.map(t => t.Calibrator).filter(Boolean))];
    const pods = [...new Set(tasks.map(t => t.Lead).filter(Boolean))];
    const complexities = [...new Set(tasks.map(t => t.Complexity?.toLowerCase()).filter(Boolean))];
    
    // Get trainers from username mapping
    const trainers = [...new Set(Object.values(usernameMapping))];

    return {
      domains: domains.sort(),
      interfaces: interfaces.sort(),
      weeks: weeks.sort(),
      calibrators: calibrators.sort(),
      pods: pods.sort(),
      trainers: trainers.sort(),
      complexities: complexities.sort()
    };
  }, [trackerData?.tasks_info, usernameMapping]);

  // Filter tasks based on current filters
  const filteredTasks = useMemo(() => {
    if (!trackerData?.tasks_info) return [];

    return trackerData.tasks_info.filter(task => {
      const trainerName = usernameMapping[task["GitHub username"]?.toLowerCase()] || task["GitHub username"];
      
      return (
        (filters.domain === "all" || task.Domain === filters.domain) &&
        (filters.interface === "all" || task.Interface === filters.interface) &&
        (filters.week === "all" || task["Week num"] === filters.week) &&
        (filters.calibrator === "all" || task.Calibrator === filters.calibrator) &&
        (filters.pod === "all" || task.Lead === filters.pod) &&
        (filters.trainer === "all" || trainerName?.toLowerCase() === filters.trainer.toLowerCase()) &&
        (filters.complexity === "all" || task.Complexity?.toLowerCase() === filters.complexity) &&
        (filters.search === "" || 
          task["Task ID"]?.toLowerCase().includes(filters.search.toLowerCase()) ||
          trainerName?.toLowerCase().includes(filters.search.toLowerCase()) ||
          task.Domain?.toLowerCase().includes(filters.search.toLowerCase())
        )
      );
    });
  }, [trackerData?.tasks_info, filters, usernameMapping]);

  // Calculate analytics based on filtered tasks
  const analytics = useMemo((): Analytics => {
    if (!filteredTasks.length) {
      return {
        totalTasks: 0,
        totalMergedTasks: 0,
        totalResubmittedTasks: 0,
        totalNeedsChangesTasks: 0,
        pendingReviewTasks: 0,
        totalDiscardedTasks: 0,
        readyToMergeTasks: 0,
        activePods: 0,
        completionRate: 0
      };
    }

    const merged = filteredTasks.filter(t => t["Pull Request Status"] === "Merged").length;
    const resubmitted = filteredTasks.filter(t => t["Pull Request Status"] === "resubmitted").length;
    const needsChanges = filteredTasks.filter(t => t["Pull Request Status"] === "needs changes").length;
    const pendingReview = filteredTasks.filter(t => t["Pull Request Status"] === "pending review").length;
    const discarded = filteredTasks.filter(t => t["Pull Request Status"] === "discarded").length;
    const readyToMerge = filteredTasks.filter(t => t["Pull Request Status"] === "ready to merge").length;
    const activePods = new Set(filteredTasks.map(t => t.Lead).filter(Boolean)).size;

    return {
      totalTasks: filteredTasks.length,
      totalMergedTasks: merged,
      totalResubmittedTasks: resubmitted,
      totalNeedsChangesTasks: needsChanges,
      pendingReviewTasks: pendingReview,
      totalDiscardedTasks: discarded,
      readyToMergeTasks: readyToMerge,
      activePods,
      completionRate: filteredTasks.length > 0 ? Math.round((merged / filteredTasks.length) * 100) : 0
    };
  }, [filteredTasks]);

  // Calculate trainer statistics
  const trainerStats = useMemo((): TrainerStats[] => {
    if (!filteredTasks.length) return [];

    const stats: Record<string, TrainerStats> = {};

    filteredTasks.forEach(task => {
      const trainerName = usernameMapping[task["GitHub username"]?.toLowerCase()] || task["GitHub username"];
      
      if (!stats[trainerName]) {
        stats[trainerName] = {
          name: trainerName,
          merged: 0,
          resubmitted: 0,
          discarded: 0,
          pending_review: 0,
          ready_to_merge: 0,
          needs_changes: 0,
          total: 0
        };
      }

      stats[trainerName].total++;
      
      switch (task["Pull Request Status"]) {
        case "Merged":
          stats[trainerName].merged++;
          break;
        case "resubmitted":
          stats[trainerName].resubmitted++;
          break;
        case "discarded":
          stats[trainerName].discarded++;
          break;
        case "pending review":
          stats[trainerName].pending_review++;
          break;
        case "ready to merge":
          stats[trainerName].ready_to_merge++;
          break;
        case "needs changes":
          stats[trainerName].needs_changes++;
          break;
      }
    });

    return Object.values(stats).sort((a, b) => b.total - a.total);
  }, [filteredTasks, usernameMapping]);

  const loadTrackerData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/tracker", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.status === "success") {
        setTrackerData({
          tasks_info: data.tasks_info,
          username_email_mapping: data.username_email_mapping,
          team_structure: data.team_structure,
        });
        toast({
          title: "Success",
          description: `Loaded ${data.tasks_info.length} tasks`,
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to load tracker data",
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

  useEffect(() => {
    loadTrackerData();
  }, []);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));

    // Handle dependent filters (matching original Dashboard logic)
    if (key === "calibrator" && value !== "all") {
      // Reset pod and trainer when calibrator changes
      setFilters(prev => ({
        ...prev,
        [key]: value,
        pod: "all",
        trainer: "all"
      }));
    } else if (key === "pod" && value !== "all") {
      // Reset trainer when pod changes
      setFilters(prev => ({
        ...prev,
        [key]: value,
        trainer: "all"
      }));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "merged":
        return <GitMerge className="w-4 h-4 text-green-500" />;
      case "pending review":
        return <GitPullRequest className="w-4 h-4 text-blue-500" />;
      case "needs changes":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case "ready to merge":
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "resubmitted":
        return <RefreshCw className="w-4 h-4 text-blue-400" />;
      case "discarded":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity?.toLowerCase()) {
      case "expert":
        return "destructive";
      case "hard":
        return "default";
      case "medium":
        return "secondary";
      default:
        return "outline";
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Task Tracker</h1>
          <p className="text-muted-foreground">
            Real-Time Analytics Dashboard - Monitor and manage training tasks across teams
          </p>
          {filters.domain !== "all" && (
            <div className="mt-2">
              <Badge variant="outline" className="text-lg px-3 py-1">
                Current Domain: <span className="font-semibold ml-1">{filters.domain}</span>
              </Badge>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadTrackerData} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Reload Data
          </Button>
        </div>
      </div>

      {/* Analytics Overview */}
      <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-5">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                <p className="text-3xl font-bold text-blue-600">{analytics.totalTasks}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Completed tasks across all pods</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Merged Tasks</p>
                <p className="text-3xl font-bold text-green-600">{analytics.totalMergedTasks}</p>
              </div>
              <GitMerge className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Successfully merged PRs</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                <p className="text-3xl font-bold text-yellow-600">{analytics.pendingReviewTasks}</p>
              </div>
              <GitPullRequest className="w-8 h-8 text-yellow-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Awaiting review</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Needs Changes</p>
                <p className="text-3xl font-bold text-orange-600">{analytics.totalNeedsChangesTasks}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Requires modifications</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                <p className="text-3xl font-bold text-purple-600">{analytics.completionRate}%</p>
              </div>
              <Target className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Overall success rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Advanced Filters
          </CardTitle>
          <CardDescription>
            Filter tasks by domain, interface, week, calibrator, pod, trainer, and complexity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-8">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Domain</Label>
              <Select value={filters.domain} onValueChange={(value) => handleFilterChange("domain", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Domains" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Domains</SelectItem>
                  {filterOptions.domains.map(domain => (
                    <SelectItem key={domain} value={domain}>{domain}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Interface</Label>
              <Select value={filters.interface} onValueChange={(value) => handleFilterChange("interface", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Interfaces" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Interfaces</SelectItem>
                  {filterOptions.interfaces.map(interface_ => (
                    <SelectItem key={interface_} value={interface_}>{interface_}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Week</Label>
              <Select value={filters.week} onValueChange={(value) => handleFilterChange("week", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Weeks" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Weeks</SelectItem>
                  {filterOptions.weeks.map(week => (
                    <SelectItem key={week} value={week}>{week.replace('_', ' ').toUpperCase()}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Calibrator</Label>
              <Select value={filters.calibrator} onValueChange={(value) => handleFilterChange("calibrator", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Calibrators" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Calibrators</SelectItem>
                  {filterOptions.calibrators.map(calibrator => (
                    <SelectItem key={calibrator} value={calibrator}>{calibrator}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Pod</Label>
              <Select value={filters.pod} onValueChange={(value) => handleFilterChange("pod", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Pods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Pods</SelectItem>
                  {filterOptions.pods.map(pod => (
                    <SelectItem key={pod} value={pod}>{pod}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Trainer</Label>
              <Select value={filters.trainer} onValueChange={(value) => handleFilterChange("trainer", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Trainers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Trainers</SelectItem>
                  {filterOptions.trainers.map(trainer => (
                    <SelectItem key={trainer} value={trainer}>{trainer}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Complexity</Label>
              <Select value={filters.complexity} onValueChange={(value) => handleFilterChange("complexity", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Complexities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Complexities</SelectItem>
                  {filterOptions.complexities.map(complexity => (
                    <SelectItem key={complexity} value={complexity}>
                      {complexity.charAt(0).toUpperCase() + complexity.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task Distribution Table */}
      <Card>
        <CardHeader>
          <CardTitle>Task Distribution</CardTitle>
          <CardDescription>
            Showing {filteredTasks.length} of {trackerData?.tasks_info.length || 0} tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin mr-2" />
              Loading tasks...
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No tasks found matching the current filters
            </div>
          ) : (
            <div className="overflow-auto max-h-96">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task ID</TableHead>
                    <TableHead>Trainer</TableHead>
                    <TableHead>Week</TableHead>
                    <TableHead>Domain</TableHead>
                    <TableHead>Interface</TableHead>
                    <TableHead>Complexity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Pod</TableHead>
                    <TableHead>Calibrator</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.slice(0, 50).map((task, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{task["Task ID"]}</TableCell>
                      <TableCell className="text-green-600 font-medium">
                        {usernameMapping[task["GitHub username"]?.toLowerCase()] || task["GitHub username"]}
                      </TableCell>
                      <TableCell className="text-blue-600 font-medium">
                        {task["Week num"]?.replace('_', ' ').toUpperCase()}
                      </TableCell>
                      <TableCell>{task.Domain}</TableCell>
                      <TableCell>{task.Interface}</TableCell>
                      <TableCell>
                        <Badge variant={getComplexityColor(task.Complexity) as any}>
                          {task.Complexity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(task["Pull Request Status"])}
                          <span className="text-sm">{task["Pull Request Status"]}</span>
                        </div>
                      </TableCell>
                      <TableCell>{task.Lead}</TableCell>
                      <TableCell>{task.Calibrator}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(task["Created Date (completed)"])}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trainer Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Trainer Statistics
          </CardTitle>
          <CardDescription>
            Performance breakdown by trainer based on current filters
          </CardDescription>
        </CardHeader>
        <CardContent>
          {trainerStats.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No trainer statistics available
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Trainer</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Merged</TableHead>
                    <TableHead>Pending Review</TableHead>
                    <TableHead>Needs Changes</TableHead>
                    <TableHead>Ready to Merge</TableHead>
                    <TableHead>Resubmitted</TableHead>
                    <TableHead>Discarded</TableHead>
                    <TableHead>Success Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trainerStats.map((trainer) => (
                    <TableRow key={trainer.name}>
                      <TableCell className="font-medium text-green-600">{trainer.name}</TableCell>
                      <TableCell className="font-bold">{trainer.total}</TableCell>
                      <TableCell className="text-green-600 font-semibold">{trainer.merged}</TableCell>
                      <TableCell className="text-blue-600">{trainer.pending_review}</TableCell>
                      <TableCell className="text-orange-600">{trainer.needs_changes}</TableCell>
                      <TableCell className="text-green-400">{trainer.ready_to_merge}</TableCell>
                      <TableCell className="text-blue-400">{trainer.resubmitted}</TableCell>
                      <TableCell className="text-red-600">{trainer.discarded}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={trainer.total > 0 ? (trainer.merged / trainer.total) * 100 : 0} 
                            className="w-16" 
                          />
                          <span className="text-sm font-medium">
                            {trainer.total > 0 ? Math.round((trainer.merged / trainer.total) * 100) : 0}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Team Structure */}
      {trackerData?.team_structure && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Team Structure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {trackerData.team_structure.map((team, index) => (
                <Card key={index}>
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold">{team.Team}</h4>
                      <p className="text-sm text-muted-foreground">{team["Focus Area"]}</p>
                      <div className="text-sm">
                        <div><strong>Lead:</strong> {team.Lead}</div>
                        <div><strong>Department:</strong> {team.Department}</div>
                        <div><strong>Members:</strong> {team.Members}</div>
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