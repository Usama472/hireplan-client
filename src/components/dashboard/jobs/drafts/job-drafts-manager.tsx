import { useState, useEffect } from "react";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Clock, 
  FileText,
  Search,
  Filter,
  Eye,
  Copy,
  MoreVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import API from "@/http";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import CollapsibleJobCreator from "../create/collapsible-job-creator";

interface JobDraft {
  id: string;
  title: string;
  description?: string;
  department?: string;
  positionsToHire?: number;
  completedSections: string[];
  lastModified: Date;
  createdAt: Date;
}

export default function JobDraftsManager() {
  const [drafts, setDrafts] = useState<JobDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreator, setShowCreator] = useState(false);
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const [deletingDraftId, setDeletingDraftId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDrafts();
  }, []);

  const fetchDrafts = async () => {
    try {
      const response = await API.jobDraft.getJobDrafts();
      setDrafts(response.results || []);
    } catch (error) {
      console.error('Error fetching drafts:', error);
      toast.error('Failed to load drafts');
    } finally {
      setLoading(false);
    }
  };

  const deleteDraft = async (draftId: string) => {
    try {
      await API.jobDraft.deleteJobDraft(draftId);
      setDrafts(drafts.filter(d => d.id !== draftId));
      toast.success('Draft deleted');
    } catch (error) {
      console.error('Error deleting draft:', error);
      toast.error('Failed to delete draft');
    }
  };

  const duplicateDraft = async (draft: JobDraft) => {
    try {
      const response = await API.jobDraft.createJobDraft({
        title: `${draft.title} (Copy)`,
        formData: draft,
        completedSections: draft.completedSections,
      });
      
      await fetchDrafts();
      toast.success('Draft duplicated');
    } catch (error) {
      console.error('Error duplicating draft:', error);
      toast.error('Failed to duplicate draft');
    }
  };

  const jobSections = [
    { id: "job-ad", title: "Job Details" },
    { id: "position", title: "Position & Company" },
    { id: "qualifications", title: "Qualifications" },
    { id: "schedule", title: "Schedule & Benefits" },
    { id: "posting", title: "Posting & Budget" },
    { id: "ai-overview", title: "AI Overview" },
    { id: "automations", title: "Automations" },
  ];

  const getCompletionPercentage = (completedSections: string[]) => {
    return Math.round((completedSections.length / jobSections.length) * 100);
  };

  const filteredDrafts = drafts.filter(draft =>
    draft.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    draft.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (showCreator) {
    return (
      <CollapsibleJobCreator
        draftId={editingDraftId || undefined}
        onSave={(jobId) => {
          setShowCreator(false);
          setEditingDraftId(null);
          navigate(`/dashboard/jobs/view/${jobId}`);
        }}
        onCancel={() => {
          setShowCreator(false);
          setEditingDraftId(null);
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Drafts</h1>
          <p className="text-gray-600 mt-1">
            Manage your job drafts and continue where you left off
          </p>
        </div>
        <Button
          onClick={() => navigate('/dashboard/jobs/create')}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Job
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search drafts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Badge variant="outline" className="text-sm">
          {filteredDrafts.length} draft{filteredDrafts.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Drafts Grid */}
      {filteredDrafts.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {drafts.length === 0 ? "No drafts yet" : "No drafts found"}
            </h3>
            <p className="text-gray-500 mb-6">
              {drafts.length === 0 
                ? "Create your first job draft to get started"
                : "Try adjusting your search terms"
              }
            </p>
            {drafts.length === 0 && (
              <Button
                onClick={() => navigate('/dashboard/jobs/create')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Job
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredDrafts.map((draft) => (
            <Card key={draft.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {draft.title}
                      </h3>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          getCompletionPercentage(draft.completedSections) >= 80 
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : getCompletionPercentage(draft.completedSections) >= 50
                            ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                            : 'bg-gray-50 text-gray-700 border-gray-200'
                        }`}
                      >
                        {getCompletionPercentage(draft.completedSections)}% complete
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      {draft.department && (
                        <span>{draft.department}</span>
                      )}
                      {draft.positionsToHire && (
                        <>
                          <span>•</span>
                          <span>{draft.positionsToHire} position{draft.positionsToHire !== 1 ? 's' : ''}</span>
                        </>
                      )}
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Modified {new Date(draft.lastModified).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {draft.completedSections.length}/{jobSections.length} sections completed
                      </span>
                      <div className="flex-1 h-1 bg-gray-200 rounded-full max-w-32">
                        <div 
                          className="h-full bg-primary rounded-full transition-all duration-300"
                          style={{ width: `${getCompletionPercentage(draft.completedSections)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingDraftId(draft.id);
                        setShowCreator(true);
                      }}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => duplicateDraft(draft)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => setDeletingDraftId(draft.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingDraftId} onOpenChange={() => setDeletingDraftId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Draft</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this draft? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingDraftId) {
                  deleteDraft(deletingDraftId);
                  setDeletingDraftId(null);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
