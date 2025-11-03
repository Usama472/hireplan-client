import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AutomationType } from '@/interfaces/automations';

// Extended automation type that handles both frontend and backend formats
type ExtendedAutomationType = AutomationType & {
  // Allow for both formats
  triggerType?: string;
  status?: string;
  scoreRules?: any[];
  schedule?: any;
};

// Define the condition and action interfaces to match the existing trigger components
interface Condition {
  id: string;
  field: string;
  operator: string;
  value: string;
}

interface Action {
  id: string;
  type: string;
  config: {
    templateId?: string;
    smsTemplateId?: string;
    customMessage?: string;
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
}

// ScoreRule interface for AI follow-up trigger
interface ScoreRule {
  id: string;
  minScore: number;
  maxScore: number;
  actions: Action[];
  label?: string;
}

interface AutomationContextType {
  // Basic automation info
  automationName: string;
  setAutomationName: (name: string) => void;
  selectedTriggerType: string;
  setSelectedTriggerType: (type: string) => void;
  automationStatus: boolean;
  setAutomationStatus: (status: boolean) => void;
  
  // Conditions
  useConditions: boolean;
  setUseConditions: (use: boolean) => void;
  conditions: Condition[];
  setConditions: (conditions: Condition[]) => void;
  
  // Actions
  actions: Action[];
  setActions: (actions: Action[]) => void;
  
  // Score rules (for AI follow-up)
  scoreRules: ScoreRule[];
  setScoreRules: (rules: ScoreRule[]) => void;
  
  // Labels
  labels: string[];
  setLabels: (labels: string[]) => void;
  
  // Schedule (for cron triggers)
  schedule?: {
    cronExpression: string;
    timezone: string;
  };
  setSchedule: (schedule: { cronExpression: string; timezone: string } | undefined) => void;
  
  // Edit mode
  isEditMode: boolean;
  automation: ExtendedAutomationType | null;
  
