"use client";

import type React from "react";
import { cn } from "@/lib/utils";
import { User, Building2, Settings } from "lucide-react";

interface Tab {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const tabs: Tab[] = [
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
    label: "Account Settings",
    icon: Settings,
  },
];

interface ProfileTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  children: React.ReactNode;
  tabs?: Tab[];
}

export function ProfileTabs({
  activeTab,
  onTabChange,
  children,
  tabs: customTabs,
}: ProfileTabsProps) {
  const tabsToRender = customTabs || tabs;
  const handleTabClick = (e: React.MouseEvent, tabId: string) => {
    e.preventDefault();
    e.stopPropagation();
    onTabChange(tabId);
  };

  return (
    <div className="w-full">
      {/* Mobile-First Tab Navigation */}
      <div className="border-b border-gray-200 mb-4 sm:mb-6 lg:mb-8">
        {/* Mobile: Horizontal Scroll Tabs */}
        <div className="block lg:hidden">
          <div className="overflow-x-auto scrollbar-hide">
            <nav className="flex gap-1 px-1 pb-2 min-w-max">
              {tabsToRender.map((tab) => {
                const isActive = activeTab === tab.id;
                const IconComponent = tab.icon;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={(e) => handleTabClick(e, tab.id)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-xs transition-all duration-200 whitespace-nowrap flex-shrink-0",
                      isActive
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Desktop: Traditional Tab Layout */}
        <nav className="hidden lg:flex space-x-6 xl:space-x-8">
          {tabsToRender.map((tab) => {
            const isActive = activeTab === tab.id;
            const IconComponent = tab.icon;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={(e) => handleTabClick(e, tab.id)}
                className={cn(
                  "flex items-center gap-2 py-3 lg:py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200",
                  isActive
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                <IconComponent className="w-4 h-4" />
                {tab.label}
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
