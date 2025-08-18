import type { GetAvailabilityTemplatesResponse } from "@/interfaces";
import { del, get, post, put } from "../apiHelper";

interface BackendAvailabilitySlot {
  from: string;
  to: string;
}

interface BackendAvailabilityItem {
  type: "weekDay" | "date";
  slots: BackendAvailabilitySlot[];
  day?: string;
  date?: string;
}

interface GetAvailabilityResponse {
  status: boolean;
  availability: {
    user: {
      firstName: string;
      lastName: string;
      email: string;
      id: string;
    };
    availabilities: BackendAvailabilityItem[];
    timezone: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    id: string;
  };
}

export const saveAvailability = async (
  availability: BackendAvailabilityItem[]
) => {
  return await post("/availabilities/save", { availabilities: availability });
};

export const getAvailability = async (): Promise<GetAvailabilityResponse> => {
  return await get("/availabilities/my");
};

export const createAvailabilityTemplate = async (
  templateName: string
): Promise<{ status: boolean; availability: any }> => {
  return await post("/availabilities/templates", { templateName });
};

export const getAvailabilityTemplates =
  async (): Promise<GetAvailabilityTemplatesResponse> => {
    return await get("/availabilities/templates");
  };

export const updateAvailabilityTemplate = async (
  templateId: string,
  template: any
) => {
  return await put(`/availabilities/templates/${templateId}`, template);
};

export const deleteAvailabilityTemplate = async (templateId: string) => {
  return await del(`/availabilities/templates/${templateId}`);
};
