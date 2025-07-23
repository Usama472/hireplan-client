"use client";

import type React from "react";
import { cn } from "@/lib/utils";

interface TabContentProps {
  value: string;
  activeTab: string;
  children: React.ReactNode;
  className?: string;
}

export function TabContent({
  value,
  activeTab,
  children,
  className,
}: TabContentProps) {
  if (value !== activeTab) return null;

  return (
    <div className={cn("animate-in fade-in-0 duration-200", className)}>
      {children}
    </div>
  );
}
