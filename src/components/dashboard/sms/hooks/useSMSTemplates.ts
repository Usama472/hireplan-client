import { useState, useEffect } from 'react';
import API from '@/http';
import { toast } from 'sonner';
import type { SMSTemplate, SMSTemplateListResponse } from '@/interfaces/sms';

interface UseSMSTemplatesOptions {
  category?: string;
  isActive?: boolean;
  autoFetch?: boolean;
}

export const useSMSTemplates = (options: UseSMSTemplatesOptions = {}) => {
  const [templates, setTemplates] = useState<SMSTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    category,
    isActive = true,
    autoFetch = true,
  } = options;

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = {
        limit: 100, // Get all templates for dropdown
        sortBy: 'name:asc',
      };

      if (category) {
        params.category = category;
      }
      
      if (isActive !== undefined) {
        params.isActive = isActive;
      }

      const response: SMSTemplateListResponse = await API.sms.getSMSTemplates(params);
      setTemplates(response.results || []);
    } catch (error: any) {
      console.error('Error fetching SMS templates:', error);
      const errorMessage = error?.response?.data?.message || 'Failed to load SMS templates';
      setError(errorMessage);
      toast.error(errorMessage);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchTemplates();
    }
  }, [category, isActive, autoFetch]);

  return {
    templates,
    loading,
    error,
    refetch: fetchTemplates,
  };
};

export const useGlobalSMSTemplates = () => {
  return useSMSTemplates({
    isActive: true,
    autoFetch: true,
  });
};
