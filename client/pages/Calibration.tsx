import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';

export default function Calibration() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calibration Center</h1>
          <p className="text-muted-foreground">
            Final quality check before tasks enter the delivery batch
          </p>
        </div>
        <Button>
          <Target className="w-4 h-4 mr-2" />
          Start Calibration
        </Button>
      </div>

      {/* Calibration Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Awaiting Calibration</CardTitle>
            <AlertCircle className="w-4 h-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success">+2</span> since yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calibrated Today</CardTitle>
            <CheckCircle2 className="w-4 h-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success">+25%</span> from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
            <TrendingUp className="w-4 h-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">96%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success">+2%</span> improvement
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Calibration Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Calibration Progress</CardTitle>
          <CardDescription>
            Track quality metrics and calibration effectiveness
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Accuracy Score</span>
              <span className="text-sm text-muted-foreground">94%</span>
            </div>
            <Progress value={94} className="h-2" />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Consistency Rating</span>
              <span className="text-sm text-muted-foreground">89%</span>
            </div>
            <Progress value={89} className="h-2" />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Completion Rate</span>
              <span className="text-sm text-muted-foreground">98%</span>
            </div>
            <Progress value={98} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Tasks Awaiting Calibration */}
      <Card>
        <CardHeader>
          <CardTitle>Tasks Awaiting Calibration</CardTitle>
          <CardDescription>
            Recently approved tasks ready for final quality check
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tasks in calibration queue</h3>
            <p className="text-muted-foreground">
              Tasks will appear here after they pass the review stage
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
