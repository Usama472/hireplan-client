import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  Star,
  CheckCircle,
  Mail,
  Video,
  MessageSquare,
  Brain,
  Calendar,
  Bell,
  XCircle,
  Zap,
  Filter,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import API from "@/http";
import type {
  AutomationTemplate,
  TemplateCategory,
} from "@/types/automation-templates";

const iconMap = {
  Mail,
  Video,
  MessageSquare,
  Brain,
  Calendar,
  Bell,
  CheckCircle,
  XCircle,
  Zap,
};

const colorMap = {
  blue: "bg-blue-500 text-white",
  green: "bg-green-500 text-white",
  orange: "bg-orange-500 text-white",
  purple: "bg-purple-500 text-white",
  red: "bg-red-500 text-white",
  indigo: "bg-indigo-500 text-white",
  teal: "bg-teal-500 text-white",
  yellow: "bg-yellow-500 text-white",
};

interface AutomationTemplateLibraryProps {
  onTemplateActivated?: () => void;
}

export function AutomationTemplateLibrary({
  onTemplateActivated,
}: AutomationTemplateLibraryProps) {
  const [templates, setTemplates] = useState<AutomationTemplate[]>([]);
  const [allTemplates, setAllTemplates] = useState<AutomationTemplate[]>([]); // Store all templates for accurate counts
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [popularFilter, setPopularFilter] = useState<string>("all");
  const [selectedTemplate, setSelectedTemplate] =
    useState<AutomationTemplate | null>(null);
  const [activatingTemplate, setActivatingTemplate] = useState<string | null>(
    null
  );
  const [templateStatuses, setTemplateStatuses] = useState<
    Record<string, boolean>
  >({});

  // Load all templates on mount to calculate accurate counts
  useEffect(() => {
    const loadAllTemplates = async () => {
      try {
        const response = await API.automationTemplates.getTemplates({});
        if (response.success) {
          setAllTemplates(response.data.templates);
          setCategories(response.data.categories);

          // Load status for each template and merge with existing statuses
          const statuses: Record<string, boolean> = { ...templateStatuses };
          await Promise.all(
            response.data.templates.map(async (template) => {
              try {
                const statusResponse =
                  await API.automationTemplates.getTemplateStatus(template.id);
                if (statusResponse.success) {
                  statuses[template.id] = statusResponse.data.isActive;
                }
              } catch (error) {
                console.error(
                  `Error loading status for template ${template.id}:`,
                  error
                );
                statuses[template.id] = false;
              }
            })
          );
          setTemplateStatuses(statuses);
        }
      } catch (error) {
        console.error("Error loading all templates:", error);
      }
    };
    loadAllTemplates();
  }, []);

  useEffect(() => {
    loadTemplates();
  }, [selectedCategory]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const params =
        selectedCategory === "all" ? {} : { category: selectedCategory };
      const response = await API.automationTemplates.getTemplates(params);
      console.log("Templates API response:", response);

      if (response.success) {
        setTemplates(response.data.templates);
        if (selectedCategory === "all") {
          // Update allTemplates when loading "all" category
          setAllTemplates(response.data.templates);
        }
        setCategories(response.data.categories);
        console.log("Templates loaded:", response.data.templates.length);

        // Load status for each template and merge with existing statuses
        const statuses: Record<string, boolean> = { ...templateStatuses };
        await Promise.all(
          response.data.templates.map(async (template) => {
            try {
              const statusResponse =
                await API.automationTemplates.getTemplateStatus(template.id);
              if (statusResponse.success) {
                statuses[template.id] = statusResponse.data.isActive;
              }
            } catch (error) {
              console.error(
                `Error loading status for template ${template.id}:`,
                error
              );
              statuses[template.id] = false;
            }
          })
        );
        setTemplateStatuses(statuses);

        // Also update allTemplates status when loading individual category
        if (selectedCategory !== "all") {
          setAllTemplates((prev) => {
            // Merge status updates into existing allTemplates
            return prev
              .map((t) => {
                const updated = response.data.templates.find(
                  (nt: AutomationTemplate) => nt.id === t.id
                );
                return updated ? updated : t;
              })
              .concat(
                response.data.templates.filter(
                  (nt: AutomationTemplate) =>
                    !prev.some((pt) => pt.id === nt.id)
                )
              );
          });
        }
      }
    } catch (error) {
      console.error("Error loading templates:", error);
      toast.error("Failed to load automation templates");
    } finally {
      setLoading(false);
    }
  };

  const handleActivateTemplate = async (template: AutomationTemplate) => {
    try {
      setActivatingTemplate(template.id);

      const response = await API.automationTemplates.createFromTemplate(
        template.id
      );

      if (response.success) {
        toast.success(`${template.name} automation activated successfully!`);
        setTemplateStatuses((prev) => ({ ...prev, [template.id]: true }));
        onTemplateActivated?.();
      }
    } catch (error: any) {
      console.error("Error activating template:", error);

      if (error.response?.status === 409) {
        toast.error("This automation is already active for your company");
      } else if (error.response?.status === 400) {
        const message =
          error.response?.data?.message ||
          error.message ||
          "Invalid request data";
        toast.error(`Failed to activate template: ${message}`);
      } else {
        const message =
          error.response?.data?.message ||
          error.message ||
          "Unknown error occurred";
        toast.error(`Failed to activate automation template: ${message}`);
      }
    } finally {
      setActivatingTemplate(null);
    }
  };

  // Get unique tags for filtering
  const uniqueTags = useMemo(() => {
    const allTags = templates.flatMap((t) => t.tags);
    return Array.from(new Set(allTags)).sort();
  }, [templates]);

  // Apply filters to templates (without category filter)
  const applyFilters = useCallback(
    (templatesToFilter: AutomationTemplate[]) => {
      let filtered = [...templatesToFilter];

      // Search filter
      if (searchTerm) {
        const lower = searchTerm.toLowerCase();
        filtered = filtered.filter(
          (template) =>
            template.name.toLowerCase().includes(lower) ||
            template.description.toLowerCase().includes(lower) ||
            template.tags.some((tag) => tag.toLowerCase().includes(lower))
        );
      }

      // Status filter (Active/Inactive)
      if (statusFilter === "active") {
        filtered = filtered.filter(
          (template) => templateStatuses[template.id] === true
        );
      } else if (statusFilter === "inactive") {
        filtered = filtered.filter(
          (template) => !templateStatuses[template.id]
        );
      }

      // Popular filter
      if (popularFilter === "popular") {
        filtered = filtered.filter((template) => template.isPopular);
      } else if (popularFilter === "not-popular") {
        filtered = filtered.filter((template) => !template.isPopular);
      }

      return filtered;
    },
    [searchTerm, statusFilter, popularFilter, templateStatuses]
  );

  const filteredTemplates = useMemo(() => {
    // Category filter is handled by the API call when selectedCategory changes
    // But we need to filter client-side for the current category selection
    // Note: selectedCategory is already handled by the API in loadTemplates
    // so templates should already be filtered by category
    return applyFilters(templates);
  }, [templates, applyFilters]);

  // Calculate filtered counts for each category using allTemplates
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    // Use allTemplates to get accurate counts for each category
    categories.forEach((category) => {
      // Filter templates that belong to this category
      const categoryTemplates = allTemplates.filter(
        (t) => t.category === category.category
      );
      // Apply all filters (search, status, popular) except category
      const filtered = applyFilters(categoryTemplates);
      counts[category.category] = filtered.length;
    });

    // Count "All" - apply filters to all templates
    const allFiltered = applyFilters(allTemplates);
    counts["all"] = allFiltered.length;

    return counts;
  }, [allTemplates, categories, applyFilters]);

  const popularTemplates = useMemo(() => {
    // Show popular templates only when no filters are active and in "all" category
    if (
      selectedCategory === "all" &&
      !searchTerm &&
      statusFilter === "all" &&
      popularFilter === "all"
    ) {
      return allTemplates.filter((t) => t.isPopular);
    }
    return [];
  }, [allTemplates, selectedCategory, searchTerm, statusFilter, popularFilter]);

  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap];
    return IconComponent ? (
      <IconComponent className="h-5 w-5" />
    ) : (
      <Zap className="h-5 w-5" />
    );
  };

  const getColorClass = (color: string) => {
    return colorMap[color as keyof typeof colorMap] || "bg-gray-500 text-white";
  };

  const TemplateCard = ({ template }: { template: AutomationTemplate }) => {
    const isActive = templateStatuses[template.id];
    const isActivating = activatingTemplate === template.id;

    return (
      <Card
        className={`cursor-pointer transition-all hover:shadow-md ${
          isActive ? "ring-2 ring-green-500" : ""
        }`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div
                className={`p-2 rounded-lg ${getColorClass(template.color)}`}
              >
                {getIcon(template.icon)}
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  {template.name}
                  {template.isPopular && (
                    <Badge variant="secondary" className="text-xs">
                      <Star className="h-3 w-3 mr-1" />
                      Popular
                    </Badge>
                  )}
                  {isActive && (
                    <Badge variant="default" className="text-xs bg-green-500">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="text-sm mt-1">
                  {template.description}
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-1 mb-4">
            {template.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          {template.estimatedUsage && (
            <div className="text-sm text-gray-600 mb-3">
              Usage: {template.estimatedUsage}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedTemplate(template)}
              className="flex-1"
            >
              View Details
            </Button>

            {!isActive ? (
              <Button
                size="sm"
                onClick={() => handleActivateTemplate(template)}
                disabled={isActivating}
                className="flex-1"
              >
                {isActivating ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                    Activating...
                  </>
                ) : (
                  "Activate"
                )}
              </Button>
            ) : (
              <Button size="sm" variant="secondary" disabled className="flex-1">
                <CheckCircle className="h-4 w-4 mr-2" />
                Active
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Sparkles className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Loading automation templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Automation Template Library
            </h2>
            <p className="text-gray-600">
              Choose from pre-built automation workflows to get started quickly
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-sm px-3 py-1">
              {filteredTemplates.length}{" "}
              {filteredTemplates.length === 1 ? "template" : "templates"}
            </Badge>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-md border border-gray-200 p-4">
          <div className="flex flex-col gap-3">
            {/* Search Row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>

              {/* Status Filter */}
              <div className="inline-flex bg-gray-100 rounded-md p-1">
                {["all", "active", "inactive"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-4 py-2 rounded text-sm font-medium transition-all ${
                      statusFilter === status
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {status === "all"
                      ? "All"
                      : status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Row */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Popular Filter */}
              <Select value={popularFilter} onValueChange={setPopularFilter}>
                <SelectTrigger className="w-full sm:w-[180px] h-10">
                  <SelectValue placeholder="All Templates" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Templates</SelectItem>
                  <SelectItem value="popular">Popular Only</SelectItem>
                  <SelectItem value="not-popular">
                    Standard Templates
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Clear Filters Button */}
              {(searchTerm ||
                statusFilter !== "all" ||
                popularFilter !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setPopularFilter("all");
                  }}
                  className="text-blue-600 hover:text-blue-700 text-sm h-10"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Popular Templates Section */}
      {popularTemplates.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-5 w-5 text-yellow-500" />
            <h3 className="text-lg font-semibold">Popular Templates</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularTemplates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        </div>
      )}

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">
            All ({categoryCounts["all"] ?? templates.length})
          </TabsTrigger>
          {categories.map((category) => (
            <TabsTrigger key={category.category} value={category.category}>
              {category.label} (
              {categoryCounts[category.category] ?? category.count})
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <Filter className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No templates found
              </h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== "all" || popularFilter !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "No templates available in this category"}
              </p>
              {(searchTerm ||
                statusFilter !== "all" ||
                popularFilter !== "all") && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setPopularFilter("all");
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Template Detail Modal */}
      <Dialog
        open={!!selectedTemplate}
        onOpenChange={() => setSelectedTemplate(null)}
      >
        <DialogContent className="max-w-2xl max-h-[80vh]">
          {selectedTemplate && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${getColorClass(
                      selectedTemplate.color
                    )}`}
                  >
                    {getIcon(selectedTemplate.icon)}
                  </div>
                  <div>
                    <DialogTitle className="flex items-center gap-2">
                      {selectedTemplate.name}
                      {selectedTemplate.isPopular && (
                        <Badge variant="secondary" className="text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          Popular
                        </Badge>
                      )}
                    </DialogTitle>
                    <DialogDescription>
                      {selectedTemplate.description}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <ScrollArea className="max-h-96">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Category</h4>
                    <Badge variant="outline">{selectedTemplate.category}</Badge>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedTemplate.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {selectedTemplate.estimatedUsage && (
                    <div>
                      <h4 className="font-medium mb-2">Estimated Usage</h4>
                      <p className="text-sm text-gray-600">
                        {selectedTemplate.estimatedUsage}
                      </p>
                    </div>
                  )}

                  <div>
                    <h4 className="font-medium mb-2">Trigger</h4>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm font-medium">
                        {selectedTemplate.trigger.type}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">
                      Actions ({selectedTemplate.actions.length})
                    </h4>
                    <div className="space-y-2">
                      {selectedTemplate.actions.map((action, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm font-medium">{action.type}</p>
                          {action.conditions &&
                            action.conditions.length > 0 && (
                              <p className="text-xs text-gray-600 mt-1">
                                Conditions: {action.conditions.length} rule(s)
                              </p>
                            )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setSelectedTemplate(null)}
                  className="flex-1"
                >
                  Close
                </Button>

                {!templateStatuses[selectedTemplate.id] ? (
                  <Button
                    onClick={() => {
                      handleActivateTemplate(selectedTemplate);
                      setSelectedTemplate(null);
                    }}
                    disabled={activatingTemplate === selectedTemplate.id}
                    className="flex-1"
                  >
                    {activatingTemplate === selectedTemplate.id ? (
                      <>
                        <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                        Activating...
                      </>
                    ) : (
                      "Activate Template"
                    )}
                  </Button>
                ) : (
                  <Button variant="secondary" disabled className="flex-1">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Already Active
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
