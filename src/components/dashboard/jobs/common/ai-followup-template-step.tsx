import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import API from "@/http";
import { AlertCircle, Brain, Plus, Trash2, InfoIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AITemplate {
  id: string;
  name: string;
  description?: string;
  questions: Array<{
    text: string;
    category: string;
    scoringCriteria?: string;
  }>;
}

interface AIFollowupTemplateStepProps {
  automations?: string[];
}

export function AIFollowupTemplateStep({ automations = [] }: AIFollowupTemplateStepProps) {
  const { watch, setValue } = useFormContext();
  const [aiTemplates, setAiTemplates] = useState<AITemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [selectedAutomations, setSelectedAutomations] = useState<any[]>([]);
  const [hasAIFollowup, setHasAIFollowup] = useState(false);

  const aiFollowupTemplate = watch("aiFollowupTemplate") || {
    enabled: false,
    questions: [],
    emailSubject: "",
    responseDeadlineHours: 72,
    templateId: "",
  };

  // Fetch AI templates
  useEffect(() => {
    const fetchAITemplates = async () => {
      try {
        setLoadingTemplates(true);
        const response = await API.aiTemplate.getAITemplates();
        if (response.data?.templates) {
          setAiTemplates(response.data.templates);
        }
      } catch (error) {
        console.error("Error fetching AI templates:", error);
      } finally {
        setLoadingTemplates(false);
      }
    };

    fetchAITemplates();
  }, []);

  // Check if any selected automation has AI follow-up action
  useEffect(() => {
    const checkAutomationsForAIFollowup = async () => {
      if (!automations || automations.length === 0) {
        setHasAIFollowup(false);
        setSelectedAutomations([]);
        return;
      }

      try {
        const response = await API.automation.getAutomations();
        if (response.success) {
          const selectedAutos = response.results.filter((auto: any) =>
            automations.includes(auto.id)
          );
          
          setSelectedAutomations(selectedAutos);

          // Check if any automation has ai_follow_up action
          const hasFollowup = selectedAutos.some((auto: any) => {
            // Check regular actions
            const hasInActions = auto.actions?.some((action: any) => 
              action.type === 'ai_follow_up' || action.type === 'send_another_followup'
            );

            // Check score rules
            const hasInScoreRules = auto.scoreRules?.some((rule: any) =>
              rule.actions?.some((action: any) => 
                action.type === 'ai_follow_up' || action.type === 'send_another_followup'
              )
            );

            return hasInActions || hasInScoreRules;
          });

          setHasAIFollowup(hasFollowup);

          // Enable by default if automation has AI follow-up
          if (hasFollowup && !aiFollowupTemplate.enabled) {
            setValue("aiFollowupTemplate.enabled", true);
          }
        }
      } catch (error) {
        console.error("Error checking automations:", error);
      }
    };

    checkAutomationsForAIFollowup();
  }, [automations, setValue]);

  // Don't render if no AI follow-up automation is selected
  if (!hasAIFollowup) {
    return null;
  }

  const handleTemplateSelect = (templateId: string) => {
    if (templateId === "custom") {
      setValue("aiFollowupTemplate.templateId", "");
      setValue("aiFollowupTemplate.questions", [
        { question: "", category: "custom", scoringCriteria: "" },
        { question: "", category: "custom", scoringCriteria: "" },
        { question: "", category: "custom", scoringCriteria: "" },
      ]);
    } else {
      const template = aiTemplates.find((t) => t.id === templateId);
      if (template) {
        setValue("aiFollowupTemplate.templateId", templateId);
        setValue(
          "aiFollowupTemplate.questions",
          template.questions.map((q) => ({
            question: q.text,
            category: q.category || "custom",
            scoringCriteria: q.scoringCriteria || "",
          }))
        );
        // Set default email subject from template name
        if (!aiFollowupTemplate.emailSubject) {
          setValue("aiFollowupTemplate.emailSubject", `Follow-up: ${template.name}`);
        }
      }
    }
  };

  const addQuestion = () => {
    const currentQuestions = aiFollowupTemplate.questions || [];
    if (currentQuestions.length < 5) {
      setValue("aiFollowupTemplate.questions", [
        ...currentQuestions,
        { question: "", category: "custom", scoringCriteria: "" },
      ]);
    }
  };

  const removeQuestion = (index: number) => {
    const currentQuestions = aiFollowupTemplate.questions || [];
    if (currentQuestions.length > 3) {
      setValue(
        "aiFollowupTemplate.questions",
        currentQuestions.filter((_: any, i: number) => i !== index)
      );
    }
  };

  const updateQuestion = (index: number, field: string, value: string) => {
    const currentQuestions = [...(aiFollowupTemplate.questions || [])];
    currentQuestions[index] = {
      ...currentQuestions[index],
      [field]: value,
    };
    setValue("aiFollowupTemplate.questions", currentQuestions);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">AI Follow-up Questions</h2>
        <p className="text-muted-foreground">
          Configure follow-up questions for your AI automation. These questions will be sent automatically when triggered.
        </p>
      </div>

      <Alert className="bg-blue-50 border-blue-200">
        <Brain className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-900">
          <strong>Automation Detected:</strong> This job has automations with AI follow-up actions. Configure the questions below.
          <div className="mt-2">
            <strong>Selected Automations:</strong>
            <div className="flex flex-wrap gap-2 mt-1">
              {selectedAutomations.map((auto) => (
                <Badge key={auto.id} variant="secondary" className="text-xs">
                  {auto.name}
                </Badge>
              ))}
            </div>
          </div>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Template Configuration</CardTitle>
              <CardDescription>
                Select a template or create custom questions
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="enabled-switch">Enabled</Label>
              <Switch
                id="enabled-switch"
                checked={aiFollowupTemplate.enabled}
                onCheckedChange={(checked) =>
                  setValue("aiFollowupTemplate.enabled", checked)
                }
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {aiFollowupTemplate.enabled && (
            <>
              {/* Template Selector */}
              <div className="space-y-2">
                <Label>Question Template</Label>
                <Select
                  value={aiFollowupTemplate.templateId || "custom"}
                  onValueChange={handleTemplateSelect}
                  disabled={loadingTemplates}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Custom Questions</SelectItem>
                    {aiTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Email Configuration */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email Subject</Label>
                  <Input
                    placeholder="Follow-up Questions"
                    value={aiFollowupTemplate.emailSubject || ""}
                    onChange={(e) =>
                      setValue("aiFollowupTemplate.emailSubject", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Response Deadline (hours)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={168}
                    value={aiFollowupTemplate.responseDeadlineHours || 72}
                    onChange={(e) =>
                      setValue(
                        "aiFollowupTemplate.responseDeadlineHours",
                        parseInt(e.target.value) || 72
                      )
                    }
                  />
                </div>
              </div>

              {/* Questions */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Questions (3-5 required)</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addQuestion}
                    disabled={(aiFollowupTemplate.questions || []).length >= 5}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Question
                  </Button>
                </div>

                {(aiFollowupTemplate.questions || []).map((question: any, index: number) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <Label>Question {index + 1}</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeQuestion(index)}
                          disabled={(aiFollowupTemplate.questions || []).length <= 3}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <Textarea
                        placeholder="Enter your question..."
                        value={question.question}
                        onChange={(e) =>
                          updateQuestion(index, "question", e.target.value)
                        }
                        rows={3}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs">Category</Label>
                          <Select
                            value={question.category || "custom"}
                            onValueChange={(value) =>
                              updateQuestion(index, "category", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="technical">Technical</SelectItem>
                              <SelectItem value="experience">Experience</SelectItem>
                              <SelectItem value="cultural">Cultural Fit</SelectItem>
                              <SelectItem value="behavioral">Behavioral</SelectItem>
                              <SelectItem value="custom">Custom</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">Scoring Criteria (optional)</Label>
                          <Input
                            placeholder="What to look for in answers"
                            value={question.scoringCriteria || ""}
                            onChange={(e) =>
                              updateQuestion(index, "scoringCriteria", e.target.value)
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}

                {(aiFollowupTemplate.questions || []).length < 3 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      You must have at least 3 questions for AI follow-up.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <Alert>
                <InfoIcon className="h-4 w-4" />
                <AlertDescription>
                  These questions will be used when the automation triggers an AI follow-up action.
                  Candidates will receive an email with these questions and their responses will be
                  automatically scored by AI.
                </AlertDescription>
              </Alert>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

