import { LoadingScreen } from "@/components/common/LoadingScreen";
import { DashboardSidebar } from "@/components/common/navigation/dashboard/sidebar";
import { MobileHeader } from "@/components/common/MobileHeader";
import type { DefaultLayoutProps } from "@/interfaces";
import useAuthSessionContext from "@/lib/context/AuthSessionContext";
import { ScrollToTop } from "@/lib/hooks/ScrollToTop";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export const PrivateRoute = ({ children }: DefaultLayoutProps) => {
  const { status } = useAuthSessionContext();

  // Show loading state for private routes
  if (status === "loading") {
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
      <SidebarInset className="min-h-screen max-h-screen bg-blue-50/30 flex flex-col">
        <MobileHeader />
        <div className="flex-1 overflow-y-auto w-full px-2 sm:px-4 lg:px-6 py-4">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};
