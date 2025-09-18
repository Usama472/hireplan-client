"use client";

import { CreditCard } from "lucide-react";
import { PlanSelection } from "./plan-selection";
import { SubscriptionManager } from "../subscription/subscription-manager";
import useAuthSessionContext from "@/lib/context/AuthSessionContext";

export function AccountSettingsForm() {
  const { data: session } = useAuthSessionContext();

  console.log("🔍 AccountSettingsForm - session:", session);
  console.log("🔍 AccountSettingsForm - user ID check:", {
    hasUser: !!session?.user,
    hasId: !!session?.user?.id,
    has_id: !!session?.user?._id,
    userId: session?.user?.id || session?.user?._id,
  });

  const userId = session?.user?.id || session?.user?._id;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Professional Header Section - Mobile Optimized */}
      <div className="border-b border-gray-200 pb-4 sm:pb-6">
        <div className="flex items-center gap-3 sm:gap-4 mb-3">
          <div className="p-2 sm:p-3 bg-gray-100 rounded-xl flex-shrink-0">
            <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
              Subscription & Billing
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Manage your subscription, billing, and payment methods
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="space-y-4 sm:space-y-6">
        {userId ? <SubscriptionManager userId={userId} /> : <PlanSelection />}
      </div>
    </div>
  );
}
