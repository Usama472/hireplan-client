import React, { createContext, useContext, useState, useEffect } from 'react';

interface AutomationContextType {
  automation: any;
  setAutomation: (automation: any) => void;
  isEditMode: boolean;
  setIsEditMode: (isEdit: boolean) => void;
  selectedTriggerType: string;
  setSelectedTriggerType: (trigger: string) => void;
  automationName: string;
  setAutomationName: (name: string) => void;
}

const AutomationContext = createContext<AutomationContextType | null>(null);

export function AutomationProvider({ children, initialAutomation = null }: { 
  children: React.ReactNode;
  initialAutomation?: any;
}) {
  const [automation, setAutomation] = useState(initialAutomation);
  const [isEditMode, setIsEditMode] = useState(!!initialAutomation);
  const [selectedTriggerType, setSelectedTriggerType] = useState(
    initialAutomation?.triggerType || ""
  );
  const [automationName, setAutomationName] = useState(
    initialAutomation?.name || ""
  );

  // Update context when initial automation changes
  useEffect(() => {
    if (initialAutomation) {
      setAutomation(initialAutomation);
      setIsEditMode(true);
      setSelectedTriggerType(initialAutomation.triggerType || "");
      setAutomationName(initialAutomation.name || "");
    }
  }, [initialAutomation]);

  const value = {
    automation,
    setAutomation,
    isEditMode,
    setIsEditMode,
    selectedTriggerType,
    setSelectedTriggerType,
    automationName,
    setAutomationName,
  };

  return (
    <AutomationContext.Provider value={value}>
      {children}
    </AutomationContext.Provider>
  );
}

export function useAutomation() {
  const context = useContext(AutomationContext);
  if (!context) {
    throw new Error('useAutomation must be used within an AutomationProvider');
  }
  return context;
}
