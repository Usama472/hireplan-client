import { Copy, Search, X } from "lucide-react";
import { useState, useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  JOB_VARIABLES,
  VARIABLE_CATEGORY_ORDER,
} from "@/constants/email-template-variables";

interface VariableSectionProps {
  onInsertVariable: (variable: string) => void;
  variant?: "vertical" | "horizontal";
}

export const VariableSection = ({
  onInsertVariable,
  variant = "horizontal",
}: VariableSectionProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedValue, setSelectedValue] = useState<string>("");

  // Filter variables based on search query
  const filteredVariables = useMemo(() => {
    if (!searchQuery.trim()) return JOB_VARIABLES;

    const query = searchQuery.toLowerCase();
    return JOB_VARIABLES.filter(
      (variable) =>
        variable.key.toLowerCase().includes(query) ||
        variable.title.toLowerCase().includes(query) ||
        variable.category.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Group filtered variables by category
  const groupedVariables = useMemo(() => {
    return filteredVariables.reduce((acc, variable) => {
      if (!acc[variable.category]) {
        acc[variable.category] = [];
      }
      acc[variable.category].push(variable);
      return acc;
    }, {} as Record<string, typeof JOB_VARIABLES>);
  }, [filteredVariables]);

  // Get categories that have variables after filtering
  const activeCategories = VARIABLE_CATEGORY_ORDER.filter(
    (category) =>
      groupedVariables[category] && groupedVariables[category].length > 0
  );

  // Horizontal variant - Select dropdown view
  if (variant === "horizontal") {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Copy className="h-4 w-4 text-blue-600" />
          <Label className="text-sm font-medium text-gray-700">
            Template Variables
          </Label>
          <span className="text-xs text-gray-500">
            ({filteredVariables.length} available)
          </span>
        </div>

        <Select
          value={selectedValue}
          onValueChange={(value) => {
            if (value && value !== "") {
              setSelectedValue(value);
              onInsertVariable(value);
              // Reset select after insertion to allow selecting again
              setTimeout(() => {
                setSelectedValue("");
              }, 100);
            }
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a variable to insert..." />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {activeCategories.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">
                <p>No variables found</p>
              </div>
            ) : (
              activeCategories.map((category) => {
                const variables = groupedVariables[category];
                if (!variables || variables.length === 0) return null;

                return (
                  <div key={category}>
                    <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100 bg-gray-50">
                      {category}
                    </div>
                    {variables.map((variable) => (
                      <SelectItem
                        key={variable.key}
                        value={variable.key}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="secondary"
                              className="font-mono text-xs bg-muted/80 text-black border-0 rounded px-1.5 py-0.5"
                            >
                              {variable.key}
                            </Badge>
                            <span className="text-xs text-gray-600">
                              {variable.title}
                            </span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </div>
                );
              })
            )}
          </SelectContent>
        </Select>
      </div>
    );
  }

  // Vertical variant (original sidebar style) - kept for backward compatibility
  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-blue-50">
            <Copy className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold">Job Template Variables</h3>
            <p className="text-xs text-gray-500">
              Click any variable to insert into email body
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search variables..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        <div className="p-4 space-y-4">
          {activeCategories.length === 0 ? (
            <div className="text-center py-8">
              <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No variables found matching "{searchQuery}"
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="text-xs text-primary hover:text-primary/80 mt-1 underline"
              >
                Clear search
              </button>
            </div>
          ) : (
            activeCategories.map((category) => {
              const variables = groupedVariables[category];
              if (!variables || variables.length === 0) return null;

              return (
                <div key={category} className="space-y-2">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide border-b border-border/30 pb-1">
                    {category}
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      ({variables.length})
                    </span>
                  </h4>
                  <div className="space-y-2">
                    {variables.map((variable) => (
                      <div
                        key={variable.key}
                        className="group relative bg-gradient-to-r from-background/80 to-muted/30 hover:from-primary/5 hover:to-accent/5 border border-border/50 hover:border-primary/30 rounded-xl p-3 transition-all duration-200 hover:shadow-lg hover:shadow-primary/10 cursor-pointer"
                        onClick={() => onInsertVariable(variable.key)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="secondary"
                                className="font-mono text-xs bg-muted/80 text-black border-0 rounded-lg px-2 py-1"
                              >
                                {variable.key}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed ml-2">
                              {variable.title}
                            </p>
                          </div>

                          {/* Copy Button */}
                          <div className="opacity-0 group-hover:opacity-100 transition-all duration-200">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onInsertVariable(variable.key);
                              }}
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-200 flex items-center justify-center"
                              title="Copy variable"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
