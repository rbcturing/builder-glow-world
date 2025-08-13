import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  PlusCircle,
  ClipboardList,
  Target,
  Users,
  Settings,
  CheckCircle2,
  Clock,
  AlertCircle,
  Package,
  Zap,
  BarChart3,
  Link as LinkIcon,
  Database,
  Network,
  FileCheck,
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Create Task", href: "/create", icon: PlusCircle },
  { name: "Review Queue", href: "/review", icon: ClipboardList },
  { name: "Task Framework", href: "/framework", icon: Zap },
  { name: "Task Tracker", href: "/tracker", icon: BarChart3 },
  { name: "Chain Analyzer", href: "/chain-analyzer", icon: LinkIcon },
  { name: "DB Connections", href: "/db-connections", icon: Database },
  { name: "Interface Connections", href: "/interface-connections", icon: Network },
  { name: "Instruction Validation", href: "/instruction-validation", icon: FileCheck },
  { name: "Calibration", href: "/calibration", icon: Target },
  { name: "Delivery Batch", href: "/delivery", icon: Package },
];

const statusItems = [
  { name: "In Progress", count: 12, icon: Clock, color: "text-blue-600" },
  {
    name: "Pending Review",
    count: 8,
    icon: AlertCircle,
    color: "text-warning",
  },
  { name: "Rework", count: 3, icon: AlertCircle, color: "text-destructive" },
  { name: "Calibration", count: 5, icon: Target, color: "text-info" },
  {
    name: "Delivery Batch",
    count: 15,
    icon: CheckCircle2,
    color: "text-success",
  },
];

export function Layout({ children }: LayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold">T</span>
                </div>
                <h1 className="text-xl font-bold text-foreground">TaskFlow</h1>
              </div>

              <nav className="hidden md:flex items-center space-x-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={cn(
                        "flex items-center gap-1 px-2 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap",
                        location.pathname === item.href
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent",
                      )}
                    >
                      <Icon className="w-3 h-3" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <button className="p-2 text-muted-foreground hover:text-foreground">
                <Settings className="w-5 h-5" />
              </button>
              <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:flex lg:w-80 lg:flex-col">
          <div className="flex-1 px-6 py-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                  Task Status Overview
                </h3>
                <div className="space-y-3">
                  {statusItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.name}
                        className="flex items-center justify-between p-3 bg-card rounded-lg border"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={cn("w-4 h-4", item.color)} />
                          <span className="text-sm font-medium">
                            {item.name}
                          </span>
                        </div>
                        <span className="text-lg font-bold text-foreground">
                          {item.count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 px-6 py-8 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
