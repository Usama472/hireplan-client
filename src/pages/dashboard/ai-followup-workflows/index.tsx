import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Plus, Settings, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import API from '@/http';

export default function AIFollowupWorkflowsPage() {
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      setIsLoading(true);
      const response = await API.automation.getAll();
      // Filter for AI follow-up workflows
      const aiWorkflows = response.data.filter((auto: any) => 
        auto.trigger === 'ai_followup_response_received'
      );
      setWorkflows(aiWorkflows);
    } catch (error) {
      console.error('Failed to fetch AI workflows:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (workflowId: string, currentStatus: boolean) => {
    try {
      await API.automation.update(workflowId, { active: !currentStatus });
      toast.success(`Workflow ${!currentStatus ? 'activated' : 'deactivated'}`);
      fetchWorkflows();
    } catch (error) {
      toast.error('Failed to update workflow');
    }
  };

  const handleDelete = async (workflowId: string) => {
    if (!confirm('Delete this AI follow-up workflow?')) return;
    
    try {
      await API.automation.delete(workflowId);
      toast.success('Workflow deleted');
      fetchWorkflows();
    } catch (error) {
      toast.error('Failed to delete workflow');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-100 rounded-xl">
            <Brain className="w-8 h-8 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI Follow-up Workflows</h1>
            <p className="text-gray-600 mt-1">
              Automatically trigger actions based on AI follow-up question scores
            </p>
          </div>
        </div>
        <Button 
          onClick={() => navigate('/dashboard/ai-followup-workflows/create')}
          className="bg-gradient-to-r from-blue-600 to-purple-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Workflow
        </Button>
      </div>

      {/* Workflows List */}
      {isLoading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600">Loading workflows...</p>
          </CardContent>
        </Card>
      ) : workflows.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-12 text-center">
            <Brain className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No AI Follow-up Workflows
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first workflow to automate actions based on AI follow-up scores
            </p>
            <Button 
              onClick={() => navigate('/dashboard/ai-followup-workflows/create')}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Workflow
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {workflows.map((workflow) => (
            <Card key={workflow._id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-purple-600" />
                      {workflow.name}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {workflow.chainedActions?.length || 0} chained actions based on scores
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggle(workflow._id, workflow.active)}
                      className={workflow.active ? 'text-green-600' : 'text-gray-400'}
                    >
                      {workflow.active ? (
                        <>
                          <ToggleRight className="w-5 h-5 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-5 h-5 mr-1" />
                          Inactive
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/dashboard/ai-followup-workflows/edit/${workflow._id}`)}
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(workflow._id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {workflow.chainedActions?.map((action: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg text-sm">
                      <div className="font-mono bg-blue-600 text-white w-6 h-6 rounded flex items-center justify-center text-xs">
                        {idx + 1}
                      </div>
                      <p className="text-gray-700">
                        <strong>If score {action.scoreCondition} {action.scoreThreshold}%:</strong> {action.type.replace(/_/g, ' ')}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

