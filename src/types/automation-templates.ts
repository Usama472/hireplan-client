export interface AutomationTemplate {
  id: string;
  name: string;
  description: string;
  category: 'application' | 'interview' | 'communication' | 'status' | 'ai';
  icon: string;
  color: string;
  tags: string[];
  isPopular?: boolean;
  estimatedUsage?: string;
  trigger: any;
  actions: any[];
}

export interface TemplateCategory {
  category: string;
  count: number;
  label: string;
  description: string;
}

export interface GetTemplatesResponse {
  success: boolean;
  data: {
    templates: AutomationTemplate[];
    categories: TemplateCategory[];
  };
}

export interface GetTemplateResponse {
  success: boolean;
  data: {
    template: AutomationTemplate;
  };
}

export interface CreateFromTemplateResponse {
  success: boolean;
  message: string;
  data: {
    automation: any;
  };
}

export interface TemplateStatusResponse {
  success: boolean;
  data: {
    templateId: string;
    isActive: boolean;
  };
}
