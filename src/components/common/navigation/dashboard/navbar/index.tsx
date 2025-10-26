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
import { useExpiredJobs } from "@/lib/hooks/use-expired-jobs";
import { AlertCircle, Bell, Briefcase, ChevronRight, X } from "lucide-react";
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

  const { expiredJobs, count, refetch } = useExpiredJobs();
  const navigate = useNavigate();
  const [dismissedJobs, setDismissedJobs] = useState<Set<string>>(new Set());

  const visibleExpiredJobs = expiredJobs.filter(
    (job) => !dismissedJobs.has(job.id)
  );
  const visibleCount = visibleExpiredJobs.length;

  const handleCloseJob = async (jobId: string) => {
    try {
      const job = expiredJobs.find((j) => j.id === jobId);
      if (!job) return;

      await API.job.updateJob(jobId, { ...job, status: "closed" } as any);
      toast.success("Job closed successfully");
      setDismissedJobs((prev) => new Set(prev).add(jobId));
      refetch();
    } catch (error) {
      console.error("Error closing job:", error);
      toast.error("Failed to close job");
    }
  };

  const handleDismiss = (jobId: string) => {
    setDismissedJobs((prev) => new Set(prev).add(jobId));
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
                  {visibleCount} expired job{visibleCount !== 1 ? "s" : ""}
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
                {visibleExpiredJobs.map((job) => (
                  <div
                    key={job.id}
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
                              {job.jobTitle || job.jobBoardTitle}
                            </p>
                            <p className="text-xs text-gray-600 mt-0.5">
                              Expired on{" "}
                              {new Date(job.endDate!).toLocaleDateString(
                                "en-US",
                                { month: "short", day: "numeric" }
                              )}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDismiss(job.id);
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
                              handleCloseJob(job.id);
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
                              navigate(
                                `${ROUTES.DASHBOARD.VIEW_JOB}/${job.id}`
                              );
                            }}
                            className="h-7 text-xs"
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {visibleCount > 0 && (
              <>
                <DropdownMenuSeparator />
                <div className="px-4 py-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(ROUTES.DASHBOARD.JOBS)}
                    className="w-full text-xs text-primary hover:text-primary/80"
                  >
                    <Briefcase className="h-3.5 w-3.5 mr-2" />
                    View All Jobs
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
