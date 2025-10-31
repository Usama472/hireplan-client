import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ROUTES } from "@/constants";
import API from "@/http";
import { useNotifications, type Notification } from "@/lib/hooks/use-notifications";
import { AlertCircle, Bell, ChevronRight, X, UserCheck, MessageSquare } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import Profile from "./Profile";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export const Navbar = () => {
  const breadcrumbs: BreadcrumbItem[] = [
    { label: "kokonutUI", href: "#" },
    { label: "dashboard", href: "#" },
  ];

  const { allNotifications, refetch } = useNotifications();
  const navigate = useNavigate();
  const [dismissedNotifs, setDismissedNotifs] = useState<Set<string>>(new Set());

  const visibleNotifications = allNotifications.filter(
    (n) => !dismissedNotifs.has(n._id)
  );
  const visibleCount = visibleNotifications.length;

  const handleCloseJob = async (notificationId: string, jobId: string | undefined) => {
    try {
      if (!jobId) {
        toast.error("Invalid job ID");
        return;
      }
      const jobIdStr = typeof jobId === 'object' ? (jobId as any)?._id || (jobId as any)?.toString() : jobId;
      await API.job.updateJob(jobIdStr, { status: "closed" } as any);
      await API.notification.dismissNotification(notificationId);
      toast.success("Job closed successfully");
      setDismissedNotifs((prev) => new Set(prev).add(notificationId));
      refetch();
    } catch (error: any) {
      console.error("Error closing job:", error);
      toast.error(error?.response?.data?.message || "Failed to close job");
    }
  };

  const handleDismissNotification = async (notificationId: string) => {
    try {
      await API.notification.dismissNotification(notificationId);
      setDismissedNotifs((prev) => new Set(prev).add(notificationId));
      refetch();
    } catch (error) {
      console.error("Error dismissing notification:", error);
    }
  };

  return (
    <nav className="px-3 sm:px-6 flex items-center justify-between bg-white dark:bg-[#0F0F12] border-b border-gray-200 dark:border-[#1F1F23] h-full">
      <SidebarTrigger className="-ml-1" />

      <div className="font-medium text-sm hidden sm:flex items-center space-x-1 truncate max-w-[300px]">
        {breadcrumbs.map((item, index) => (
          <div key={item.label} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-gray-500 dark:text-gray-400 mx-1" />
            )}
            {item.href ? (
              <div className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                {item.label}
              </div>
            ) : (
              <span className="text-gray-900 dark:text-gray-100">
                {item.label}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 sm:gap-4 ml-auto sm:ml-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="p-1.5 sm:p-2 hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-purple-500/10 rounded-full transition-all duration-200 group relative"
            >
              <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-purple-400 transition-colors" />
              {visibleCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-[10px] border-2 border-white dark:border-[#0F0F12]">
                  {visibleCount}
                </Badge>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-[380px] max-h-[500px] overflow-y-auto"
          >
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="font-semibold text-sm text-gray-900">
                Notifications
              </h3>
              {visibleCount > 0 && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {visibleCount} notification{visibleCount !== 1 ? "s" : ""}
                </p>
              )}
            </div>

            {visibleCount === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No notifications</p>
              </div>
            ) : (
              <div className="py-2">
                {visibleNotifications.map((notification: Notification) => {
                  // NEW_APPLICATION notification
                  if (notification.type === 'NEW_APPLICATION') {
                    return (
                      <div
                        key={notification._id}
                        className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                            <UserCheck className="h-4 w-4 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 line-clamp-1">
                                  {notification.title}
                                </p>
                                <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                                  {notification.message}
                                </p>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDismissNotification(notification._id);
                                }}
                                className="text-gray-400 hover:text-gray-600 p-1"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <div className="flex gap-2 mt-2">
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const jobId = typeof notification.relatedJobId === 'object' 
                                    ? (notification.relatedJobId as any)?._id || (notification.relatedJobId as any)?.toString()
                                    : notification.relatedJobId;
                                  navigate(`${ROUTES.DASHBOARD.APPLICANTS}?job=${jobId || ''}`);
                                  handleDismissNotification(notification._id);
                                }}
                                className="h-7 text-xs"
                              >
                                View Applicant
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  
                  // NEW_MESSAGE notification
                  if (notification.type === 'NEW_MESSAGE') {
                    return (
                      <div
                        key={notification._id}
                        className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                            <MessageSquare className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 line-clamp-1">
                                  {notification.title}
                                </p>
                                <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                                  {notification.message}
                                </p>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDismissNotification(notification._id);
                                }}
                                className="text-gray-400 hover:text-gray-600 p-1"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <div className="flex gap-2 mt-2">
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`${ROUTES.DASHBOARD.CHATS}?conversation=${notification.relatedConversationId || ''}`);
                                  handleDismissNotification(notification._id);
                                }}
                                className="h-7 text-xs"
                              >
                                View Message
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  
                  // JOB_EXPIRED notification
                  if (notification.type === 'JOB_EXPIRED') {
                    return (
                      <div
                        key={notification._id}
                        className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-amber-100 rounded-lg flex-shrink-0">
                            <AlertCircle className="h-4 w-4 text-amber-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 line-clamp-1">
                                  {notification.metadata?.jobTitle || notification.title}
                                </p>
                                <p className="text-xs text-gray-600 mt-0.5">
                                  {notification.metadata?.endDate && `Expired on ${new Date(notification.metadata.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
                                </p>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDismissNotification(notification._id);
                                }}
                                className="text-gray-400 hover:text-gray-600 p-1"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <div className="flex gap-2 mt-2">
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const jobId = typeof notification.relatedJobId === 'object' 
                                    ? (notification.relatedJobId as any)?._id || (notification.relatedJobId as any)?.toString()
                                    : notification.relatedJobId;
                                  handleCloseJob(notification._id, jobId);
                                }}
                                className="h-7 text-xs bg-amber-600 hover:bg-amber-700"
                              >
                                Close Job
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const jobId = typeof notification.relatedJobId === 'object' 
                                    ? (notification.relatedJobId as any)?._id || (notification.relatedJobId as any)?.toString()
                                    : notification.relatedJobId;
                                  navigate(`${ROUTES.DASHBOARD.VIEW_JOB}/${jobId || ''}`);
                                }}
                                className="h-7 text-xs"
                              >
                                View
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  
                  // Default for other notification types
                  return null;
                })}
              </div>
            )}

            {visibleCount > 0 && (
              <>
                <DropdownMenuSeparator />
                <div className="px-4 py-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      // Mark all as read
                      API.notification.markAllAsRead();
                      refetch();
                    }}
                    className="w-full text-xs text-primary hover:text-primary/80"
                  >
                    Mark All as Read
                  </Button>
                </div>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <img
              src="https://ferf1mheo22r9ira.public.blob.vercel-storage.com/avatar-01-n0x8HFv8EUetf9z6ht0wScJKoTHqf8.png"
              alt="User avatar"
              width={28}
              height={28}
              className="rounded-full ring-2 ring-blue-200 dark:ring-purple-400/30 sm:w-8 sm:h-8 cursor-pointer hover:ring-blue-300 dark:hover:ring-purple-400/50 transition-all duration-200"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="w-[280px] sm:w-80 bg-background border-border rounded-lg shadow-lg"
          >
            <Profile avatar="https://ferf1mheo22r9ira.public.blob.vercel-storage.com/avatar-01-n0x8HFv8EUetf9z6ht0wScJKoTHqf8.png" />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
};
