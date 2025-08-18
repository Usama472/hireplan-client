"use client";

import { Edit, Mail, Plus, Search, X, Sparkles, Tag } from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/constants";

import API from "@/http";
import type { EmailTemplate } from "@/interfaces";
import { usePaginationQuery } from "@/lib/hooks/usePaginateQuery";

interface EmailTemplatesResponse {
  emailTemplates: {
    results: EmailTemplate[];
    limit: number;
    page: number;
    totalPages: number;
    totalResults: number;
  };
}

const categoryLabels = {
  "interview-invitation": "Interview Invitation",
  "interview-confirmation": "Interview Confirmation",
  "job-offer": "Job Offer",
  rejection: "Rejection",
  "follow-up": "Follow Up",
  onboarding: "Onboarding",
  reference: "Reference Request",
};

const categoryIcons = {
  "interview-invitation": "👔",
  "interview-confirmation": "✅",
  "job-offer": "🎯",
  rejection: "❌",
  "follow-up": "📧",
  onboarding: "🚀",
  reference: "📋",
};

const categoryColors = {
  "interview-invitation": "bg-blue-50 text-blue-700 border-blue-200",
  "interview-confirmation": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "job-offer": "bg-violet-50 text-violet-700 border-violet-200",
  rejection: "bg-rose-50 text-rose-700 border-rose-200",
  "follow-up": "bg-amber-50 text-amber-700 border-amber-200",
  onboarding: "bg-indigo-50 text-indigo-700 border-indigo-200",
  reference: "bg-cyan-50 text-cyan-700 border-cyan-200",
};