  // Form validation
  isValid: boolean;
  setIsValid: (valid: boolean) => void;
  validationMessage: string;
  setValidationMessage: (message: string) => void;
  formTouched: boolean;
  setFormTouched: (touched: boolean) => void;
}

const AutomationContext = createContext<AutomationContextType | undefined>(undefined);

interface AutomationProviderProps {
  children: ReactNode;
  initialAutomation?: ExtendedAutomationType | null;
}

export const AutomationProvider: React.FC<AutomationProviderProps> = ({ children, initialAutomation = null }) => {
  const isEditMode = !!initialAutomation;
  
  // Basic automation info
  const [automationName, setAutomationName] = useState(initialAutomation?.name || '');
  const [selectedTriggerType, setSelectedTriggerType] = useState(
    initialAutomation?.trigger?.type || initialAutomation?.triggerType || ''
  );
  const [automationStatus, setAutomationStatus] = useState(
    initialAutomation ? (initialAutomation.status === 'active' || initialAutomation.enabled !== false) : true
  );
  
  // Conditions
  const [useConditions, setUseConditions] = useState(
    initialAutomation ? (initialAutomation.conditions && initialAutomation.conditions.length > 0) : false
  );
  const [conditions, setConditions] = useState<Condition[]>(() => {
    if (initialAutomation?.conditions && initialAutomation.conditions.length > 0) {
      return initialAutomation.conditions.map((condition, index) => ({
        id: `condition-${index}`,
        field: condition.field,
        operator: condition.operator,
        value: condition.value,
      }));
    }
    return [{ id: "1", field: "totalScore", operator: "equals", value: "" }];
  });
  
  // Actions
  const [actions, setActions] = useState<Action[]>(() => {
    if (initialAutomation?.actions && initialAutomation.actions.length > 0) {
      return initialAutomation.actions.map((action, index) => ({
        id: `action-${index}`,
        type: action.type,
        config: action.config || {},
      }));
    }
    return [{
      id: "1",
      type: "send_email_applicant",
      config: { templateId: "", delay: { value: 0, unit: "minutes" } },
    }];
  });
  
  // Score rules (for AI follow-up)
  const [scoreRules, setScoreRules] = useState<ScoreRule[]>(() => {
    if (initialAutomation && initialAutomation.scoreRules && Array.isArray(initialAutomation.scoreRules)) {
      return initialAutomation.scoreRules.map((rule: any, index: number) => ({
        id: `rule-${index}`,
        minScore: rule.minScore || 0,
        maxScore: rule.maxScore || 100,
        actions: Array.isArray(rule.actions) ? rule.actions.map((action: any, actionIndex: number) => ({
          id: `action-${actionIndex}`,
          type: action.type,
          config: action.config || {},
        })) : [],
        label: rule.label || '',
      }));
    }
    return [];
  });
  
  // Labels
  const [labels, setLabels] = useState<string[]>(
    initialAutomation?.labels || []
  );
  
  // Schedule (for cron triggers)
  const [schedule, setSchedule] = useState<{ cronExpression: string; timezone: string } | undefined>(() => {
    if (initialAutomation && initialAutomation.schedule && typeof initialAutomation.schedule === 'object') {
      const scheduleObj = initialAutomation.schedule as any;
      return {
        cronExpression: scheduleObj.cronExpression || '',
        timezone: scheduleObj.timezone || 'UTC',
      };
    }
    return undefined;
  });
  
  // Form validation
  const [isValid, setIsValid] = useState(true);
  const [validationMessage, setValidationMessage] = useState('');
  const [formTouched, setFormTouched] = useState(false);

  // Update state when initialAutomation changes
  useEffect(() => {
    if (initialAutomation) {
      setAutomationName(initialAutomation.name || '');
      setSelectedTriggerType(initialAutomation.trigger?.type || initialAutomation.triggerType || '');
      setAutomationStatus(initialAutomation.status === 'active' || initialAutomation.enabled !== false);
      
      // Update conditions
      const hasConditions = initialAutomation.conditions && initialAutomation.conditions.length > 0;
      setUseConditions(hasConditions);
      if (hasConditions) {
        setConditions(initialAutomation.conditions!.map((condition, index) => ({
          id: `condition-${index}`,
          field: condition.field,
          operator: condition.operator,
          value: condition.value,
        })));
      }
      
      // Update actions
      if (initialAutomation.actions && initialAutomation.actions.length > 0) {
        setActions(initialAutomation.actions.map((action, index) => ({
          id: `action-${index}`,
          type: action.type,
          config: action.config || {},
        })));
      }
      
      // Update score rules
      if (initialAutomation.scoreRules && Array.isArray(initialAutomation.scoreRules)) {
        setScoreRules(initialAutomation.scoreRules.map((rule: any, index: number) => ({
          id: `rule-${index}`,
          minScore: rule.minScore || 0,
          maxScore: rule.maxScore || 100,
          actions: Array.isArray(rule.actions) ? rule.actions.map((action: any, actionIndex: number) => ({
            id: `action-${actionIndex}`,
            type: action.type,
            config: action.config || {},
          })) : [],
          label: rule.label || '',
        })));
      }
      
      // Update labels
      setLabels(initialAutomation.labels || []);
      
      // Update schedule
      if (initialAutomation.schedule && typeof initialAutomation.schedule === 'object') {
        const scheduleObj = initialAutomation.schedule as any;
        setSchedule({
          cronExpression: scheduleObj.cronExpression || '',
          timezone: scheduleObj.timezone || 'UTC',
        });
      }
    }
  }, [initialAutomation]);

  return (
    <AutomationContext.Provider
      value={{
        automationName,
        setAutomationName,
        selectedTriggerType,
        setSelectedTriggerType,
        automationStatus,
        setAutomationStatus,
        useConditions,
        setUseConditions,
        conditions,
        setConditions,
        actions,
        setActions,
        scoreRules,
        setScoreRules,
        labels,
        setLabels,
        schedule,
        setSchedule,
        isEditMode,
        automation: initialAutomation,
        isValid,
        setIsValid,
        validationMessage,
        setValidationMessage,
        formTouched,
        setFormTouched,
      }}
    >
      {children}
    </AutomationContext.Provider>
  );
};

export const useAutomation = () => {
  const context = useContext(AutomationContext);
  if (context === undefined) {
    throw new Error('useAutomation must be used within an AutomationProvider');
  }
  return context;
};
