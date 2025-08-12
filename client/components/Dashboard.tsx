import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Target,
  Package,
  Plus,
  Eye,
  ArrowUpRight
} from 'lucide-react';

const taskMetrics = [
  { title: 'Total Tasks', value: '247', change: '+12%', icon: Package, color: 'text-blue-600' },
  { title: 'Completed Today', value: '18', change: '+8%', icon: CheckCircle2, color: 'text-success' },
  { title: 'Pending Review', value: '32', change: '-5%', icon: Clock, color: 'text-warning' },
  { title: 'Active Users', value: '12', change: '+2%', icon: Users, color: 'text-info' },
];

const recentTasks = [
  {
    id: 'TSK-001',
    title: 'Customer Support Response Analysis',
    trainer: 'Sarah Johnson',
    status: 'pending_review',
    priority: 'high',
    created: '2 hours ago',
  },
  {
    id: 'TSK-002',
    title: 'Product Description Enhancement',
    trainer: 'Mike Chen',
    status: 'calibration',
    priority: 'medium',
    created: '4 hours ago',
  },
  {
    id: 'TSK-003',
    title: 'Email Template Optimization',
    trainer: 'Emma Wilson',
    status: 'in_progress',
    priority: 'low',
    created: '1 day ago',
  },
  {
    id: 'TSK-004',
    title: 'Chat Bot Training Data',
    trainer: 'Alex Rivera',
    status: 'rework',
    priority: 'high',
    created: '2 days ago',
  },
];

const getStatusBadge = (status: string) => {
  const variants = {
    'pending_review': { label: 'Pending Review', variant: 'secondary' as const },
    'calibration': { label: 'Calibration', variant: 'default' as const },
    'in_progress': { label: 'In Progress', variant: 'outline' as const },
    'rework': { label: 'Rework', variant: 'destructive' as const },
    'approved': { label: 'Approved', variant: 'secondary' as const },
  };
  return variants[status as keyof typeof variants] || { label: status, variant: 'outline' as const };
};

const getPriorityColor = (priority: string) => {
  const colors = {
    high: 'text-red-600',
    medium: 'text-yellow-600',
    low: 'text-green-600',
  };
  return colors[priority as keyof typeof colors] || 'text-gray-600';
};

export function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor task progress, review queues, and team performance
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Task
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {taskMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {metric.title}
                </CardTitle>
                <Icon className={`w-4 h-4 ${metric.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className={metric.change.startsWith('+') ? 'text-success' : 'text-destructive'}>
                    {metric.change}
                  </span>
                  {' '}from last week
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Workflow Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow Progress</CardTitle>
          <CardDescription>
            Current status of tasks through the workflow pipeline
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Creation to Review</span>
                <span className="text-sm text-muted-foreground">75%</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Review to Calibration</span>
                <span className="text-sm text-muted-foreground">60%</span>
              </div>
              <Progress value={60} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Calibration to Delivery</span>
                <span className="text-sm text-muted-foreground">85%</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Tasks */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Tasks</CardTitle>
            <CardDescription>
              Latest task submissions and their current status
            </CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-2" />
            View All
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTasks.map((task) => {
              const statusInfo = getStatusBadge(task.status);
              return (
                <div key={task.id} className="flex items-center justify-between p-4 bg-accent/50 rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium">{task.title}</h4>
                      <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                      <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>ID: {task.id}</span>
                      <span>By {task.trainer}</span>
                      <span>{task.created}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ArrowUpRight className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Action Items */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Attention Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Tasks awaiting review (>48h)</span>
              <Badge variant="destructive">3</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Failed validation checks</span>
              <Badge variant="destructive">2</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Overdue calibrations</span>
              <Badge variant="secondary">1</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-success" />
              Performance Highlights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Tasks completed this week</span>
              <Badge variant="secondary">47</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Average review time</span>
              <Badge variant="secondary">2.3h</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Approval rate</span>
              <Badge variant="secondary">94%</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}