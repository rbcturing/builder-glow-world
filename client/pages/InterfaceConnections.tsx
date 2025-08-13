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
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Network, 
  Plus, 
  Trash2, 
  CheckCircle, 
  XCircle,
  Settings,
  Zap,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Connection {
  id: string;
  name: string;
  endpoint: string;
  status: 'connected' | 'disconnected' | 'testing';
  lastTested: string;
  responseTime?: number;
}

export default function InterfaceConnections() {
  const [connections, setConnections] = useState<Connection[]>([
    {
      id: '1',
      name: 'API Gateway',
      endpoint: 'https://api.example.com/v1',
      status: 'connected',
      lastTested: '2024-01-15 10:30:00',
      responseTime: 120
    },
    {
      id: '2', 
      name: 'Database Service',
      endpoint: 'postgresql://localhost:5432/taskdb',
      status: 'connected',
      lastTested: '2024-01-15 10:25:00',
      responseTime: 45
    },
    {
      id: '3',
      name: 'Redis Cache',
      endpoint: 'redis://localhost:6379',
      status: 'disconnected',
      lastTested: '2024-01-15 09:15:00'
    }
  ]);

  const [newConnection, setNewConnection] = useState({
    name: '',
    endpoint: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const addConnection = () => {
    if (!newConnection.name.trim() || !newConnection.endpoint.trim()) {
      toast({
        title: "Error",
        description: "Please enter both name and endpoint",
        variant: "destructive",
      });
      return;
    }

    const connection: Connection = {
      id: Date.now().toString(),
      name: newConnection.name,
      endpoint: newConnection.endpoint,
      status: 'disconnected',
      lastTested: 'Never'
    };

    setConnections(prev => [...prev, connection]);
    setNewConnection({ name: '', endpoint: '' });
    
    toast({
      title: "Success",
      description: "Connection added successfully",
    });
  };

  const removeConnection = (id: string) => {
    setConnections(prev => prev.filter(conn => conn.id !== id));
    toast({
      title: "Success",
      description: "Connection removed",
    });
  };

  const testConnection = async (id: string) => {
    setConnections(prev => prev.map(conn => 
      conn.id === id ? { ...conn, status: 'testing' } : conn
    ));

    // Simulate connection test
    setTimeout(() => {
      const isSuccess = Math.random() > 0.3; // 70% success rate
      const responseTime = Math.floor(Math.random() * 500) + 50;
      
      setConnections(prev => prev.map(conn => 
        conn.id === id ? {
          ...conn,
          status: isSuccess ? 'connected' : 'disconnected',
          lastTested: new Date().toLocaleString(),
          responseTime: isSuccess ? responseTime : undefined
        } : conn
      ));

      toast({
        title: isSuccess ? "Success" : "Error",
        description: isSuccess 
          ? `Connection successful (${responseTime}ms)`
          : "Connection failed",
        variant: isSuccess ? "default" : "destructive",
      });
    }, 2000);
  };

  const testAllConnections = async () => {
    setIsLoading(true);
    
    // Test all connections sequentially
    for (const connection of connections) {
      await new Promise(resolve => {
        testConnection(connection.id);
        setTimeout(resolve, 2500);
      });
    }
    
    setIsLoading(false);
    toast({
      title: "Complete",
      description: "All connections tested",
    });
  };

  const getStatusIcon = (status: Connection['status']) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'disconnected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'testing':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <XCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: Connection['status']) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800">Connected</Badge>;
      case 'disconnected':
        return <Badge variant="destructive">Disconnected</Badge>;
      case 'testing':
        return <Badge className="bg-blue-100 text-blue-800">Testing...</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const connectedCount = connections.filter(c => c.status === 'connected').length;
  const totalCount = connections.length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Interface Connections</h1>
          <p className="text-muted-foreground">
            Manage and monitor external service connections
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-2">
            <Network className="w-4 h-4" />
            {connectedCount}/{totalCount} Connected
          </Badge>
          <Button 
            onClick={testAllConnections}
            disabled={isLoading}
            variant="outline"
          >
            <Zap className="w-4 h-4 mr-2" />
            {isLoading ? "Testing..." : "Test All"}
          </Button>
        </div>
      </div>

      {/* Connection Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Connections</p>
                <p className="text-2xl font-bold">{totalCount}</p>
              </div>
              <Network className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Connected</p>
                <p className="text-2xl font-bold text-green-600">{connectedCount}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Disconnected</p>
                <p className="text-2xl font-bold text-red-600">
                  {connections.filter(c => c.status === 'disconnected').length}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Response</p>
                <p className="text-2xl font-bold text-blue-600">
                  {Math.round(
                    connections
                      .filter(c => c.responseTime)
                      .reduce((sum, c) => sum + (c.responseTime || 0), 0) /
                    connections.filter(c => c.responseTime).length || 0
                  )}ms
                </p>
              </div>
              <RefreshCw className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add New Connection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add New Connection
          </CardTitle>
          <CardDescription>
            Add a new external service connection to monitor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="conn-name">Connection Name</Label>
              <Input
                id="conn-name"
                placeholder="e.g., API Gateway"
                value={newConnection.name}
                onChange={(e) => setNewConnection(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="conn-endpoint">Endpoint</Label>
              <Input
                id="conn-endpoint"
                placeholder="e.g., https://api.example.com"
                value={newConnection.endpoint}
                onChange={(e) => setNewConnection(prev => ({ ...prev, endpoint: e.target.value }))}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={addConnection} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Connection
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connections Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Connection Status
          </CardTitle>
          <CardDescription>
            Monitor and manage all interface connections
          </CardDescription>
        </CardHeader>
        <CardContent>
          {connections.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No connections configured. Add a connection to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Endpoint</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Response Time</TableHead>
                  <TableHead>Last Tested</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {connections.map((connection) => (
                  <TableRow key={connection.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(connection.status)}
                        {connection.name}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {connection.endpoint}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(connection.status)}
                    </TableCell>
                    <TableCell>
                      {connection.responseTime ? (
                        <Badge variant="outline" className="text-xs">
                          {connection.responseTime}ms
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {connection.lastTested}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => testConnection(connection.id)}
                          disabled={connection.status === 'testing'}
                        >
                          <Zap className="w-3 h-3 mr-1" />
                          Test
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeConnection(connection.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Connection Health Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Connection Health</CardTitle>
          <CardDescription>
            Overall system connectivity status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">System Health</span>
              <Badge 
                className={
                  connectedCount === totalCount 
                    ? "bg-green-100 text-green-800" 
                    : connectedCount > totalCount / 2
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }
              >
                {connectedCount === totalCount 
                  ? "Excellent" 
                  : connectedCount > totalCount / 2
                  ? "Good"
                  : "Poor"
                }
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Connection Success Rate</span>
                <span>{totalCount > 0 ? Math.round((connectedCount / totalCount) * 100) : 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${totalCount > 0 ? (connectedCount / totalCount) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}