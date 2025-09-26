import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Hash,
  MessageSquare,
  Plus,
  User,
  Briefcase,
  Building,
  Link,
  HelpCircle,
  Copy,
} from "lucide-react";
import { DEFAULT_TEMPLATE_VARIABLES, type TemplateVariableOption } from "@/interfaces/sms";

interface SMSVariableSectionProps {
  onInsertVariable: (variableKey: string) => void;
}

export const SMSVariableSection: React.FC<SMSVariableSectionProps> = ({
  onInsertVariable,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [customVariable, setCustomVariable] = useState({ key: "", title: "" });

  const filteredVariables = selectedCategory === "all" 
    ? DEFAULT_TEMPLATE_VARIABLES 
    : DEFAULT_TEMPLATE_VARIABLES.filter(v => v.category === selectedCategory);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'applicant': return <User className="h-3 w-3" />;
      case 'job': return <Briefcase className="h-3 w-3" />;
      case 'company': return <Building className="h-3 w-3" />;
      case 'system': return <Link className="h-3 w-3" />;
      default: return <Hash className="h-3 w-3" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'applicant': return 'text-blue-600 bg-blue-50';
      case 'job': return 'text-green-600 bg-green-50';
      case 'company': return 'text-orange-600 bg-orange-50';
      case 'system': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const addCustomVariable = () => {
    if (customVariable.key && customVariable.title) {
      onInsertVariable(customVariable.key);
      setCustomVariable({ key: "", title: "" });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Hash className="h-5 w-5 text-purple-600" />
            Template Variables
          </CardTitle>
          <CardDescription>
            Click any variable to insert it into your SMS template. Variables will be automatically replaced with actual values.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Category Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Filter by Category</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Variables</SelectItem>
                <SelectItem value="applicant">
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3" />
                    Applicant Data
                  </div>
                </SelectItem>
                <SelectItem value="job">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-3 w-3" />
                    Job Information
                  </div>
                </SelectItem>
                <SelectItem value="company">
                  <div className="flex items-center gap-2">
                    <Building className="h-3 w-3" />
                    Company Data
                  </div>
                </SelectItem>
                <SelectItem value="system">
                  <div className="flex items-center gap-2">
                    <Link className="h-3 w-3" />
                    Chat Portal Links
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Variable List */}
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {filteredVariables.map((variable) => (
              <TooltipProvider key={variable.key}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => onInsertVariable(variable.key)}
                      className="w-full text-left p-3 rounded-lg border hover:bg-muted transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`p-1 rounded ${getCategoryColor(variable.category)}`}>
                            {getCategoryIcon(variable.category)}
                          </div>
                          <div>
                            <div className="font-medium text-sm">{variable.title}</div>
                            <div className="text-xs text-muted-foreground font-mono">
                              {`{{${variable.key}}}`}
                            </div>
                          </div>
                        </div>
                        <Copy className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Click to insert {`{{${variable.key}}}`}</p>
                    {variable.description && (
                      <p className="text-xs text-muted-foreground mt-1">{variable.description}</p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom Variable */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Plus className="h-5 w-5 text-purple-600" />
            Custom Variable
          </CardTitle>
          <CardDescription>
            Create a custom variable for specific use cases.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Variable Key</Label>
            <Input
              placeholder="e.g., customField"
              value={customVariable.key}
              onChange={(e) => setCustomVariable(prev => ({ ...prev, key: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Display Name</Label>
            <Input
              placeholder="e.g., Custom Field Value"
              value={customVariable.title}
              onChange={(e) => setCustomVariable(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>
          <Button
            type="button"
            size="sm"
            onClick={addCustomVariable}
            disabled={!customVariable.key || !customVariable.title}
            className="w-full"
          >
            <Plus className="h-3 w-3 mr-2" />
            Insert Custom Variable
          </Button>
        </CardContent>
      </Card>

      {/* Chat Portal Integration Info */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-purple-600" />
            Chat Portal Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Link className="h-3 w-3 text-purple-600" />
              </div>
              <div>
                <div className="font-medium text-sm text-purple-900">Seamless Chat Links</div>
                <div className="text-xs text-purple-700">
                  Use {`{{shortChatLink}}`} to create secure links that direct applicants to the chat portal without requiring login.
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <MessageSquare className="h-3 w-3 text-blue-600" />
              </div>
              <div>
                <div className="font-medium text-sm text-blue-900">Auto-Authentication</div>
                <div className="text-xs text-blue-700">
                  Applicants can start chatting immediately - no passwords or login required.
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SMS Character Guide */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            SMS Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs space-y-2">
          <div className="flex justify-between">
            <span>SMS Limit:</span>
            <Badge variant="outline">160 characters</Badge>
          </div>
          <div className="flex justify-between">
            <span>Chat Link:</span>
            <Badge variant="outline">~25 characters</Badge>
          </div>
          <div className="flex justify-between">
            <span>Available for text:</span>
            <Badge variant="outline">~135 characters</Badge>
          </div>
          <div className="pt-2 border-t text-muted-foreground">
            💡 Chat links are automatically shortened and count toward the 160 character limit.
          </div>
          <div className="text-muted-foreground">
            🔗 Links direct users to the secure applicant portal for seamless chat access.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
