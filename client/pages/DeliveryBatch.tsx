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
  Package,
  Download,
  Send,
  Calendar,
  CheckCircle2,
  Clock,
} from "lucide-react";

export default function DeliveryBatch() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Delivery Batch</h1>
          <p className="text-muted-foreground">
            Manage completed tasks ready for delivery to clients
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Batch
          </Button>
          <Button>
            <Send className="w-4 h-4 mr-2" />
            Send Delivery
          </Button>
        </div>
      </div>

      {/* Delivery Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ready for Delivery
            </CardTitle>
            <Package className="w-4 h-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-muted-foreground">Completed tasks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
            <Clock className="w-4 h-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">Being delivered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Delivered Today
            </CardTitle>
            <CheckCircle2 className="w-4 h-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">Successfully sent</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">Total delivered</p>
          </CardContent>
        </Card>
      </div>

      {/* Current Batch */}
      <Card>
        <CardHeader>
          <CardTitle>Current Delivery Batch</CardTitle>
          <CardDescription>
            Tasks ready to be packaged and sent to clients
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                id: "TSK-015",
                title: "AI Model Training Dataset",
                client: "TechCorp Inc.",
                size: "2.3MB",
              },
              {
                id: "TSK-018",
                title: "Customer Feedback Analysis",
                client: "RetailCo",
                size: "1.8MB",
              },
              {
                id: "TSK-021",
                title: "Product Description Generator",
                client: "EcommercePlus",
                size: "3.1MB",
              },
              {
                id: "TSK-024",
                title: "Sentiment Classification Model",
                client: "SocialTech",
                size: "2.7MB",
              },
            ].map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-4 bg-accent/50 rounded-lg"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h4 className="font-medium">{task.title}</h4>
                    <Badge variant="secondary">Ready</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>ID: {task.id}</span>
                    <span>Client: {task.client}</span>
                    <span>Size: {task.size}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Delivery History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Deliveries</CardTitle>
          <CardDescription>
            Track completed deliveries and client feedback
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Latest delivery completed successfully
            </h3>
            <p className="text-muted-foreground">
              Batch #2024-001 delivered to 3 clients on March 15, 2024
            </p>
            <Button variant="outline" className="mt-4">
              View Delivery History
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
