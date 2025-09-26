import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare,
  FileText,
  Send,
  Plus,
  Settings,
  Users,
  Phone,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SMSTemplateList from '@/components/dashboard/sms/SMSTemplateList';
import { ROUTES } from '@/constants';

export default function SMSPage() {
  const [activeTab, setActiveTab] = useState('templates');
  const navigate = useNavigate();

  const handleCreateTemplate = () => {
    navigate(`${ROUTES.DASHBOARD.SMS}/create`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SMS Management</h1>
          <p className="text-muted-foreground">
            Create SMS templates and send chat invitations to applicants
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleCreateTemplate} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Template
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Templates</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—</div>
            <p className="text-xs text-muted-foreground">
              Active SMS templates
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chat Invites</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—</div>
            <p className="text-xs text-muted-foreground">
              Sent this month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—</div>
            <p className="text-xs text-muted-foreground">
              Applicants who responded
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Chats</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—</div>
            <p className="text-xs text-muted-foreground">
              Ongoing conversations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="invitations" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Chat Invitations
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <SMSTemplateList />
        </TabsContent>

        <TabsContent value="invitations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Chat Invitation Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Send Chat Invitations</h3>
                <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                  Chat invitations are sent directly from the applicant details page. 
                  Use SMS templates to create personalized messages with chat links.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Button
                    onClick={() => setActiveTab('templates')}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Manage Templates
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                SMS Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-base font-semibold">Twilio Configuration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Account Status</label>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          Not Configured
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        SMS functionality requires Twilio configuration
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Phone Number</label>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          Not Set
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Configure your SMS sender number
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-base font-semibold">Chat Integration</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium text-sm">Seamless Chat Portal</div>
                        <div className="text-xs text-muted-foreground">
                          SMS links automatically direct to secure chat portal
                        </div>
                      </div>
                      <Badge variant="default">Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium text-sm">URL Shortener</div>
                        <div className="text-xs text-muted-foreground">
                          Create short links for SMS messages
                        </div>
                      </div>
                      <Badge variant="default">Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium text-sm">Auto-Authentication</div>
                        <div className="text-xs text-muted-foreground">
                          Applicants access chat without login
                        </div>
                      </div>
                      <Badge variant="default">Enabled</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-base font-semibold">Template Variables</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-medium mb-2">Applicant Data</h4>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• {`{{applicant.firstName}}`}</li>
                        <li>• {`{{applicant.lastName}}`}</li>
                        <li>• {`{{applicant.email}}`}</li>
                        <li>• {`{{applicant.phone}}`}</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Job & Company</h4>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• {`{{job.jobTitle}}`}</li>
                        <li>• {`{{company.name}}`}</li>
                        <li>• {`{{shortChatLink}}`}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
