import { defaultAvailabilitySettings } from "@/constants/availability-constants";
import { defaultDateSpecificData } from "@/constants/date-specific-constants";
import type { EventType, ScheduleTemplate } from "@/interfaces";
import { useState } from "react";

const defaultEventTypes: EventType[] = [
  {
    id: "30min",
    name: "Quick Meeting",
    duration: 30,
    color: "#3B82F6",
    description: "Short 30-minute meetings",
    isDefault: true,
  },
  {
    id: "60min",
    name: "Standard Interview",
    duration: 60,
    color: "#10B981",
    description: "Standard 1-hour interviews",
    isDefault: true,
  },
  {
    id: "90min",
    name: "Extended Session",
    duration: 90,
    color: "#F59E0B",
    description: "Longer 1.5-hour sessions",
    isDefault: true,
  },
];

export function useScheduleTemplates() {
  const [templates, setTemplates] = useState<ScheduleTemplate[]>([
    {
      id: "default",
      name: "Default Schedule",
      isDefault: true,
      isActive: true,
      eventTypes: [...defaultEventTypes],
      weeklyAvailability: { ...defaultAvailabilitySettings },
      dateSpecificAvailability: { ...defaultDateSpecificData },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]);

  const [activeTemplateId, setActiveTemplateId] = useState<string>("default");

  const activeTemplate =
    templates.find((t) => t.id === activeTemplateId) || templates[0];

  const createTemplate = (name: string) => {
    const newTemplate: ScheduleTemplate = {
      id: crypto.randomUUID(),
      name: name.trim(),
      isDefault: false,
      isActive: false,
      eventTypes: [...defaultEventTypes],
      weeklyAvailability: { ...defaultAvailabilitySettings },
      dateSpecificAvailability: { ...defaultDateSpecificData },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTemplates((prev) => [...prev, newTemplate]);
    return newTemplate;
  };

  const updateTemplate = (
    templateId: string,
    updates: Partial<ScheduleTemplate>
  ) => {
    setTemplates((prev) =>
      prev.map((t) =>
        t.id === templateId
          ? { ...t, ...updates, updatedAt: new Date().toISOString() }
          : t
      )
    );
  };

  const updateEventTypes = (templateId: string, eventTypes: EventType[]) => {
    updateTemplate(templateId, { eventTypes });
  };

  const deleteTemplate = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (template?.isDefault) {
      throw new Error("Cannot delete the default template");
    }

    setTemplates((prev) => prev.filter((t) => t.id !== templateId));

    if (activeTemplateId === templateId) {
      setActiveTemplateId("default");
    }
  };

  const duplicateTemplate = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (!template) return;

    const duplicatedTemplate: ScheduleTemplate = {
      ...template,
      id: crypto.randomUUID(),
      name: `${template.name} (Copy)`,
      isDefault: false,
      isActive: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTemplates((prev) => [...prev, duplicatedTemplate]);
    return duplicatedTemplate;
  };

  const activateTemplate = (templateId: string) => {
    setActiveTemplateId(templateId);
    setTemplates((prev) =>
      prev.map((t) => ({
        ...t,
        isActive: t.id === templateId,
      }))
    );
  };

  const saveWeeklyAvailability = (templateId: string, data: any) => {
    updateTemplate(templateId, { weeklyAvailability: data });
  };

  const saveDateSpecificAvailability = (templateId: string, data: any) => {
    updateTemplate(templateId, { dateSpecificAvailability: data });
  };

  return {
    templates,
    activeTemplate,
    activeTemplateId,
    createTemplate,
    updateTemplate,
    updateEventTypes,
    deleteTemplate,
    duplicateTemplate,
    activateTemplate,
    saveWeeklyAvailability,
    saveDateSpecificAvailability,
  };
}
