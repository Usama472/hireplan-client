import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  MessageSquare,
  Briefcase,
  FileText,
  Brain,
} from "lucide-react";
import { EmailTemplatesList } from "@/components/dashboard/email-templates";
import SMSTemplateList from "@/components/dashboard/sms/SMSTemplateList";
import { JobTemplatesList } from "@/components/dashboard/job-templates/JobTemplatesList";
import { AITemplatesList } from "@/components/dashboard/ai-templates/AITemplatesList";

export default function UnifiedTemplatesPage() {
  const [activeTab, setActiveTab] = useState("email");

  return (
    <div className="h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-100">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Templates
              </h1>
              <p className="text-gray-600">
                Create and manage all your templates in one place
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Content */}
      <div className="px-6 py-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid mb-6">
                <TabsTrigger value="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span className="hidden sm:inline">Email</span>
                </TabsTrigger>
                <TabsTrigger value="sms" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span className="hidden sm:inline">SMS</span>
                </TabsTrigger>
                <TabsTrigger value="job" className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  <span className="hidden sm:inline">Job</span>
                </TabsTrigger>
                <TabsTrigger value="ai" className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  <span className="hidden sm:inline">AI Questions</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="email" className="mt-0 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Email Templates</h2>
                  <Badge variant="secondary" className="ml-2">
                    Communication
                  </Badge>
                </div>
                <EmailTemplatesList />
              </TabsContent>

              <TabsContent value="sms" className="mt-0 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                  <h2 className="text-lg font-semibold text-gray-900">SMS Templates</h2>
                  <Badge variant="secondary" className="ml-2">
                    Chat Invitations
                  </Badge>
                </div>
                <SMSTemplateList />
              </TabsContent>

              <TabsContent value="job" className="mt-0 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Briefcase className="h-5 w-5 text-purple-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Job Templates</h2>
                  <Badge variant="secondary" className="ml-2">
                    Postings
                  </Badge>
                </div>
                <JobTemplatesList />
              </TabsContent>

              <TabsContent value="ai" className="mt-0 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="h-5 w-5 text-purple-600" />
                  <h2 className="text-lg font-semibold text-gray-900">AI Question Templates</h2>
                  <Badge variant="secondary" className="ml-2 bg-purple-100 text-purple-700">
                    Follow-up Automation
                  </Badge>
                </div>
                <AITemplatesList />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

