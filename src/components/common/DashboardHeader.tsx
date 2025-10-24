import { APP_NAME, ROUTES } from "@/constants";
import { useSidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/lib/hooks/use-mobile";
import { Link, useNavigate } from "react-router-dom";
import { Menu, Bell, AlertCircle, X, Briefcase, MessageSquare, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useNotifications } from "@/lib/hooks/use-notifications";
import useAuthSessionContext from "@/lib/context/AuthSessionContext";
import API from "@/http";
import { toast } from "sonner";
import LogoImage from "../../../public/logo.png";

export const DashboardHeader = () => {
  const isMobile = useIsMobile();
  const { toggleSidebar } = useSidebar();
  const navigate = useNavigate();
  const { data: authData } = useAuthSessionContext();
  
  const { 
    allNotifications,
    refetch, 
    totalCount,
    messageCount,
    jobCount 
  } = useNotifications();

  const companyName = authData?.user?.company?.companyName || 'Company';

  const handleCloseJob = async (notificationId: string, jobId: string) => {
    try {
      // Close the job
      await API.job.updateJob(jobId, { status: 'closed' } as any);
      
      // Dismiss the notification
      await API.notification.dismissNotification(notificationId);
      
      toast.success('Job closed successfully');
      refetch();
    } catch (error) {
      console.error('Error closing job:', error);
      toast.error('Failed to close job');
    }
  };

  const handleDismissJob = async (notificationId: string) => {
    try {
      await API.notification.dismissNotification(notificationId);
      refetch();
    } catch (error) {
      console.error('Error dismissing notification:', error);
      toast.error('Failed to dismiss notification');
    }
  };

  const handleViewMessage = async (conversationId: string) => {
    try {
      // Dismiss notification when viewing the conversation
      await API.notification.dismissConversationNotifications(conversationId);
      refetch();
      // Navigate directly to the conversation
      navigate(`/dashboard/chats/${conversationId}`);
    } catch (error) {
      console.error('Error viewing message:', error);
      toast.error('Failed to open conversation');
    }
  };

  const handleDismissMessage = async (conversationId: string) => {
    try {
      await API.notification.dismissConversationNotifications(conversationId);
      refetch();
    } catch (error) {
      console.error('Error dismissing message notification:', error);
      toast.error('Failed to dismiss notification');
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
      {/* Left: Logo and Menu Button */}
      <div className="flex items-center gap-3 flex-1">
        {isMobile && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="h-8 w-8"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
            
            <Link
              to={ROUTES.DASHBOARD.MAIN}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <img src={LogoImage} alt="Logo" className="h-8 w-8 object-contain" />
              <span className="font-extrabold text-xl leading-tight tracking-tight bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                {APP_NAME}
              </span>
            </Link>
          </>
        )}
        
        {!isMobile && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
              <Building2 className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-semibold text-gray-800">{companyName}</span>
            </div>
          </div>
        )}
      </div>

      {/* Right: Notification Bell */}
      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 rounded-full hover:bg-gray-100"
            >
              <Bell className="h-5 w-5 text-gray-600" />
              {totalCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-[10px] border-2 border-white">
                  {totalCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[380px] max-w-[calc(100vw-2rem)] max-h-[500px] overflow-y-auto">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="font-semibold text-sm text-gray-900">Notifications</h3>
              {totalCount > 0 && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {messageCount > 0 && `${messageCount} message${messageCount !== 1 ? 's' : ''}`}
                  {messageCount > 0 && jobCount > 0 && ' • '}
                  {jobCount > 0 && `${jobCount} job${jobCount !== 1 ? 's' : ''}`}
                </p>
              )}
            </div>
            
            {totalCount === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No notifications</p>
              </div>
            ) : (
              <div className="py-2">
                {allNotifications.map((notification) => {
                  if (notification.type === 'NEW_MESSAGE') {
                    return (
                      <div key={notification._id} className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                            <MessageSquare className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 line-clamp-1">
                                  {notification.metadata?.senderName || 'New Message'}
                                </p>
                                <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                                  {notification.metadata?.messagePreview || notification.message}
                                </p>
                                {notification.metadata?.messageCount && notification.metadata.messageCount > 1 && (
                                  <p className="text-xs text-blue-600 mt-1">
                                    +{notification.metadata.messageCount - 1} more message{notification.metadata.messageCount > 2 ? 's' : ''}
                                  </p>
                                )}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDismissMessage(notification.relatedConversationId!);
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
                                  handleViewMessage(notification.relatedConversationId!);
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
                  } else {
                    // JOB_EXPIRED notification
                    return (
                      <div key={notification._id} className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-amber-100 rounded-lg flex-shrink-0">
                            <AlertCircle className="h-4 w-4 text-amber-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 line-clamp-1">
                                  {notification.metadata?.jobTitle || 'Job Expired'}
                                </p>
                                <p className="text-xs text-gray-600 mt-0.5">
                                  {notification.metadata?.endDate && `Expired on ${new Date(notification.metadata.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                                </p>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDismissJob(notification._id);
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
                                  handleCloseJob(notification._id, notification.relatedJobId!);
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
                                  navigate(`${ROUTES.DASHBOARD.VIEW_JOB}/${notification.relatedJobId}`);
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
                })}
              </div>
            )}
            
            {totalCount > 0 && (
              <>
                <DropdownMenuSeparator />
                <div className="px-4 py-2 flex gap-2">
                  {messageCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(ROUTES.DASHBOARD.CHATS)}
                      className="flex-1 text-xs text-primary hover:text-primary/80"
                    >
                      <MessageSquare className="h-3.5 w-3.5 mr-2" />
                      Messages
                    </Button>
                  )}
                  {jobCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(ROUTES.DASHBOARD.MAIN)}
                      className="flex-1 text-xs text-primary hover:text-primary/80"
                    >
                      <Briefcase className="h-3.5 w-3.5 mr-2" />
                      Jobs
                    </Button>
                )}
              </div>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
