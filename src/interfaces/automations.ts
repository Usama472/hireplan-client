export interface AutomationType {
  id: string;
  name: string;
  description: string;
  trigger: {
    type:
      | "application_created"
      | "application_status_changed"
      | "resume_score_updated"
      | "cron";
    config: {
      from?: string | null;
      to?: string | null;
      [key: string]: any;
    };
  };
  conditions: Array<{
    field: string;
    operator: string;
    value: string;
  }>;
  actions: Array<{
    type: "send_email" | "webhook" | "slack" | "custom";
    config: {
      templateId?: string;
      delay?: {
        value: number;
        unit: "minutes" | "hours" | "days";
      };
      timezone?: string;
      url?: string;
      method?: string;
      headers?: Record<string, string>;
      payload?: Record<string, any>;
      [key: string]: any;
    };
  }>;
  enabled: boolean;
  lastRunAt?: string;
  nextRunAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AutomationRunType {
  id: string;
  automationId: string;
  automationName: string;
  status: "scheduled" | "running" | "completed" | "failed";
  scheduledAt: string;
  executedAt?: string;
  applicationId?: string;
  error?: string;
  payload?: Record<string, any>;
  logs?: Array<{
    timestamp: string;
    level: "info" | "warn" | "error";
    message: string;
  }>;
}
