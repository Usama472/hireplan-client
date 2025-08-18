import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, Mail, Search, X } from "lucide-react";
import React from "react";
import { useGlobalEmailTemplates } from "./hooks/useGlobalEmailTemplates";

interface GlobalTemplateSelectorProps {
  category: string;
  selectedTemplateId: string | null;
  onTemplateSelection: (
    templateId: string | null,
    templateName: string | null
  ) => void;
}

export const GlobalTemplateSelector: React.FC<GlobalTemplateSelectorProps> = ({
  category,
  selectedTemplateId,
  onTemplateSelection,
}) => {
  const {
    availableTemplates,
    templatesLoading,
    currentPage,
    totalPages,
    setPage,
    searchQuery,
    setSearchQuery,
  } = useGlobalEmailTemplates();

  const handleClearSearch = () => {
    setSearchQuery("");
    setPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const getCategoryLabel = (cat?: string) => {
    if (!cat) return "General";
    switch (cat) {
      case "interview-invitation":
        return "Invitation";
      case "interview-confirmation":
        return "Confirmation";
      case "interview-rejection":
        return "Rejection";
      default:
        return cat
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase());
    }
  };

  return (
    <div className="space-y-5">
      {/* Search and Refresh Controls */}
      <div className="flex items-center gap-2 max-w-md w-full">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10 h-9 text-sm border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 rounded-lg"
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              tabIndex={-1}
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Template Grid */}
      {templatesLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="p-4 border border-gray-200 rounded-xl bg-gray-50 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="h-7 w-7 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-24 rounded" />
                  <Skeleton className="h-2 w-28 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {availableTemplates.map((template) => {
            const isSelected = selectedTemplateId === template.id;

            return (
              <button
                key={template.id}
                type="button"
                className={`group relative text-left p-4 border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 hover:shadow-lg ${
                  isSelected
                    ? "border-blue-500 bg-white shadow-lg"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
                }`}
                onClick={() =>
                  onTemplateSelection(
                    template.id || null,
                    template.name || null
                  )
                }
                tabIndex={0}
                aria-pressed={isSelected}
              >
                {/* Header with icon and selection indicator */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-2 rounded-md transition-colors ${
                        isSelected
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-600 group-hover:bg-blue-50 group-hover:text-blue-600"
                      }`}
                    >
                      <Mail className="w-4 h-4" />
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                        isSelected
                          ? "border-blue-400 bg-blue-100 text-blue-700"
                          : "border-gray-200 bg-gray-50 text-gray-600"
                      }`}
                    >
                      {getCategoryLabel(template.category)}
                    </Badge>
                  </div>

                  {/* Selection indicator */}
                  {isSelected && (
                    <div className="flex-shrink-0">
                      <div className="p-1.5 rounded-full bg-blue-500 text-white shadow-sm">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Template name */}
                <div className="min-w-0 mt-3">
                  <h5
                    className={`font-semibold text-sm leading-tight line-clamp-2 transition-colors ${
                      isSelected
                        ? "text-gray-900"
                        : "text-gray-900 group-hover:text-blue-700"
                    }`}
                  >
                    {template.name}
                  </h5>
                </div>

                {/* Subject line */}
                <div className="min-w-0 mt-1">
                  <p
                    className={`text-xs leading-tight line-clamp-2 transition-colors ${
                      isSelected
                        ? "text-gray-600"
                        : "text-gray-600 group-hover:text-gray-700"
                    }`}
                  >
                    {template.subject}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Pagination Info */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-2">
          <span className="text-xs text-gray-500">
            Page {currentPage} of {totalPages}
          </span>
        </div>
      )}

      {/* Empty State */}
      {!templatesLoading && availableTemplates.length === 0 && (
        <div className="p-6 text-center border border-dashed border-gray-200 rounded-xl bg-gray-50">
          <Mail className="w-6 h-6 text-gray-400 mx-auto mb-2" />
          <h4 className="text-base font-semibold text-gray-900 mb-1">
            {searchQuery ? "No templates found" : "No templates available"}
          </h4>
          <p className="text-xs text-gray-500 mb-2">
            {searchQuery
              ? "Try adjusting your search terms."
              : `No ${getCategoryLabel(
                  category
                )} templates found. Create some first.`}
          </p>
          {searchQuery && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClearSearch}
              className="mt-2 px-3 text-xs h-7"
            >
              Clear Search
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
