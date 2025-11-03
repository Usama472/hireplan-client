import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import React from "react";

// EXACT skeleton that matches JobCard dimensions pixel-perfect
export const JobCardSkeleton = React.memo(() => (
  <Card className="group relative bg-white border border-gray-200 rounded-md transition-all duration-200 will-change-auto">
    <CardContent className="p-6">
      {/* Status badge and menu - exactly like JobCard */}
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-6 w-20 rounded-full" /> {/* Status badge */}
        <Skeleton className="h-5 w-5 rounded" /> {/* Menu icon */}
      </div>
      
      {/* Job title - exact height as real content */}
      <Skeleton className="h-7 w-full mb-2 rounded" />
      
      {/* Company name */}
      <Skeleton className="h-5 w-3/4 mb-6 rounded" />
      
      {/* Job details with icons - match real spacing */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-24 rounded" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-32 rounded" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-20 rounded" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-16 rounded" />
        </div>
      </div>
      
      {/* Stats section - exact match to real job card */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-4 bg-gray-50 rounded-md border border-gray-100 min-h-[80px]">
          <Skeleton className="h-4 w-4 mx-auto mb-2 rounded" />
          <Skeleton className="h-3 w-12 mx-auto mb-1.5 rounded" />
          <div className="w-8 h-6 mx-auto flex items-center justify-center">
            <Skeleton className="h-6 w-4 rounded" />
          </div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-md border border-gray-100 min-h-[80px]">
          <Skeleton className="h-4 w-4 mx-auto mb-2 rounded" />
          <Skeleton className="h-3 w-14 mx-auto mb-1.5 rounded" />
          <div className="w-8 h-6 mx-auto flex items-center justify-center">
            <Skeleton className="h-6 w-4 rounded" />
          </div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-md border border-gray-100 min-h-[80px]">
          <Skeleton className="h-4 w-4 mx-auto mb-2 rounded" />
          <Skeleton className="h-3 w-12 mx-auto mb-1.5 rounded" />
          <div className="w-8 h-6 mx-auto flex items-center justify-center">
            <Skeleton className="h-6 w-4 rounded" />
          </div>
        </div>
      </div>
      
      {/* Bottom actions - exact positioning */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-24 rounded-md" /> {/* View Details button */}
        <Skeleton className="h-8 w-8 rounded-full" /> {/* More menu */}
      </div>
    </CardContent>
    
    {/* Match the hover overlay */}
    <div className="absolute inset-0 bg-blue-50 opacity-0 transition-opacity duration-200 pointer-events-none rounded-lg" />
  </Card>
));

export const JobListSkeleton = React.memo(() => (
  <Card className="h-[160px]"> {/* Exact height for list view */}
    <CardContent className="p-6">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-4" />
          
          <div className="flex gap-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    </CardContent>
  </Card>
));

export const JobsGridSkeleton = React.memo(() => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {Array.from({ length: 6 }).map((_, i) => (
      <JobCardSkeleton key={i} />
    ))}
  </div>
));

export const JobsListViewSkeleton = React.memo(() => (
  <div className="space-y-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <JobListSkeleton key={i} />
    ))}
  </div>
));

// Application-specific skeletons
export const ApplicantCardSkeleton = React.memo(() => (
  <Card className="h-[200px]">
    <CardContent className="p-6">
      <div className="flex items-center gap-4 mb-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-5 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-6 w-20" />
      </div>
      
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      
      <div className="flex justify-between items-center mt-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-16" />
      </div>
    </CardContent>
  </Card>
));

export const AutomationCardSkeleton = React.memo(() => (
  <Card className="h-[240px]">
    <CardContent className="p-6">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-6 w-16" />
      </div>
      
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-5/6 mb-4" />
      
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
      
      <div className="flex gap-2">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-16" />
      </div>
    </CardContent>
  </Card>
));
