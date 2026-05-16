import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function Settings() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 p-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account preferences and profile.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24 border-2 border-primary/20">
              <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                {user?.name?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1 flex-1">
              <h3 className="text-xl font-bold">{user?.name}</h3>
              <p className="text-muted-foreground">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="bg-secondary px-2 py-1 rounded text-xs font-semibold uppercase">{user?.role}</span>
                <span className="bg-secondary px-2 py-1 rounded text-xs font-semibold">{user?.department}</span>
              </div>
            </div>
            <Button variant="outline">Edit Profile</Button>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-6 border-t">
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Manager</div>
              <div>{user?.managerName || 'None'}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Account Created</div>
              <div>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="flex items-center justify-between py-2 border-b">
              <div>
                <h4 className="font-medium">Email Notifications</h4>
                <p className="text-sm text-muted-foreground">Receive daily summaries and alerts.</p>
              </div>
              <Button variant="outline">Configure</Button>
           </div>
           <div className="flex items-center justify-between py-2 border-b">
              <div>
                <h4 className="font-medium">Password</h4>
                <p className="text-sm text-muted-foreground">Update your login credentials.</p>
              </div>
              <Button variant="outline">Change</Button>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
