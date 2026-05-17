import { useListNotifications, useMarkNotificationRead, useMarkAllNotificationsRead, getListNotificationsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Notifications() {
  const queryClient = useQueryClient();
  const { data: notifications, isLoading } = useListNotifications();
  
  const markRead = useMarkNotificationRead({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() })
    }
  });

  const markAllRead = useMarkAllNotificationsRead({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() })
    }
  });

  return (
    <div className="space-y-6 p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground mt-1">Stay updated on your goals and approvals.</p>
        </div>
        <Button variant="outline" onClick={() => markAllRead.mutate()} disabled={markAllRead.isPending}>
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Mark all as read
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : (
        <div className="space-y-4">
          {notifications?.map(notification => (
            <Card key={notification.id} className={notification.isRead ? 'opacity-60 bg-muted/30' : 'border-primary/30 shadow-sm'}>
              <CardContent className="p-4 flex items-start gap-4">
                <div className={`p-2 rounded-full mt-1 ${notification.isRead ? 'bg-secondary' : 'bg-primary/20 text-primary'}`}>
                  <Bell className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className={`font-semibold ${!notification.isRead && 'text-primary'}`}>{notification.title}</h4>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm mt-1">{notification.message}</p>
                  
                  {!notification.isRead && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="mt-2 -ml-3 h-8 text-xs"
                      onClick={() => markRead.mutate({ id: notification.id })}
                      disabled={markRead.isPending}
                    >
                      Mark as read
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {(!notifications || notifications.length === 0) && (
            <div className="text-center p-12 bg-muted/30 rounded-xl border border-dashed">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium">All caught up</h3>
              <p className="text-muted-foreground">You have no new notifications.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
