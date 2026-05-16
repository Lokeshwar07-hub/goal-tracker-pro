import { useListAuditLogs } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

export default function AuditLogs() {
  const { data: logs, isLoading } = useListAuditLogs();

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
        <p className="text-muted-foreground mt-1">System-wide trail of actions and changes.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 space-y-4">
               {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs?.map(log => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {format(new Date(log.timestamp), "MMM d, yyyy HH:mm:ss")}
                    </TableCell>
                    <TableCell className="font-medium">{log.userName || `User ${log.userId}`}</TableCell>
                    <TableCell>
                      <span className="bg-secondary px-2 py-1 rounded text-xs uppercase tracking-wider font-semibold">
                        {log.action}
                      </span>
                    </TableCell>
                    <TableCell>{log.goalTitle || `Goal ${log.goalId}` || "-"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {log.changedField ? (
                        <span>
                          Changed <strong>{log.changedField}</strong> from{" "}
                          <span className="line-through">{log.oldValue}</span> to{" "}
                          <span className="text-foreground">{log.newValue}</span>
                        </span>
                      ) : "-"}
                    </TableCell>
                  </TableRow>
                ))}
                {(!logs || logs.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-32 text-muted-foreground">
                      No audit logs found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
