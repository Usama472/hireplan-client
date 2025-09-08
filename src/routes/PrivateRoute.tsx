import { LoadingScreen } from "@/components/common/LoadingScreen";
import { DashboardSidebar } from "@/components/common/navigation/dashboard/sidebar";
import type { DefaultLayoutProps } from "@/interfaces";
import useAuthSessionContext from "@/lib/context/AuthSessionContext";
import { ScrollToTop } from "@/lib/hooks/ScrollToTop";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SubscriptionStatusAlert } from "@/components/common/SubscriptionStatusAlert";

export const PrivateRoute = ({ children }: DefaultLayoutProps) => {
  const { status, subscription, refreshSubscription } = useAuthSessionContext();

  // Show loading state for private routes
  if (status === 'loading') {
    return <LoadingScreen message="Loading dashboard..." />;
  }

  // if (!subscription || subscription.subscriptionStatus === "none") {
  //   return (
  //     <SidebarProvider>
  //       <ScrollToTop />
  //       <DashboardSidebar />
  //       <SidebarInset className=" bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
  //         <div className="overflow-y-auto w-full flex justify-center items-center min-h-screen">
  //           <div className="max-w-lg w-full">
  //             <SubscriptionStatusAlert
  //               subscription={{
  //                 hasActiveSubscription: false,
  //                 planId: null,
  //                 planName: null,
  //                 subscriptionStatus: "none",
  //               }}
  //               onRefresh={refreshSubscription || (() => {})}
  //             />
  //           </div>
  //         </div>
  //       </SidebarInset>
  //     </SidebarProvider>
  //   );
  // }

  return (
    <SidebarProvider>
      <ScrollToTop />
      <DashboardSidebar />
      <SidebarInset className="max-h-screen bg-blue-50/30">
        <div className="overflow-y-auto w-full">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
};
