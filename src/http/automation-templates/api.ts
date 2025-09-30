import { get, post } from '../apiHelper';
import type {
  AutomationTemplate,
  TemplateCategory,
  GetTemplatesResponse,
  GetTemplateResponse,
  CreateFromTemplateResponse,
  TemplateStatusResponse
} from '@/types/automation-templates';

const BASE_URL = '/automations/templates';

// Re-export types for convenience
export type {
  AutomationTemplate,
  TemplateCategory,
  GetTemplatesResponse,
  GetTemplateResponse,
  CreateFromTemplateResponse,
  TemplateStatusResponse
};

/**
 * Get all automation templates
 */
export const getTemplates = (params?: {
  category?: string;
  popular?: boolean;
}): Promise<GetTemplatesResponse> => {
  const searchParams = new URLSearchParams();
  
  if (params?.category) {
    searchParams.append('category', params.category);
  }
  
  if (params?.popular) {
    searchParams.append('popular', 'true');
  }

  const url = searchParams.toString() ? `${BASE_URL}?${searchParams}` : BASE_URL;
  return get(url);
};

/**
 * Get template by ID
 */
export const getTemplateById = (templateId: string): Promise<GetTemplateResponse> => {
  return get(`${BASE_URL}/${templateId}`);
};

/**
 * Create automation from template
 */
export const createFromTemplate = (
  templateId: string,
  data?: { customName?: string }
): Promise<CreateFromTemplateResponse> => {
  return post(`${BASE_URL}/${templateId}/activate`, data || {});
};

/**
 * Get template status for current company
 */
export const getTemplateStatus = (templateId: string): Promise<TemplateStatusResponse> => {
  return get(`${BASE_URL}/${templateId}/status`);
};

/**
 * Get template categories
 */
export const getCategories = (): Promise<{
  success: boolean;
  data: { categories: TemplateCategory[] };
}> => {
  return get(`${BASE_URL}/categories`);
};
