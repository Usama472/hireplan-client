import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, Plus, Trash2, Mail, ClipboardList, MessageSquare, Calendar, CheckCircle2, ArrowDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAutomation } from "@/contexts/AutomationContext";
import { useGlobalEmailTemplates } from "../../global-setting/hooks/useGlobalEmailTemplates";
import useAuthSessionContext from "@/lib/context/AuthSessionContext";
import { TagManager } from "../common/tag-manager";

interface ScoreRule {
  id: string;
  minScore: number;
  maxScore: number;
  actions: RuleAction[];
  label: string;
}

interface RuleAction {
  id: string;
  type: string;
  config: any;
}

export default function AIFollowupTrigger() {
  const { 
    automationName, 
    setAutomationName,
    automationStatus,
    setAutomationStatus,
    scoreRules,
    setScoreRules,
    labels,
    setLabels,
    isEditMode,
    setFormTouched
  } = useAutomation();
  
  const navigate = useNavigate();
  const { availableTemplates } = useGlobalEmailTemplates();
  const { subscription } = useAuthSessionContext();

  const hasAI = subscription?.planId === 'professional' || subscription?.planId === 'enterprise';

  const actionTypes = [
    { value: "send_another_followup", label: "Send Another AI Follow-up", icon: Brain },
    { value: "send_email_applicant", label: "Send Email to Applicant", icon: Mail },
    { value: "shortlist", label: "Shortlist Candidate", icon: CheckCircle2 },
    { value: "send_interview_invite", label: "Send Interview Invite", icon: Calendar },
    { value: "update_status", label: "Update Status", icon: ClipboardList },
    { value: "send_chat_invite", label: "Send Chat Invitation", icon: MessageSquare },
  ].filter(action => action.value !== "send_another_followup" || hasAI); // Only show AI follow-up if company has AI

  const addRule = () => {
    const nextRuleNumber = scoreRules.length + 1;
    setScoreRules([...scoreRules, { 
      id: `rule-${Date.now()}`,
      minScore: 0, 
      maxScore: 100, 
      actions: [],
      label: `Rule ${nextRuleNumber}`,
    }]);
  };



  const removeRule = (id: string) => {
    setScoreRules(scoreRules.filter(r => r.id !== id));
  };

  const updateRule = (id: string, updates: Partial<ScoreRule>) => {
    setScoreRules(scoreRules.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const addAction = (ruleId: string) => {
    setScoreRules(scoreRules.map(r => 
      r.id === ruleId 
        ? { ...r, actions: [...r.actions, { id: `action-${Date.now()}`, type: '', config: {} }] }
        : r
    ));
  };

  const removeAction = (ruleId: string, actionId: string) => {
    setScoreRules(scoreRules.map(r =>
      r.id === ruleId ? { ...r, actions: r.actions.filter(a => a.id !== actionId) } : r
    ));
  };

  const updateAction = (ruleId: string, actionId: string, updates: Partial<RuleAction>) => {
    setScoreRules(scoreRules.map(r =>
      r.id === ruleId
        ? { ...r, actions: r.actions.map(a => a.id === actionId ? { ...a, ...updates } : a) }
        : r
    ));
  };


  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header matching ApplicationCreatedTrigger style */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border border-purple-200">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-purple-600 rounded-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">AI Follow-up Workflow</h2>
            <p className="text-gray-700 mt-1">
              Trigger: When applicant completes AI follow-up questions
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Create rules to automatically perform actions based on the follow-up score (0-100%)
            </p>
          </div>
        </div>
      </div>

      {/* Name & Status */}
      <div className="bg-white border border-gray-100 rounded-lg p-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Workflow Name *</label>
            <Input value={automationName} onChange={(e) => setAutomationName(e.target.value)} placeholder="High-score follow-up flow" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <Select value={automationStatus ? "active" : "inactive"} onValueChange={(v) => setAutomationStatus(v === "active")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tags Section */}
        <div className="pt-6 border-t border-gray-100">
          <TagManager tags={labels} onChange={setLabels} />
        </div>
      </div>

      {/* Score Rules - Simple */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">When Follow-up Completes</h3>
            <p className="text-sm text-gray-600">Trigger actions based on score (template handles auto-reject)</p>
          </div>
          <Button onClick={addRule} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Rule
          </Button>
        </div>

        {scoreRules.map((rule, idx) => (
          <div key={rule.id} className="bg-white border-2 border-blue-200 rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Score Range */}
                <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
                  <span className="text-sm font-medium">Score:</span>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={rule.minScore}
                    onChange={(e) => updateRule(rule.id, { minScore: parseInt(e.target.value) || 0 })}
                    className="w-16 h-8 text-center"
                  />
                  <span className="text-sm">to</span>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={rule.maxScore}
                    onChange={(e) => updateRule(rule.id, { maxScore: parseInt(e.target.value) || 100 })}
                    className="w-16 h-8 text-center"
                  />
                  <span className="text-sm font-medium">%</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => addAction(rule.id)} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Action
                </Button>
                <Button onClick={() => removeRule(rule.id)} variant="ghost" size="sm" className="text-red-600">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Actions for this rule */}
            {rule.actions.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 rounded border-2 border-dashed">
                <p className="text-sm text-gray-500">No actions - click "Add Action" above</p>
              </div>
            ) : (
              <div className="space-y-3 pl-8 border-l-4 border-blue-300">
                {rule.actions.map((action, actionIdx) => (
                  <div key={action.id} className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg border">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center font-bold">
                        {actionIdx + 1}
                      </div>
                      {actionIdx < rule.actions.length - 1 && (
                        <ArrowDown className="w-4 h-4 text-gray-400" />
                      )}
                    </div>

                    <div className="flex-1 space-y-3">
                      <Select
                        value={action.type}
                        onValueChange={(value) => updateAction(rule.id, action.id, { type: value, config: {} })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select action..." />
                        </SelectTrigger>
                        <SelectContent>
                          {actionTypes.map(t => (
                            <SelectItem key={t.value} value={t.value}>
                              <div className="flex items-center gap-2">
                                <t.icon className="w-4 h-4" />
                                {t.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {action.type.includes('email') && (
                        <Select
                          value={action.config.templateId}
                          onValueChange={(value) => updateAction(rule.id, action.id, { config: { ...action.config, templateId: value } })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Email template..." />
                          </SelectTrigger>
                          <SelectContent>
                            {availableTemplates.map(t => {
                              const templateId = (t as any).id || (t as any)._id || '';
                              return <SelectItem key={templateId} value={templateId}>{t.name}</SelectItem>;
                            })}
                          </SelectContent>
                        </Select>
                      )}

                      {action.type === 'update_status' && (
                        <Select
                          value={action.config.status}
                          onValueChange={(value) => updateAction(rule.id, action.id, { config: { ...action.config, status: value } })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="New status..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="shortlisted">Shortlisted</SelectItem>
                            <SelectItem value="interview">Interview</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                            <SelectItem value="on-hold">On Hold</SelectItem>
                          </SelectContent>
                        </Select>
                      )}

                      {action.type === 'send_another_followup' && (
                        <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-200">
                          <div className="flex items-start gap-3">
                            <div className="bg-blue-100 p-2 rounded-lg">
                              <Brain className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-sm font-semibold text-blue-900 mb-1">
                                AI Follow-up Questions
                              </h3>
                              <p className="text-xs text-blue-800">
                                Follow-up questions are configured at the <strong>job level</strong>.  
                                The same question template from the job will be used for follow-up rounds.
                              </p>
                              <div className="mt-2 text-xs text-blue-700 bg-blue-100/50 p-2 rounded">
                                <strong>💡 Tip:</strong> Each job has its own AI follow-up template that's reused for additional follow-up rounds.
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <Button onClick={() => removeAction(rule.id, action.id)} variant="ghost" size="sm" className="text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Nested Rules for "Send Another Follow-up" actions */}
          </div>
        ))}

        {scoreRules.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
            <Brain className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600 mb-2">No score rules yet</p>
            <Button onClick={addRule} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add First Rule
            </Button>
          </div>
        )}
      </div>

    </div>
  );
}

