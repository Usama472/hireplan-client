import { Copy, Search } from "lucide-react";
import { useState, useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  JOB_VARIABLES,
  VARIABLE_CATEGORY_ORDER,
} from "@/constants/email-template-variables";

interface VariableSectionProps {
  onInsertVariable: (variable: string) => void;
}

export const VariableSection = ({ onInsertVariable }: VariableSectionProps) => {
  const [searchQuery, setSearchQuery] = useState("");

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

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-xl shadow-primary/5 rounded-2xl overflow-hidden">
      <CardHeader className="pb-4 bg-gradient-to-r from-accent/10 to-primary/10 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-accent/10 text-accent">
            <Copy className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold text-card-foreground">
              Job Template Variables
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Click any variable to copy to clipboard
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      {/* Search Bar */}
      <div className="px-4 pt-4 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search variables..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background/80 border border-border/50 rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        <CardContent className="p-4 space-y-4">
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
        </CardContent>
      </div>
    </Card>
  );
};
