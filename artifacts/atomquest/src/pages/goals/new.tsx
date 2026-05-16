import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateGoal, useListGoals } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListGoalsQueryKey } from "@workspace/api-client-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

const goalSchema = z.object({
  thrustArea: z.string().min(1, "Thrust area is required"),
  goalTitle: z.string().min(1, "Title is required"),
  goalDescription: z.string().min(1, "Description is required"),
  unitOfMeasurement: z.enum(['numeric', 'percentage', 'timeline', 'zero_based']),
  scoreType: z.enum(['higher_is_better', 'lower_is_better']).optional(),
  target: z.coerce.number().min(0, "Target must be positive"),
  deadline: z.string().optional(),
  weightage: z.coerce.number().min(10, "Minimum weightage is 10%").max(100, "Maximum weightage is 100%"),
});

export default function NewGoal() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: existingGoals } = useListGoals();
  
  const form = useForm<z.infer<typeof goalSchema>>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      thrustArea: "",
      goalTitle: "",
      goalDescription: "",
      unitOfMeasurement: "numeric",
      scoreType: "higher_is_better",
      target: 100,
      weightage: 10,
    },
  });

  const createGoal = useCreateGoal({
    mutation: {
      onSuccess: () => {
        toast({ title: "Goal created successfully" });
        queryClient.invalidateQueries({ queryKey: getListGoalsQueryKey() });
        setLocation("/goals");
      },
      onError: (err) => {
        toast({ variant: "destructive", title: "Failed to create goal", description: err.message });
      }
    }
  });

  const onSubmit = (values: z.infer<typeof goalSchema>) => {
    const currentWeightage = existingGoals?.reduce((sum, g) => sum + g.weightage, 0) || 0;
    if (currentWeightage + values.weightage > 100) {
      form.setError("weightage", { message: `Total weightage cannot exceed 100%. You have ${100 - currentWeightage}% remaining.` });
      return;
    }
    
    createGoal.mutate({ data: values as any });
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/goals")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Goal</h1>
          <p className="text-muted-foreground">Define a new objective for this quarter.</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="thrustArea"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thrust Area</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Revenue Growth" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="goalTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Goal Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Increase Q3 Sales" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="goalDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Detailed description of the goal..." className="min-h-[100px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="unitOfMeasurement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit of Measurement</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select UoM" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="numeric">Numeric</SelectItem>
                          <SelectItem value="percentage">Percentage</SelectItem>
                          <SelectItem value="timeline">Timeline</SelectItem>
                          <SelectItem value="zero_based">Zero-based (Pass/Fail)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="target"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Value</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="weightage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weightage (%)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormDescription>Min 10% per goal</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button type="button" variant="outline" className="mr-4" onClick={() => setLocation("/goals")}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createGoal.isPending}>
                  {createGoal.isPending ? "Creating..." : "Create Goal"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