export const EmailTemplatesList = () => {
  const navigate = useNavigate();

  const {
    data: emailTemplatesData,
    loading: isLoading,
    error,
    filters: { setSearchQuery, searchQuery },
  } = usePaginationQuery({
    key: "queryEmailTemplates",
    limit: 12,
    fetchFun: API.emailTemplate.getEmailTemplates,
    // @ts-ignore
    parseResponse: (data: EmailTemplatesResponse) => data.emailTemplates,
  });

  // Get templates array from API data
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const templates = emailTemplatesData || [];

  // Filter templates based on search
  const filteredTemplates = useMemo(() => {
    if (!searchQuery) return templates;
    const lower = searchQuery.toLowerCase();
    return templates.filter(
      (template) =>
        (template.name || "").toLowerCase().includes(lower) ||
        (template.subject || "").toLowerCase().includes(lower) ||
        (template.category || "").toLowerCase().includes(lower)
    );
  }, [templates, searchQuery]);

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header with Search */}
        <div className="mb-10">
          {/* Top Row - Title and Create Button */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary shadow-lg shadow-primary/25">
                <Mail className="h-6 w-6" />
              </div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                Email Templates
              </h1>
            </div>

            <Button
              onClick={() => navigate(ROUTES.DASHBOARD.CREATE_EMAIL_TEMPLATE)}
              variant="outline"
              className="border-primary/30 text-primary hover:bg-primary/5 hover:border-primary/50 px-6 py-2.5 h-10 font-medium rounded-xl transition-all duration-200 hover:scale-105 shadow-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </div>

          {/* Description */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
              Create and manage your recruitment email templates with dynamic
              variables and rich formatting
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 top-0 left-0 flex items-center pl-4 pointer-events-none">
              <Search className="h-4 w-4 text-gray-500 z-50" />
            </div>
            <Input
              placeholder="Search templates by name, subject, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 h-11 rounded-xl text-sm shadow-sm bg-background/80 backdrop-blur-sm transition-all duration-200 hover:shadow-md hover:shadow-primary/10"
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Templates Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-card/50 backdrop-blur-sm border border-border/30 rounded-2xl shadow-sm shadow-primary/5 p-5 flex flex-col h-full"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>

                {/* Title */}
                <Skeleton className="h-5 w-3/4 mb-3 rounded-lg" />

                {/* Subject */}
                <Skeleton className="h-4 w-full mb-4 rounded-lg" />

                {/* Category */}
                <Skeleton className="h-6 w-24 mb-5 rounded-full" />

                {/* Button */}
                <div className="mt-auto">
                  <Skeleton className="h-9 w-full rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-card/50 backdrop-blur-sm border border-border/30 rounded-2xl shadow-sm shadow-primary/5 p-12 text-center">
            <div className="relative mx-auto mb-6 w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center">
              <Mail className="h-10 w-10 text-destructive" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              Error loading templates
            </h3>
            <p className="text-muted-foreground mb-6 text-base max-w-md mx-auto">
              {error as string}
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 px-6 py-3 h-11 font-medium rounded-xl"
            >
              Retry
            </Button>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="bg-card/50 backdrop-blur-sm border border-border/30 rounded-2xl shadow-sm shadow-primary/5 p-12 text-center">
            <div className="relative mx-auto mb-6 w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
              <Mail className="h-10 w-10 text-primary" />
              <div className="absolute -top-2 -right-2 w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                <Search className="h-5 w-5 text-accent" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              No templates found
            </h3>
            <p className="text-muted-foreground mb-6 text-base max-w-md mx-auto">
              {searchQuery
                ? "No templates match your search. Try a different term."
                : "You haven't created any templates yet"}
            </p>
            <Button
              onClick={() => navigate(ROUTES.DASHBOARD.CREATE_EMAIL_TEMPLATE)}
              className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 px-6 py-3 h-11 font-medium rounded-xl"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Template
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="group bg-card/50 backdrop-blur-sm border border-border rounded-2xl shadow-sm shadow-primary/5 p-5 transition-all duration-300 hover:shadow-md hover:shadow-primary/10 hover:border-primary/20 hover:scale-[1.02] flex flex-col h-full"
                >
                  {/* Header with Status */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {categoryIcons[
                          template.category as keyof typeof categoryIcons
                        ] || "📧"}
                      </span>
                      <span
                        className={`inline-flex h-2.5 w-2.5 rounded-full ${template.isActive ? "bg-emerald-500" : "bg-muted"
                          }`}
                      ></span>
                    </div>
                    <Badge
                      variant={template.isActive ? "default" : "secondary"}
                      className="text-xs px-2 py-1 rounded-full"
                    >
                      {template.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  {/* Template Name */}
                  <h3 className="text-base font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {template.name}
                  </h3>

                  {/* Subject Line */}
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2 flex-1">
                    {template.subject}
                  </p>

                  {/* Category Badge */}
                  <div className="mb-4">
                    <Badge
                      variant="outline"
                      className={`${categoryColors[
                        template.category as keyof typeof categoryColors
                      ] || "bg-muted/50 text-muted-foreground border-muted"
                        } rounded-lg text-xs font-medium px-3 py-1.5 border`}
                    >
                      <Tag className="h-3 w-3 mr-1.5" />
                      {categoryLabels[
                        template.category as keyof typeof categoryLabels
                      ] || template.category}
                    </Badge>
                  </div>

                  {/* Edit Button - Full Width */}
                  <div className="mt-auto">
                    <Button
                      variant="outline"
                      className="w-full text-gray-500 border-border/50 hover:bg-primary/5 hover:border-primary/30 hover:text-primary h-11 rounded-lg transition-all duration-200 group-hover:shadow-md group-hover:shadow-primary/10"
                      onClick={() =>
                        navigate(
                          `${ROUTES.DASHBOARD.EDIT_EMAIL_TEMPLATE}/${template.id}`
                        )
                      }
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Template
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Results Summary */}
            <div className="mt-10 text-center">
              <div className="inline-flex items-center gap-2 bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl px-6 py-3 shadow-sm">
                <Sparkles className="h-4 w-4 text-primary" />
                <p className="text-muted-foreground text-sm font-medium">
                  Showing {filteredTemplates.length} of {templates.length}{" "}
                  templates
                  {searchQuery && (
                    <span className="ml-3">
                      <button
                        onClick={handleClearSearch}
                        className="text-primary hover:text-primary/80 font-medium transition-colors underline underline-offset-2"
                      >
                        Clear search
                      </button>
                    </span>
                  )}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
