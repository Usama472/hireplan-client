import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Plus, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface AITemplate {
  id: string;
  name: string;
  questions: Array<{
    text: string;
    scoringCriteria?: string;
  }>;
  // Auto-reject toggle only (thresholds configured in automation)
  autoRejectEnabled: boolean;
}

import { useAITemplates } from '@/hooks/useAITemplates';

export function AITemplatesList() {
  const { templates, saveTemplate, deleteTemplate } = useAITemplates();

  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState({ 
    name: '', 
    autoRejectEnabled: false,
    questions: [
      { text: '', scoringCriteria: '' },
      { text: '', scoringCriteria: '' },
      { text: '', scoringCriteria: '' },
      { text: '', scoringCriteria: '' },
      { text: '', scoringCriteria: '' },
    ]
  });

  const handleSave = () => {
    const valid = form.questions.filter(q => q.text.trim());
    if (!form.name || valid.length === 0) {
      toast.error('Name and questions required');
      return;
    }
    saveTemplate({ 
      name: form.name, 
      questions: valid,
      autoRejectEnabled: form.autoRejectEnabled,
    });
    setForm({ 
      name: '', 
      autoRejectEnabled: false,
      questions: [
        { text: '', scoringCriteria: '' },
        { text: '', scoringCriteria: '' },
        { text: '', scoringCriteria: '' },
        { text: '', scoringCriteria: '' },
        { text: '', scoringCriteria: '' },
      ]
    });
    setShowDialog(false);
    toast.success('Template created!');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <p className="text-sm text-gray-600">Reusable question sets for AI follow-ups</p>
        <Button onClick={() => setShowDialog(true)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          New Template
        </Button>
      </div>

      {templates.map((t) => (
        <Card key={t.id}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-purple-600" />
                  <h3 className="font-semibold">{t.name}</h3>
                  <Badge variant="outline" className="text-xs">{t.questions.length}</Badge>
                </div>
                {t.questions.map((q, i) => (
                  <div key={i} className="text-sm mb-2">
                    <div className="text-gray-900">{i + 1}. {q.text}</div>
                    {q.scoringCriteria && (
                      <div className="text-xs text-purple-600 ml-4 mt-0.5">✓ {q.scoringCriteria}</div>
                    )}
                  </div>
                ))}
              </div>
              <Button variant="ghost" size="sm" onClick={() => deleteTemplate(t.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create AI Template</DialogTitle>
            <DialogDescription>Set of questions for AI follow-ups</DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div>
              <Label className="text-sm">Template Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., Technical Assessment" className="mt-1" />
            </div>

            {/* Auto-Reject Settings */}
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-semibold">Enable Auto-Reject</Label>
                  <p className="text-xs text-gray-600">Reject candidates with low scores</p>
                </div>
                <input
                  type="checkbox"
                  checked={form.autoRejectEnabled}
                  onChange={(e) => setForm({ ...form, autoRejectEnabled: e.target.checked })}
                  className="w-4 h-4"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm">Questions (up to 5)</Label>
              {form.questions.map((q, i) => (
                <div key={i} className="space-y-1.5">
                  <label className="text-xs text-gray-700 block">Question {i + 1}</label>
                  <Input
                    value={q.text}
                    onChange={(e) => {
                      const updated = [...form.questions];
                      updated[i] = { ...updated[i], text: e.target.value };
                      setForm({ ...form, questions: updated });
                    }}
                    placeholder={`Enter question...`}
                  />
                  <Input
                    value={q.scoringCriteria}
                    onChange={(e) => {
                      const updated = [...form.questions];
                      updated[i] = { ...updated[i], scoringCriteria: e.target.value };
                      setForm({ ...form, questions: updated });
                    }}
                    placeholder="What makes a good answer? (optional)"
                    className="text-xs"
                  />
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSave}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
