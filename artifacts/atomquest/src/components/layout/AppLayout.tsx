import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutDashboard, 
  Target, 
  Users, 
  CheckSquare, 
  CalendarClock, 
  BarChart3, 
  FileText, 
  History, 
  Bell, 
  Settings, 
  LogOut,
  Menu,
  Shield,
  Building,
  Calendar,
  AlertTriangle
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  useListNotifications,
  getListNotificationsQueryOptions,
} from "@workspace/api-client-react";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { data: notifications } = useListNotifications(
    { unreadOnly: true },
    {
      query: {
        ...getListNotificationsQueryOptions({ unreadOnly: true }),
        enabled: !!user,
      },
    },
  );

  const unreadCount = notifications?.length || 0;

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["employee", "manager", "admin"] },
    { name: "My Goals", href: "/goals", icon: Target, roles: ["employee"] },
    { name: "Team Goals", href: "/goals", icon: Target, roles: ["manager"] },
    { name: "My Team", href: "/team", icon: Users, roles: ["manager"] },
    { name: "Approvals", href: "/approvals", icon: CheckSquare, roles: ["manager"] },
    { name: "Quarterly Check-ins", href: "/quarterly", icon: CalendarClock, roles: ["employee", "manager"] },
    { name: "Shared Goals", href: "/shared-goals", icon: Target, roles: ["employee", "manager", "admin"] },
    { name: "Analytics", href: "/analytics", icon: BarChart3, roles: ["manager", "admin"] },
    { name: "Reports", href: "/reports", icon: FileText, roles: ["manager", "admin"] },
  ];

  const adminItems = [
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Departments", href: "/admin/departments", icon: Building },
    { name: "Quarters", href: "/admin/quarters", icon: Calendar },
    { name: "Escalations", href: "/admin/escalations", icon: AlertTriangle },
    { name: "Audit Logs", href: "/audit-logs", icon: History },
  ];

  const filteredNav = navItems.filter((item) => user?.role && item.roles.includes(user.role));

  const NavLinks = () => (
    <div className="flex flex-col gap-1 w-full">
      <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Overview
      </div>
      {filteredNav.map((item) => {
        const isActive = location === item.href || location.startsWith(`${item.href}/`);
        return (
          <Link key={item.name} href={item.href} className="w-full">
            <Button
              variant={isActive ? "secondary" : "ghost"}
              className={`w-full justify-start ${isActive ? "bg-secondary text-secondary-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.name}
            </Button>
          </Link>
        );
      })}

      {user?.role === "admin" && (
        <>
          <div className="px-3 py-4 pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-4">
            Administration
          </div>
          {adminItems.map((item) => {
            const isActive = location === item.href || location.startsWith(`${item.href}/`);
            return (
              <Link key={item.name} href={item.href} className="w-full">
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={`w-full justify-start ${isActive ? "bg-secondary text-secondary-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.name}
                </Button>
              </Link>
            );
          })}
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r bg-card/50 px-3 py-4 h-screen sticky top-0">
        <div className="flex items-center gap-2 px-3 pb-6 mb-2 border-b">
          <div className="bg-primary/10 p-1.5 rounded-md">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <span className="font-bold text-lg tracking-tight">AtomQuest</span>
        </div>
        
        <ScrollArea className="flex-1 -mx-3 px-3 py-2">
          <NavLinks />
        </ScrollArea>

        <div className="mt-auto pt-4 border-t">
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <Avatar className="h-9 w-9 border border-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary">
                {user?.name?.substring(0, 2).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col flex-1 overflow-hidden">
              <span className="text-sm font-medium truncate">{user?.name}</span>
              <span className="text-xs text-muted-foreground capitalize truncate">{user?.role}</span>
            </div>
          </div>
          <Link href="/settings">
            <Button variant="ghost" className="w-full justify-start text-muted-foreground">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </Link>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground mt-1" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile Header & Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b bg-card">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-1 rounded">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <span className="font-bold">AtomQuest</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Link href="/notifications">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5 text-muted-foreground" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
                )}
              </Button>
            </Link>
            
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <div className="flex flex-col h-full p-4">
                  <div className="flex items-center gap-2 pb-6 border-b">
                    <Shield className="h-6 w-6 text-primary" />
                    <span className="font-bold text-lg">AtomQuest</span>
                  </div>
                  <ScrollArea className="flex-1 py-4">
                    <NavLinks />
                  </ScrollArea>
                  <div className="mt-auto pt-4 border-t">
                    <div className="flex items-center gap-3 px-2 py-3 mb-2">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{user?.name?.substring(0, 2).toUpperCase() || "U"}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{user?.name}</span>
                        <span className="text-xs text-muted-foreground capitalize">{user?.role}</span>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full justify-start mt-2" onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
          <div className="flex items-center">
            {/* Page title could go here if managed via context or route matching */}
          </div>
          <div className="flex items-center gap-4">
            <Link href="/notifications">
              <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Badge>
                )}
              </Button>
            </Link>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
