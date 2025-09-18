"use client";

import { cn } from "@/lib/utils";
import { Building2, User, Settings, Mail, Briefcase, Bell } from "lucide-react";
import type React from "react";

interface Tab {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const defaultTabs: Tab[] = [
  {
    id: "personal",
    label: "Personal Info",
    icon: User,
  },
  {
    id: "company",
    label: "Company Info",
    icon: Building2,
  },
  {
    id: "settings",
    label: "Subscription & Billing",
    icon: Settings,
  },
];

const globalSettingsTabs: Tab[] = [
  {
    id: "general",
    label: "Profile",
    icon: User,
  },
  {
    id: "company",
    label: "Company",
    icon: Building2,
  },
  {
    id: "billing",
    label: "Billing",
    icon: Settings,
  },
  {
    id: "job-templates",
    label: "Jobs",
    icon: Briefcase,
  },
  {
    id: "email-templates",
    label: "Email",
    icon: Mail,
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
  },
];

interface ProfileTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  children: React.ReactNode;
  variant?: "profile" | "global-settings";
}

export function ProfileTabs({
  activeTab,
  onTabChange,
  children,
  variant = "profile",
}: ProfileTabsProps) {
  const tabs = variant === "global-settings" ? globalSettingsTabs : defaultTabs;

  return (
    <div className="w-full">
      {/* Mobile-First Tab Navigation */}
      <div className="border-b border-gray-200 mb-4 sm:mb-6 lg:mb-8">
        {/* Mobile: Horizontal Scroll Tabs */}
        <div className="block sm:hidden">
          <div className="overflow-x-auto scrollbar-hide">
            <nav className="flex gap-1 px-1 pb-2 min-w-max">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const IconComponent = tab.icon;

                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-xs transition-all duration-200 whitespace-nowrap flex-shrink-0",
                      isActive
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Desktop: Traditional Tab Layout */}
        <nav className="hidden sm:flex space-x-6 lg:space-x-8">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const IconComponent = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "flex items-center gap-2 py-3 lg:py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 cursor-pointer",
                  isActive
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                <IconComponent className="w-4 h-4" />
                <span className="hidden md:inline">{tab.label}</span>
                <span className="md:hidden">
                  {variant === "global-settings"
                    ? tab.label
                    : tab.label.split(" ")[0]}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="relative">{children}</div>
    </div>
  );
}
