"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  createAvailabilityTemplate,
  deleteAvailabilityTemplate,
  getAvailabilityTemplates,
  updateAvailabilityTemplate,
} from "@/http/availability/api";
import type { AvailabilityTemplate } from "@/interfaces";
import { useToast } from "@/lib/hooks/use-toast";
import { format } from "date-fns";
import { Plus, Clock, Trash2, Edit, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { WeeklyAvailabilityForm } from "./weekly-availability-form";

interface ScheduleTemplatesProps {
  onTemplateChange?: (template: any) => void;
}

interface InterviewDuration {
  id: string;
  name: string;
  duration: number; // in minutes
  description?: string;
  isDefault: boolean;
}

const defaultDurations: InterviewDuration[] = [
  { id: "30min", name: "Quick Interview", duration: 30, description: "Initial screening call", isDefault: true },
  { id: "45min", name: "Standard Interview", duration: 45, description: "Technical or behavioral interview", isDefault: false },
  { id: "60min", name: "Full Interview", duration: 60, description: "Comprehensive interview session", isDefault: false },
  { id: "90min", name: "Panel Interview", duration: 90, description: "Panel or final round interview", isDefault: false },
];

export function ScheduleTemplates({ onTemplateChange }: ScheduleTemplatesProps) {
  const [templates, setTemplates] = useState<AvailabilityTemplate[]>([]);
  const [currentTemplate, setCurrentTemplate] = useState<AvailabilityTemplate | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<AvailabilityTemplate | null>(null);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateDescription, setNewTemplateDescription] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [durations, setDurations] = useState<InterviewDuration[]>(defaultDurations);
  const [selectedDuration, setSelectedDuration] = useState<InterviewDuration>(defaultDurations[0]);

  const { toast } = useToast();

  const loadTemplates = async () => {
    try {
      const response = await getAvailabilityTemplates();
      if (response.status) {
        setTemplates(response.availabilities);
        if (response.availabilities.length > 0 && !currentTemplate) {
          setCurrentTemplate(response.availabilities[0]);
        }
      }
    } catch (error) {
      console.error("Error loading templates:", error);
      toast({
        type: "error",
        title: "Error",
        description: "Failed to load schedule templates",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleCreateTemplate = async () => {
    if (!newTemplateName.trim()) {
      toast({
        type: "error",
        title: "Error",
        description: "Template name is required",
      });
      return;
    }

    try {
      // First create the basic template with just the name
      const response = await createAvailabilityTemplate(newTemplateName);
      if (response.status && response.availability) {
        // Update the template with additional properties
        const templateUpdate = {
          ...response.availability,
          description: newTemplateDescription,
          eventTypes: [{
            id: "interview",
            title: selectedDuration.name,
            duration: selectedDuration.duration,
            description: selectedDuration.description,
            isActive: true,
          }],
        };

        try {
          await updateAvailabilityTemplate(response.availability.id, templateUpdate);
        } catch (updateError) {
          console.warn("Failed to update template with additional properties:", updateError);
        }

        await loadTemplates();
        setNewTemplateName("");
        setNewTemplateDescription("");
        setIsCreateDialogOpen(false);
        toast({
          type: "success",
          title: "Success",
          description: "Schedule template created successfully",
        });
      }
    } catch (error) {
      console.error("Error creating template:", error);
      toast({
        type: "error",
        title: "Error",
        description: "Failed to create schedule template",
      });
    }
  };

  const handleDeleteTemplate = async () => {
    if (!templateToDelete) return;

    try {
      const response = await deleteAvailabilityTemplate(templateToDelete.id);
      if (response.status) {
        await loadTemplates();
        setIsDeleteDialogOpen(false);
        setTemplateToDelete(null);
        if (currentTemplate?.id === templateToDelete.id) {
          setCurrentTemplate(templates.length > 1 ? templates[0] : null);
        }
        toast({
          type: "success",
          title: "Success",
          description: "Schedule template deleted successfully",
        });
      }
    } catch (error) {
      console.error("Error deleting template:", error);
      toast({
        type: "error",
        title: "Error",
        description: "Failed to delete schedule template",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Interview Templates</h2>
          <p className="text-sm text-gray-600 mt-1">
            Each template has a fixed duration and availability schedule for consistent interview booking
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Interview Template</DialogTitle>
              <DialogDescription>
                Create a template with a fixed duration. Once created, the duration cannot be changed.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Technical Interview"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of this interview type"
                  value={newTemplateDescription}
                  onChange={(e) => setNewTemplateDescription(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="duration">Interview Duration</Label>
                <Select
                  value={selectedDuration.id}
                  onValueChange={(value) => {
                    const duration = durations.find(d => d.id === value);
                    if (duration) setSelectedDuration(duration);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {durations.map((duration) => (
                      <SelectItem key={duration.id} value={duration.id}>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{duration.name}</span>
                          <span className="text-gray-500">({duration.duration}min)</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTemplate}>Create Template</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Templates Grid */}
      {templates.length === 0 ? (
        <Card className="p-12 text-center">
          <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No interview templates yet</h3>
          <p className="text-gray-600 mb-6">
            Create your first named interview template with a specific duration to start scheduling interviews with candidates
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Template
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                      {template.templateName || template.name || "Untitled Template"}
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600">
                      {template.description || "No description provided"}
                    </CardDescription>
                  </div>
                  <Badge variant={template.isActive ? "default" : "secondary"} className="shrink-0">
                    {template.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
                    <Clock className="h-4 w-4" />
                    <span>{template.eventTypes?.[0]?.duration || 30} minutes</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {template.weeklyAvailability?.daysAvailability?.filter(d => d.isActive).length || 0} active days
                    </span>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCurrentTemplate(template);
                        setActiveTab("weekly");
                      }}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setTemplateToDelete(template);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Template Editor */}
      {currentTemplate && (
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Edit Template: {currentTemplate.templateName || currentTemplate.name || "Untitled Template"}</CardTitle>
                <CardDescription>
                  Duration: {currentTemplate.eventTypes?.[0]?.duration || 30} minutes (fixed) • Configure availability schedule
                </CardDescription>
              </div>
              <Badge variant={currentTemplate.isActive ? "default" : "secondary"} className="text-sm">
                {currentTemplate.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="weekly">Weekly Schedule</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              <TabsContent value="weekly" className="mt-6">
                <WeeklyAvailabilityForm
                  templateId={currentTemplate.id}
                  initialData={currentTemplate.weeklyAvailability}
                  onSave={() => loadTemplates()}
                />
              </TabsContent>
              <TabsContent value="settings" className="mt-6">
                <div className="space-y-6">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <h4 className="font-medium text-blue-900">Interview Duration</h4>
                    </div>
                    <p className="text-sm text-blue-700">
                      This template is configured for <strong>{currentTemplate.eventTypes?.[0]?.duration || 30} minute</strong> interviews. 
                      Duration is set once per template and cannot be changed.
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="active"
                      checked={currentTemplate.isActive}
                      onCheckedChange={async (checked) => {
                        try {
                          await updateAvailabilityTemplate(currentTemplate.id, {
                            ...currentTemplate,
                            isActive: checked,
                          });
                          await loadTemplates();
                          toast({
                            type: "success",
                            title: "Success",
                            description: `Template ${checked ? "activated" : "deactivated"}`,
                          });
                        } catch (error) {
                          toast({
                            type: "error",
                            title: "Error",
                            description: "Failed to update template",
                          });
                        }
                      }}
                    />
                    <Label htmlFor="active">Template is active</Label>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{templateToDelete?.templateName || templateToDelete?.name || "this template"}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteTemplate}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}