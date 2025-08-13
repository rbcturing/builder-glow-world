import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PlusCircle,
  ClipboardList,
  Zap,
  BarChart3,
  Link as LinkIcon,
  Database,
  Network,
  FileCheck,
  Target,
  Package,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Users,
  CheckCircle,
} from "lucide-react";

const features = [
  {
    title: "Create Task",
    description: "Create new training tasks with JSON configuration and validation",
    icon: PlusCircle,
    href: "/create",
    color: "bg-blue-500",
    category: "Task Management"
  },
  {
    title: "Review Queue",
    description: "Review and approve tasks submitted by trainers",
    icon: ClipboardList,
    href: "/review",
    color: "bg-green-500",
    category: "Task Management"
  },
  {
    title: "Task Framework",
    description: "Execute API functions within different domains and interfaces",
    icon: Zap,
    href: "/framework",
    color: "bg-purple-500",
    category: "Development Tools"
  },
  {
    title: "Task Tracker",
    description: "Real-time analytics dashboard for monitoring training tasks",
    icon: BarChart3,
    href: "/tracker",
    color: "bg-orange-500",
    category: "Analytics"
  },
  {
    title: "Chain Analyzer",
    description: "Analyze Python functions and build execution chains",
    icon: LinkIcon,
    href: "/chain-analyzer",
    color: "bg-cyan-500",
    category: "Development Tools"
  },
  {
    title: "DB Connections",
    description: "Generate database utilities, policies, and scenarios",
    icon: Database,
    href: "/db-connections",
    color: "bg-indigo-500",
    category: "Database Tools"
  },
  {
    title: "Interface Connections",
    description: "Manage and monitor external service connections",
    icon: Network,
    href: "/interface-connections",
    color: "bg-teal-500",
    category: "Infrastructure"
  },
  {
    title: "Instruction Validation",
    description: "Validate and improve task instructions for better AI performance",
    icon: FileCheck,
    href: "/instruction-validation",
    color: "bg-pink-500",
    category: "Quality Assurance"
  },
  {
    title: "Calibration",
    description: "Calibrate and fine-tune model parameters",
    icon: Target,
    href: "/calibration",
    color: "bg-red-500",
    category: "Model Management"
  },
  {
    title: "Delivery Batch",
    description: "Manage and deploy task batches for production",
    icon: Package,
    href: "/delivery",
    color: "bg-yellow-500",
    category: "Deployment"
  }
];

const stats = [
  {
    title: "Total Tasks",
    value: "274",
    change: "+12%",
    icon: BarChart3,
    color: "text-blue-600"
  },
  {
    title: "Active Users",
    value: "48",
    change: "+5%",
    icon: Users,
    color: "text-green-600"
  },
  {
    title: "Completion Rate",
    value: "94%",
    change: "+2%",
    icon: CheckCircle,
    color: "text-purple-600"
  },
  {
    title: "Success Rate",
    value: "87%",
    change: "+8%",
    icon: TrendingUp,
    color: "text-orange-600"
  }
];

const categories = [
  "Task Management",
  "Development Tools", 
  "Analytics",
  "Database Tools",
  "Infrastructure",
  "Quality Assurance",
  "Model Management",
  "Deployment"
];

export default function Index() {
  const groupedFeatures = categories.reduce((acc, category) => {
    acc[category] = features.filter(feature => feature.category === category);
    return acc;
  }, {} as Record<string, typeof features>);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            TaskFlow Dashboard
          </h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Complete task management and AI training platform with advanced analytics, 
          validation tools, and seamless workflow automation.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <Badge variant="outline" className="text-green-600">
                        {stat.change}
                      </Badge>
                    </div>
                  </div>
                  <Icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Jump to the most commonly used features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-4">
            <Button asChild className="h-auto p-4 flex-col gap-2">
              <Link to="/create">
                <PlusCircle className="w-6 h-6" />
                <span>Create Task</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-4 flex-col gap-2">
              <Link to="/tracker">
                <BarChart3 className="w-6 h-6" />
                <span>View Analytics</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-4 flex-col gap-2">
              <Link to="/framework">
                <Zap className="w-6 h-6" />
                <span>Task Framework</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-4 flex-col gap-2">
              <Link to="/review">
                <ClipboardList className="w-6 h-6" />
                <span>Review Queue</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Features by Category */}
      {Object.entries(groupedFeatures).map(([category, categoryFeatures]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              {category}
            </CardTitle>
            <CardDescription>
              {categoryFeatures.length} tools available in this category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {categoryFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card key={index} className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className={`w-10 h-10 ${feature.color} rounded-lg flex items-center justify-center`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="font-semibold group-hover:text-blue-600 transition-colors">
                            {feature.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {feature.description}
                          </p>
                        </div>
                        <Button asChild variant="outline" className="w-full">
                          <Link to={feature.href}>
                            Open {feature.title}
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Latest updates and system activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">New task created: Customer Support Analysis</p>
                <p className="text-xs text-muted-foreground">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Task Framework: API execution completed</p>
                <p className="text-xs text-muted-foreground">5 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Chain Analyzer: New function chain generated</p>
                <p className="text-xs text-muted-foreground">12 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Task Tracker: Weekly report generated</p>
                <p className="text-xs text-muted-foreground">1 hour ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            System Status
          </CardTitle>
          <CardDescription>
            All systems operational
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">API Services</span>
              </div>
              <Badge className="bg-green-100 text-green-800">Operational</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">Database</span>
              </div>
              <Badge className="bg-green-100 text-green-800">Operational</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">Analytics</span>
              </div>
              <Badge className="bg-green-100 text-green-800">Operational</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}