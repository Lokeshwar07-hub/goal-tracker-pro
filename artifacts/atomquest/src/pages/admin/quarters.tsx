import { useListQuarters } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { format } from "date-fns";

export default function AdminQuarters() {
  const { data: quarters, isLoading } = useListQuarters();

  return (
    <div className="space-y-6 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quarterly Cycles</h1>
          <p className="text-muted-foreground mt-1">Manage performance review cycles.</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Quarter
        </Button>
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
                  <TableHead>Quarter</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Goal Setting</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quarters?.map(q => (
                  <TableRow key={q.id}>
                    <TableCell className="font-bold">{q.name}</TableCell>
                    <TableCell>{q.year}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(q.startDate), "MMM d")} - {format(new Date(q.endDate), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      {q.isActive ? 
                        <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">Active</Badge> : 
                        <Badge variant="secondary">Inactive</Badge>}
                    </TableCell>
                    <TableCell>
                      {q.isGoalSettingOpen ? 
                        <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20">Open</Badge> : 
                        <Badge variant="secondary">Closed</Badge>}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Edit</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
