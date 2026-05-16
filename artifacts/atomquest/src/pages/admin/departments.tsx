import { useListDepartments } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Building } from "lucide-react";

export default function AdminDepartments() {
  const { data: depts, isLoading } = useListDepartments();

  return (
    <div className="space-y-6 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Departments</h1>
          <p className="text-muted-foreground mt-1">Manage organizational units and heads.</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Department
        </Button>
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
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Department Head</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {depts?.map(dept => (
                  <TableRow key={dept.id}>
                    <TableCell className="text-muted-foreground">#{dept.id}</TableCell>
                    <TableCell className="font-medium flex items-center gap-2">
                      <Building className="w-4 h-4 text-muted-foreground" />
                      {dept.name}
                    </TableCell>
                    <TableCell>{dept.headName || <span className="text-muted-foreground italic">Unassigned</span>}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Edit</Button>
                    </TableCell>
                  </TableRow>
                ))}
                {(!depts || depts.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-32 text-muted-foreground">
                      No departments configured.
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
