import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Shield, User, Users, ShieldAlert } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useLogin({
    mutation: {
      onSuccess: (data) => {
        login(data.token, data.user);
        toast({ title: "Login successful", description: `Welcome back, ${data.user.name}` });
        setLocation("/dashboard");
      },
      onError: (error) => {
        const msg = error.message ?? "";
        const description =
          msg.includes("Failed to fetch") || msg.includes("NetworkError")
            ? "Cannot reach the API. From the project root run: pnpm run dev (or pnpm run dev:api in a second terminal)."
            : msg.includes("401") || msg.toLowerCase().includes("invalid")
              ? "Invalid email or password. If this is a fresh install, run: pnpm run db:setup"
              : msg || "Invalid credentials. Please try again.";

        toast({
          variant: "destructive",
          title: "Login failed",
          description,
        });
      },
    }
  });

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    loginMutation.mutate({ data: values });
  };

  const setDemoCredentials = (email: string) => {
    form.setValue("email", email);
    form.setValue("password", "password123");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center">
        <div className="hidden md:flex flex-col gap-6 justify-center">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-3 rounded-xl shadow-lg shadow-primary/20">
              <Shield className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">AtomQuest</h1>
          </div>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-md">
            Enterprise Goal Setting & Tracking Portal. Align, track, and achieve your organizational objectives with precision.
          </p>
          
          <div className="mt-8 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Demo Accounts</h3>
            <div className="grid gap-3">
              <Card className="cursor-pointer hover:border-primary transition-colors hover:shadow-md" onClick={() => setDemoCredentials("sarah.johnson@atomquest.com")}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="bg-blue-500/10 p-2 rounded-full"><User className="w-5 h-5 text-blue-500" /></div>
                  <div>
                    <p className="font-medium text-sm">Employee Portal</p>
                    <p className="text-xs text-muted-foreground">sarah.johnson@atomquest.com</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:border-primary transition-colors hover:shadow-md" onClick={() => setDemoCredentials("raj.patel@atomquest.com")}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="bg-amber-500/10 p-2 rounded-full"><Users className="w-5 h-5 text-amber-500" /></div>
                  <div>
                    <p className="font-medium text-sm">Manager Portal</p>
                    <p className="text-xs text-muted-foreground">raj.patel@atomquest.com</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:border-primary transition-colors hover:shadow-md" onClick={() => setDemoCredentials("admin@atomquest.com")}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="bg-purple-500/10 p-2 rounded-full"><ShieldAlert className="w-5 h-5 text-purple-500" /></div>
                  <div>
                    <p className="font-medium text-sm">Admin Portal</p>
                    <p className="text-xs text-muted-foreground">admin@atomquest.com</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <Card className="w-full max-w-md mx-auto shadow-2xl border-primary/10">
          <CardHeader className="space-y-2 text-center md:text-left">
            <div className="md:hidden flex justify-center mb-4">
               <div className="bg-primary p-2 rounded-lg">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
            <CardDescription>
              Enter your credentials to access your workspace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input placeholder="name@atomquest.com" {...field} className="bg-muted/50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} className="bg-muted/50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full font-semibold" 
                  size="lg"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "Authenticating..." : "Sign In to Portal"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
