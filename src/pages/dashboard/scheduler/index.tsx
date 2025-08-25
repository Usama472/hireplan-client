import DashboardHeader from "@/components/common/DashboardHeader";
import SchedulerManager from "@/components/dashboard/scheduler";
import { SCHEDULER_TEXT } from "@/constants";

export default function SchedulerPage() {
  const links = [
    { label: "Dashboard", href: "/dashboard/jobs", isCurrent: false },
    {
      label: SCHEDULER_TEXT,
      href: "/dashboard/scheduler",
      isCurrent: true,
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader links={links} />
      <div className="flex-1 p-4 md:p-6 overflow-auto">
        <SchedulerManager />
      </div>
    </div>
  );
}
