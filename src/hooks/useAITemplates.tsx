import { useState, useEffect } from 'react';

interface AITemplate {
  id: string;
  name: string;
  questions: Array<{
    text: string;
    scoringCriteria?: string;
  }>;
  autoRejectEnabled: boolean; // Just the toggle, automation sets thresholds
}

// This will be replaced with actual API call later
// For now, uses localStorage to persist templates
export function useAITemplates() {
  const [templates, setTemplates] = useState<AITemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    try {
      const stored = localStorage.getItem('aiTemplates');
      if (stored) {
        setTemplates(JSON.parse(stored));
      } else {
        // Default templates
        const defaults: AITemplate[] = [
          { 
            id: '1', 
            name: 'Technical Skills', 
            autoRejectEnabled: true,
            questions: [
              { text: 'Describe your tech experience', scoringCriteria: 'Depth of knowledge, specific examples' },
              { text: 'Walk through a problem you solved', scoringCriteria: 'Problem-solving approach' },
              { text: 'How do you ensure code quality?', scoringCriteria: 'Best practices' }
            ]
          },
          { 
            id: '2', 
            name: 'Cultural Fit',
            autoRejectEnabled: false,
            questions: [
              { text: 'What work environment do you prefer?', scoringCriteria: 'Self-awareness' },
              { text: 'How do you handle feedback?', scoringCriteria: 'Growth mindset' },
              { text: 'Describe your ideal team', scoringCriteria: 'Collaboration style' }
            ]
          },
        ];
        setTemplates(defaults);
        localStorage.setItem('aiTemplates', JSON.stringify(defaults));
      }
    } catch (error) {
      console.error('Failed to load AI templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveTemplate = (template: Omit<AITemplate, 'id'>) => {
    const newTemplate = { ...template, id: Date.now().toString() };
    const updated = [...templates, newTemplate];
    setTemplates(updated);
    localStorage.setItem('aiTemplates', JSON.stringify(updated));
    return newTemplate;
  };

  const deleteTemplate = (id: string) => {
    const updated = templates.filter(t => t.id !== id);
    setTemplates(updated);
    localStorage.setItem('aiTemplates', JSON.stringify(updated));
  };

  const getTemplate = (id: string) => {
    return templates.find(t => t.id === id);
  };

  return {
    templates,
    isLoading,
    saveTemplate,
    deleteTemplate,
    getTemplate,
    reload: loadTemplates,
  };
}

