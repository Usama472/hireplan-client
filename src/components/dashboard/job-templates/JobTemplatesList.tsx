import React, { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Edit, 
  Copy, 
  Trash2, 
  Plus, 
  Search, 
  X, 
  Briefcase, 
  Users, 
  MapPin,
  DollarSign,
  Globe,
  Building,
  ArrowLeft,
  RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import API from "@/http";
import type { JobTemplate } from "@/types/job-template";
import { usePaginationQuery } from "@/lib/hooks/usePaginateQuery";
import { ROUTES } from "@/constants";



const workplaceTypeColors = {
  "in-person": "bg-blue-50 text-blue-700 border-blue-200",
  "remote": "bg-green-50 text-green-700 border-green-200",
  "hybrid": "bg-purple-50 text-purple-700 border-purple-200",
  "on-the-road": "bg-orange-50 text-orange-700 border-orange-200",
};

const employmentTypeColors = {
  "full-time": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "part-time": "bg-yellow-50 text-yellow-700 border-yellow-200",
  "contract": "bg-indigo-50 text-indigo-700 border-indigo-200",
  "temporary": "bg-pink-50 text-pink-700 border-pink-200",
  "internship": "bg-cyan-50 text-cyan-700 border-cyan-200",
};

interface JobTemplatesListProps {
  selectionMode?: boolean;
  onSelectTemplate?: (template: JobTemplate) => void;
}

export const JobTemplatesList: React.FC<JobTemplatesListProps> = ({
  selectionMode = false,
  onSelectTemplate,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; template: JobTemplate | null }>({
    open: false,
    template: null,
  });

  // Check if we're in selection mode (came from job creation)
  const isSelectionMode = selectionMode || location.state?.fromJobCreation;

  const {
    data: templatesData,
    loading: isLoading,
    error,
    filters: { setSearchQuery, searchQuery },
    refetch,
  } = usePaginationQuery({
    key: "queryJobTemplates",
    limit: 12,
    fetchFun: API.jobTemplate.getJobTemplates,
    parseResponse: (data: any) => {
      // The API returns the paginated data directly
      return data || { results: [], limit: 12, page: 1, totalPages: 0, totalResults: 0 };
    },
  });

  const templates = (templatesData || []) as JobTemplate[];

  const filteredTemplates = useMemo(() => {
    if (!searchQuery) return templates;
    const lower = searchQuery.toLowerCase();
    return templates.filter(
      (template) =>
        template.name.toLowerCase().includes(lower) ||
        template.jobTitle.toLowerCase().includes(lower) ||
        template.category?.toLowerCase().includes(lower) ||
        template.description?.toLowerCase().includes(lower)
    );
  }, [templates, searchQuery]);

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const handleEdit = (template: JobTemplate) => {
    // Navigate to job creation page with template data for editing
    navigate(ROUTES.DASHBOARD.CREATE_JOB, {
      state: { 
        selectedTemplate: template,
        editMode: true,
        templateId: template.id
      }
    });
  };

  const handleSelectTemplate = async (template: JobTemplate) => {
    try {
      // Increment usage count
      await API.jobTemplate.incrementTemplateUsage(template.id);
      
      if (isSelectionMode && onSelectTemplate) {
        // If we're in selection mode and have a callback, use it
        onSelectTemplate(template);
      } else {
        // Navigate to job creation with template data
        navigate(ROUTES.DASHBOARD.CREATE_JOB, {
          state: { selectedTemplate: template }
        });
      }
      
      toast.success(`Template "${template.name}" selected!`);
    } catch (error) {
      console.error("Error selecting template:", error);
      toast.error("Failed to select template");
    }
  };

  const handleDuplicate = async (template: JobTemplate) => {
    try {
      await API.jobTemplate.duplicateJobTemplate(template.id, `${template.name} (Copy)`);
      toast.success("Template duplicated successfully!");
      refetch();
    } catch (error) {
      console.error("Error duplicating template:", error);
      toast.error("Failed to duplicate template");
    }
  };

  const handleDelete = async (template: JobTemplate) => {
    try {
      await API.jobTemplate.deleteJobTemplate(template.id);
      toast.success("Template deleted successfully!");
      setDeleteDialog({ open: false, template: null });
      refetch();
    } catch (error) {
      console.error("Error deleting template:", error);
      toast.error("Failed to delete template");
    }
  };

  const formatUsageCount = (count: number) => {
    if (count === 0) return "Never used";
    if (count === 1) return "Used once";
    return `Used ${count} times`;
  };

  const getPayRateDisplay = (payRate?: JobTemplate['payRate']) => {
    if (!payRate) return null;
    
    switch (payRate.type) {
      case 'fixed':
        return `$${payRate.amount}${payRate.period ? `/${payRate.period.replace('per-', '')}` : ''}`;
      case 'range':
        return `$${payRate.min}-$${payRate.max}${payRate.period ? `/${payRate.period.replace('per-', '')}` : ''}`;
      case 'starting_at':
        return `Starting at $${payRate.amount}${payRate.period ? `/${payRate.period.replace('per-', '')}` : ''}`;
      case 'up_to':
        return `Up to $${payRate.amount}${payRate.period ? `/${payRate.period.replace('per-', '')}` : ''}`;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="rounded-xl border-gray-200 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-8 w-8 rounded-lg" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <Skeleton className="h-10 w-full rounded-xl" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="rounded-xl border-gray-200 shadow-sm">
        <CardContent className="p-12 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Error loading templates</h3>
          <p className="text-gray-600 mb-6">{error as string}</p>
          <Button onClick={() => refetch()} className="rounded-xl h-11 px-6 font-medium">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Search */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {isSelectionMode ? "Select a Job Template" : "Job Templates"}
          </h3>
          <p className="text-gray-600 text-sm">
            {isSelectionMode 
              ? "Choose a template to start your job posting" 
              : "Create and manage reusable job templates"
            }
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {isSelectionMode && (
            <Button
              variant="outline"
              onClick={() => navigate(ROUTES.DASHBOARD.CREATE_JOB)}
              className="rounded-xl h-11 px-6 font-medium shadow-sm hover:shadow-md border-gray-200 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Start from Scratch
            </Button>
          )}
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => {
                console.log('Refreshing templates...');
                refetch();
              }}
              className="rounded-xl h-11 px-4 font-medium shadow-sm hover:shadow-md"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => navigate(ROUTES.DASHBOARD.CREATE_JOB)}
              className="rounded-xl h-11 px-6 font-medium shadow-sm hover:shadow-md"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
          <Search className="h-4 w-4 text-gray-500" />
        </div>
        <Input
          placeholder="Search templates by name, title, or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-11 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-11 rounded-xl text-sm shadow-sm bg-white transition-all duration-200 hover:shadow-md"
        />
        {searchQuery && (
          <button
            onClick={handleClearSearch}
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <Card className="rounded-xl border-gray-200 shadow-sm">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {searchQuery ? "No templates found" : "No templates yet"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery
                ? "No templates match your search. Try a different term."
                : "Create your first job template to get started"}
            </p>
            <Button
              onClick={() => navigate(ROUTES.DASHBOARD.CREATE_JOB)}
              className="rounded-xl h-11 px-6 font-medium shadow-sm hover:shadow-md"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template: JobTemplate) => (
            <Card
              key={template.id}
              className="group rounded-xl border-gray-200 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all duration-300 hover:scale-[1.02]"
            >
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base font-semibold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {template.name}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                      {template.jobTitle}
                    </p>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="sr-only">Open menu</span>
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => handleEdit(template)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(template)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setDeleteDialog({ open: true, template })}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Template Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-gray-600">
                      {template.jobLocation?.city && template.jobLocation?.state 
                        ? `${template.jobLocation.city}, ${template.jobLocation.state}`
                        : template.workplaceType === 'remote' 
                        ? 'Remote' 
                        : 'Location TBD'}
                    </span>
                  </div>
                  
                  {template.payRate && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-gray-600">
                        {getPayRateDisplay(template.payRate)}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-gray-600 text-xs">
                      {formatUsageCount(template.usageCount)}
                    </span>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  <Badge 
                    className={`text-xs px-2 py-1 border ${workplaceTypeColors[template.workplaceType as keyof typeof workplaceTypeColors] || 'bg-gray-50 text-gray-700 border-gray-200'}`}
                  >
                    {template.workplaceType}
                  </Badge>
                  <Badge 
                    className={`text-xs px-2 py-1 border ${employmentTypeColors[template.employmentType as keyof typeof employmentTypeColors] || 'bg-gray-50 text-gray-700 border-gray-200'}`}
                  >
                    {template.employmentType}
                  </Badge>
                  {template.isPublic && (
                    <Badge className="text-xs px-2 py-1 border bg-blue-50 text-blue-700 border-blue-200">
                      <Globe className="h-3 w-3 mr-1" />
                      Public
                    </Badge>
                  )}
                </div>

                {/* Category & Tags */}
                {(template.category || (template.tags && template.tags.length > 0)) && (
                  <div className="space-y-1">
                    {template.category && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Building className="h-3 w-3" />
                        {template.category}
                      </div>
                    )}
                    {template.tags && template.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {template.tags.slice(0, 3).map((tag: string, index: number) => (
                              <span 
                                key={index}
                                className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                            {template.tags.length > 3 && (
                              <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                                +{template.tags.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  {!isSelectionMode && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(template)}
                      className="flex-1 rounded-lg h-9 text-gray-600 hover:text-gray-800 border-gray-200 hover:border-gray-300"
                    >
                      <Edit className="h-3.5 w-3.5 mr-1.5" />
                      Edit
                    </Button>
                  )}
                  <Button
                    variant={isSelectionMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSelectTemplate(template)}
                    className={`${isSelectionMode ? 'w-full' : 'flex-1'} rounded-lg h-9 ${
                      isSelectionMode 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300'
                    }`}
                  >
                    <Briefcase className="h-3.5 w-3.5 mr-1.5" />
                    {isSelectionMode ? 'Select Template' : 'Use'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteDialog.template?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteDialog.template && handleDelete(deleteDialog.template)}
              className="bg-red-600 hover:bg-red-700 rounded-lg"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
