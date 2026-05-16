import { useListEscalations } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function AdminEscalations() {
  const { data: escalations, isLoading } = useListEscalations();

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Escalations</h1>
        <p className="text-muted-foreground mt-1">System generated alerts for missed deadlines and non-compliance.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
             <div className="p-8 space-y-4">
               {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {escalations?.map(esc => (
                  <TableRow key={esc.id}>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {format(new Date(esc.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium capitalize text-sm">{esc.type.replace('_', ' ')}</span>
                    </TableCell>
                    <TableCell>{esc.employeeName}</TableCell>
                    <TableCell>{esc.managerName}</TableCell>
                    <TableCell className="max-w-xs truncate">{esc.description}</TableCell>
                    <TableCell>
                      {esc.resolved ? 
                        <Badge variant="secondary" className="bg-green-500/10 text-green-600">Resolved</Badge> : 
                        <Badge variant="destructive" className="bg-red-500 text-white">Action Required</Badge>}
                    </TableCell>
                  </TableRow>
                ))}
                {(!escalations || escalations.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-32 text-muted-foreground">
                      No escalations found. Good job!
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
