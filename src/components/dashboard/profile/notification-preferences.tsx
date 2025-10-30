import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Bell, Brain, Zap, MessageSquare, Calendar, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import API from '@/http';
import useAuthSessionContext from '@/lib/context/AuthSessionContext';

export function NotificationPreferences() {
  const { data: session } = useAuthSessionContext();
  const [preferences, setPreferences] = useState({
    newApplications: true,
    aiFollowupCompleted: true,
    automationExecuted: false,
    messageReceived: true,
    interviewScheduled: true,
    jobExpiring: true,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load current preferences
    if (session?.user?.notificationPreferences) {
      setPreferences({
        newApplications: session.user.notificationPreferences.newApplications ?? true,
        aiFollowupCompleted: session.user.notificationPreferences.aiFollowupCompleted ?? true,
        automationExecuted: session.user.notificationPreferences.automationExecuted ?? false,
        messageReceived: session.user.notificationPreferences.messageReceived ?? true,
        interviewScheduled: session.user.notificationPreferences.interviewScheduled ?? true,
        jobExpiring: session.user.notificationPreferences.jobExpiring ?? true,
      });
    }
    setIsLoading(false);
  }, [session]);

  const handleToggle = async (key: keyof typeof preferences) => {
    const newValue = !preferences[key];
    setPreferences({ ...preferences, [key]: newValue });

    try {
      await API.user.updateProfile({
        notificationPreferences: {
          ...preferences,
          [key]: newValue,
        },
      });
      toast.success('Notification preferences updated');
    } catch (error) {
      // Revert on error
      setPreferences(preferences);
      toast.error('Failed to update preferences');
    }
  };

  const notificationTypes = [
    {
      key: 'newApplications' as const,
      label: 'New Applications',
      description: 'When candidates apply to your jobs',
      icon: Bell,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      key: 'aiFollowupCompleted' as const,
      label: 'AI Follow-up Completed',
      description: 'When applicants finish AI follow-up questions',
      icon: Brain,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      key: 'automationExecuted' as const,
      label: 'Automation Executed',
      description: 'When automations run (can be noisy)',
      icon: Zap,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
    },
    {
      key: 'messageReceived' as const,
      label: 'New Messages',
      description: 'When you receive chat/email messages',
      icon: MessageSquare,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      key: 'interviewScheduled' as const,
      label: 'Interviews Scheduled',
      description: 'When interviews are booked',
      icon: Calendar,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      key: 'jobExpiring' as const,
      label: 'Job Expiring Soon',
      description: 'Reminders for expiring job posts',
      icon: AlertCircle,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header matching other settings sections */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          Notification Preferences
        </h3>
        <p className="text-gray-600 text-sm">
          Choose which notifications you want to receive
        </p>
      </div>

      <div className="space-y-3">
        {notificationTypes.map((type) => (
          <div
            key={type.key}
            className="flex items-center justify-between p-4 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 bg-white rounded-xl shadow-sm ${type.color}`}>
                <type.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <Label htmlFor={type.key} className="font-bold text-base cursor-pointer block mb-1">
                  {type.label}
                </Label>
                <p className="text-sm text-gray-600">{type.description}</p>
              </div>
            </div>
            <Switch
              id={type.key}
              checked={preferences[type.key]}
              onCheckedChange={() => handleToggle(type.key)}
              disabled={isLoading}
              className="ml-4"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

