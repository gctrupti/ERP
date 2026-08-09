import { useEffect, useState } from "react";
import { activityService } from "@/services/activity-service";
import { ActivityLog } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

export function ActivityTab() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await activityService.getRecentLogs();
      setLogs(data);
    } catch {
      toast.error("Failed to load activity logs");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="surface-card overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h2 className="text-sm font-semibold">Recent Activity</h2>
          <p className="text-xs text-muted-foreground">Preview of recent system activity and audit logs.</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Module</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" /></TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">No recent activity.</TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {format(new Date(log.timestamp), "MMM dd, yyyy HH:mm")}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{log.user}</span>
                      <span className="text-xs text-muted-foreground">{log.role}</span>
                    </div>
                  </TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell><Badge variant="secondary">{log.module}</Badge></TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
