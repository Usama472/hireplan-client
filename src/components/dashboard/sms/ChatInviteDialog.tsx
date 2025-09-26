import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, 
  Send, 
  FileText, 
  Hash, 
  User, 
  Briefcase,
  Phone,
  ExternalLink,
} from 'lucide-react';
import API from '@/http';
import { toast } from 'sonner';
import {
  type SMSTemplate,
  type SendChatInviteRequest,
  SMS_MAX_LENGTH,
  CHAT_LINK_LENGTH,
} from '@/interfaces/sms';

const formSchema = z.object({
  templateId: z.string().optional(),
  customMessage: z.string().min(1, 'Message is required').max(SMS_MAX_LENGTH - CHAT_LINK_LENGTH, `Message must be ${SMS_MAX_LENGTH - CHAT_LINK_LENGTH} characters or less (reserving space for chat link)`),
});

type FormValues = z.infer<typeof formSchema>;

interface Applicant {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  smsConsent?: boolean;
  status: string;
}

interface Job {
  _id: string;
  jobTitle: string;
  company?: { name: string };
  companyName?: string;
}

interface ChatInviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicant: Applicant;
  job: Job;
  onInviteSent?: () => void;
}

export default function ChatInviteDialog({
  open,
  onOpenChange,
  applicant,
  job,
  onInviteSent,
}: ChatInviteDialogProps) {
  const [templates, setTemplates] = useState<SMSTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<SMSTemplate | null>(null);
  const [loading, setLoading] = useState(false);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('template');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      templateId: '',
      customMessage: '',
    },
  });

  const watchedCustomMessage = form.watch('customMessage');

  useEffect(() => {
    if (open) {
      fetchTemplates();
    }
  }, [open]);

  const fetchTemplates = async () => {
    try {
      setTemplatesLoading(true);
      const response = await API.sms.getSMSTemplates({
        category: 'invite',
        isActive: true,
        limit: 10,
      });
      setTemplates(response.results);
      
      // Auto-select first template if available
      if (response.results.length > 0) {
        setSelectedTemplate(response.results[0]);
        form.setValue('templateId', response.results[0]._id);
      }
    } catch (error) {
      console.error('Error fetching SMS templates:', error);
      // Continue without templates
    } finally {
      setTemplatesLoading(false);
    }
  };

  const handleTemplateSelect = (template: SMSTemplate) => {
    setSelectedTemplate(template);
    form.setValue('templateId', template._id);
    setActiveTab('template');
  };

  const handleSendInvite = async (data: FormValues) => {
    if (!applicant.phone) {
      toast.error('Applicant has no phone number');
      return;
    }

    try {
      setLoading(true);
      
      const inviteData: SendChatInviteRequest = {
        applicantId: applicant._id,
        jobId: job._id,
      };

      if (activeTab === 'template' && data.templateId) {
        inviteData.templateId = data.templateId;
      } else if (activeTab === 'custom' && data.customMessage) {
        inviteData.customMessage = data.customMessage;
      }

      await API.sms.sendChatInvite(inviteData);
      
      toast.success(`Chat invitation sent to ${applicant.firstName}!`);
      onInviteSent?.();
      onOpenChange(false);
      
      // Reset form
      form.reset();
      setSelectedTemplate(null);
      setActiveTab('template');
      
    } catch (error: any) {
      console.error('Error sending chat invite:', error);
      toast.error(error.response?.data?.message || 'Failed to send chat invitation');
    } finally {
      setLoading(false);
    }
  };

  const getPreviewMessage = () => {
    let message = '';
    
    if (activeTab === 'template' && selectedTemplate) {
      message = selectedTemplate.message;
    } else if (activeTab === 'custom') {
      message = watchedCustomMessage;
    }

    // Simple variable replacement for preview
    return message
      .replace(/\{\{applicant\.firstName\}\}/g, applicant.firstName)
      .replace(/\{\{applicant\.lastName\}\}/g, applicant.lastName)
      .replace(/\{\{job\.jobTitle\}\}/g, job.jobTitle)
      .replace(/\{\{company\.name\}\}/g, job.company?.name || job.companyName || 'Company')
      .replace(/\{\{shortChatLink\}\}/g, 'https://hireplan.co/chat/abc123');
  };

  const getCharacterCount = () => {
    const messageLength = getPreviewMessage().length;
    // Add chat link length if message contains shortChatLink variable
    const hasShortChatLink = getPreviewMessage().includes('{{shortChatLink}}') || 
                            (selectedTemplate?.message && selectedTemplate.message.includes('{{shortChatLink}}'));
    const linkLength = hasShortChatLink ? CHAT_LINK_LENGTH : 0;
    return messageLength + linkLength;
  };

  const getAvailableCharacters = () => {
    return SMS_MAX_LENGTH - getCharacterCount();
  };

  const isOverLimit = () => {
    return getCharacterCount() > SMS_MAX_LENGTH;
  };

  if (!applicant.phone) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-orange-500" />
              No Phone Number
            </DialogTitle>
            <DialogDescription>
              This applicant doesn't have a phone number on file.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
              <ExternalLink className="h-4 w-4 text-orange-600" />
              <span className="text-sm text-orange-800">
                Consider using email chat or adding a phone number to their profile.
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  if (!applicant.smsConsent) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-red-500" />
              No SMS Consent
            </DialogTitle>
            <DialogDescription>
              This applicant has not consented to receive SMS messages.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
              <ExternalLink className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-800">
                For 10DLC compliance, SMS can only be sent to applicants who have explicitly consented. Consider using email chat instead.
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Send Chat Invitation
          </DialogTitle>
          <DialogDescription>
            Send {applicant.firstName} an SMS to start chatting in the portal.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Applicant Summary */}
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm">{applicant.firstName} {applicant.lastName}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-2">
                <Phone className="h-3 w-3" />
                {applicant.phone}
              </div>
            </div>
            <div className="text-right text-xs">
              <div className="font-medium">{job.jobTitle}</div>
              <div className="text-muted-foreground">{job.company?.name || job.companyName}</div>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSendInvite)} className="space-y-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="template" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Template
                  </TabsTrigger>
                  <TabsTrigger value="custom" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Custom
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="template" className="space-y-4">
                  {templatesLoading ? (
                    <div className="text-center py-4">Loading templates...</div>
                  ) : templates.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      No invitation templates found. You can create one or use a custom message.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Choose Template</label>
                      <Select 
                        value={selectedTemplate?._id || ''} 
                        onValueChange={(value) => {
                          const template = templates.find(t => t._id === value);
                          if (template) handleTemplateSelect(template);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a template" />
                        </SelectTrigger>
                        <SelectContent>
                          {templates.map((template) => (
                            <SelectItem key={template._id} value={template._id}>
                              <div>
                                <div className="font-medium">{template.name}</div>
                                <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                                  {template.message}
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="custom" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="customMessage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custom Message</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={`Hi {{applicant.firstName}}, thanks for applying! Let's chat: {{shortChatLink}}`}
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>

              {/* Preview */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Preview</label>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-sm font-mono">
                    {getPreviewMessage() || 'Select a template or enter a custom message...'}
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                    <span className={`flex items-center gap-1 ${isOverLimit() ? 'text-red-500' : getAvailableCharacters() < 20 ? 'text-amber-500' : ''}`}>
                      <Hash className="h-3 w-3" />
                      {getCharacterCount()}/{SMS_MAX_LENGTH}
                    </span>
                    <span className={`flex items-center gap-1 ${getAvailableCharacters() < 20 ? 'text-amber-500' : ''}`}>
                      <MessageSquare className="h-3 w-3" />
                      {getAvailableCharacters()} remaining
                    </span>
                  </div>
                  {isOverLimit() && (
                    <div className="text-xs text-red-500 mt-1">
                      Message exceeds 160 character limit (including chat link)
                    </div>
                  )}
                </div>
              </div>
            </form>
          </Form>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={form.handleSubmit(handleSendInvite)}
            disabled={loading || isOverLimit() || (!selectedTemplate && !watchedCustomMessage)}
            className="flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            {loading ? 'Sending...' : 'Send Invitation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
