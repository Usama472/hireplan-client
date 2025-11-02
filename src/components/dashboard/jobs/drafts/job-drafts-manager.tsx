import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Clock,
  FileText,
  Search,
  Copy,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import CreateJob from "../create";

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
      console.error("Error fetching drafts:", error);
      toast.error("Failed to load drafts");
    } finally {
      setLoading(false);
    }
  };

  const deleteDraft = async (draftId: string) => {
    try {
      await API.jobDraft.deleteJobDraft(draftId);
      setDrafts(drafts.filter((d) => d.id !== draftId));
      toast.success("Draft deleted");
    } catch (error) {
      console.error("Error deleting draft:", error);
      toast.error("Failed to delete draft");
    }
  };

  const duplicateDraft = async (draft: JobDraft) => {
    try {
      await API.jobDraft.createJobDraft({
        title: `${draft.title} (Copy)`,
        formData: draft,
        completedSections: draft.completedSections,
      });

      await fetchDrafts();
      toast.success("Draft duplicated");
    } catch (error) {
      console.error("Error duplicating draft:", error);
      toast.error("Failed to duplicate draft");
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

  const filteredDrafts = drafts.filter(
    (draft) =>
      draft.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      draft.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (showCreator && editingDraftId) {
    return (
      <CreateJob
        draftId={editingDraftId}
        onJobCreated={(jobId) => {
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
      <div className="min-h-screen bg-gray-50">
        <div className="w-full max-w-none">
          {/* Mobile Loading Header */}
          <div className="block lg:hidden bg-white border-b border-gray-200 px-4 py-3">
            <div className="animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
                <div>
                  <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Loading Header */}
          <div className="hidden lg:block bg-white border-b border-gray-200 px-6 py-4">
            <div className="animate-pulse max-w-6xl mx-auto">
              <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-96"></div>
            </div>
          </div>

          <div className="px-4 lg:px-6 py-4 lg:py-6">
            <div className="max-w-6xl mx-auto">
              <div className="animate-pulse space-y-4">
                {/* Mobile: Loading Cards */}
                <div className="block sm:hidden space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="bg-white rounded-2xl border border-gray-100 p-4"
                    >
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop: Loading Grid */}
                <div className="hidden sm:block">
                  <div className="grid gap-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-32 bg-gray-200 rounded-lg"
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full max-w-none">
        {/* Mobile Header */}
        <div className="block lg:hidden bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">
                    Job Drafts
                  </h1>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {filteredDrafts.length} drafts
                  </p>
                </div>
              </div>
              <Button
                onClick={() => navigate("/dashboard/jobs/create")}
                size="sm"
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl px-3 py-2 font-medium"
              >
                <Plus className="h-4 w-4 mr-1" />
                Create
              </Button>
            </div>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Job Drafts</h1>
                <p className="text-gray-600 mt-1">
                  Manage your job drafts and continue where you left off
                </p>
              </div>
              <Button
                onClick={() => navigate("/dashboard/jobs/create")}
                variant="secondary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Job
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="block lg:hidden px-4 py-3 bg-white border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search drafts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm rounded-xl"
              />
            </div>
            <div className="px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-sm font-medium">
              {filteredDrafts.length}
            </div>
          </div>
        </div>

        {/* Desktop Search */}
        <div className="hidden lg:block px-6 py-4 bg-gray-50">
          <div className="max-w-6xl mx-auto">
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
                {filteredDrafts.length} draft
                {filteredDrafts.length !== 1 ? "s" : ""}
              </Badge>
            </div>
          </div>
        </div>

        <div className="px-4 lg:px-6 py-4 lg:py-6">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Empty State */}
            {filteredDrafts.length === 0 ? (
              <>
                {/* Mobile Empty State */}
                <div className="block sm:hidden text-center p-6 bg-white rounded-2xl border border-gray-100">
                  <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-4">
                    <FileText className="h-8 w-8 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {drafts.length === 0 ? "No drafts yet" : "No drafts found"}
                  </h3>
                  <p className="text-gray-600 text-sm mb-6">
                    {drafts.length === 0
                      ? "Create your first job draft to get started"
                      : "Try adjusting your search terms"}
                  </p>
                  {drafts.length === 0 && (
                    <Button
                      onClick={() => navigate("/dashboard/jobs/create")}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl py-3"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Job
                    </Button>
                  )}
                </div>

                {/* Desktop Empty State */}
                <Card className="hidden sm:block">
                  <CardContent className="p-12 text-center">
                    <div className="p-4 bg-blue-100 rounded-full w-fit mx-auto mb-6">
                      <FileText className="h-12 w-12 text-blue-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {drafts.length === 0
                        ? "No drafts yet"
                        : "No drafts found"}
                    </h3>
                    <p className="text-gray-500 mb-6">
                      {drafts.length === 0
                        ? "Create your first job draft to get started"
                        : "Try adjusting your search terms"}
                    </p>
                    {drafts.length === 0 && (
                      <Button
                        onClick={() => navigate("/dashboard/jobs/create")}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create First Job
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <>
                {/* Mobile: Flowing Draft Cards */}
                <div className="block sm:hidden space-y-4">
                  {filteredDrafts.map((draft) => (
                    <div
                      key={draft.id}
                      className="relative overflow-hidden bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300"
                    >
                      {/* Progress accent bar */}
                      <div
                        className={`absolute top-0 left-0 right-0 h-1 ${
                          getCompletionPercentage(draft.completedSections) >= 80
                            ? "bg-gradient-to-r from-green-400 to-green-600"
                            : getCompletionPercentage(
                                draft.completedSections
                              ) >= 50
                            ? "bg-gradient-to-r from-yellow-400 to-yellow-600"
                            : "bg-gradient-to-r from-blue-400 to-blue-600"
                        }`}
                      />

                      <div className="p-4">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <FileText className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 text-base truncate">
                                {draft.title}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                <div
                                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                    getCompletionPercentage(
                                      draft.completedSections
                                    ) >= 80
                                      ? "bg-green-100 text-green-700"
                                      : getCompletionPercentage(
                                          draft.completedSections
                                        ) >= 50
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-gray-100 text-gray-700"
                                  }`}
                                >
                                  {getCompletionPercentage(
                                    draft.completedSections
                                  )}
                                  % complete
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          {draft.department && (
                            <div className="bg-purple-50 rounded-lg p-2.5">
                              <p className="text-xs text-purple-600 font-medium mb-1">
                                Department
                              </p>
                              <p className="text-sm font-semibold text-purple-900 truncate">
                                {draft.department}
                              </p>
                            </div>
                          )}
                          {draft.positionsToHire && (
                            <div className="bg-green-50 rounded-lg p-2.5">
                              <p className="text-xs text-green-600 font-medium mb-1">
                                Positions
                              </p>
                              <p className="text-sm font-semibold text-green-900">
                                {draft.positionsToHire}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Progress Section */}
                        <div className="bg-gray-50 rounded-xl p-3 mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-600 font-medium">
                              Progress: {draft.completedSections.length}/
                              {jobSections.length} sections
                            </span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 rounded-full">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                getCompletionPercentage(
                                  draft.completedSections
                                ) >= 80
                                  ? "bg-gradient-to-r from-green-400 to-green-600"
                                  : getCompletionPercentage(
                                      draft.completedSections
                                    ) >= 50
                                  ? "bg-gradient-to-r from-yellow-400 to-yellow-600"
                                  : "bg-gradient-to-r from-blue-400 to-blue-600"
                              }`}
                              style={{
                                width: `${getCompletionPercentage(
                                  draft.completedSections
                                )}%`,
                              }}
                            />
                          </div>
                        </div>

                        {/* Footer with actions */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            <span>
                              Modified{" "}
                              {new Date(
                                draft.lastModified
                              ).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingDraftId(draft.id);
                                setShowCreator(true);
                              }}
                              className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 rounded-lg px-3 py-1.5 text-xs"
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => duplicateDraft(draft)}
                                >
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
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop: Traditional Cards */}
                <div className="hidden sm:block">
                  <div className="grid gap-4">
                    {filteredDrafts.map((draft) => (
                      <Card
                        key={draft.id}
                        className="hover:shadow-md transition-shadow"
                      >
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
                                    getCompletionPercentage(
                                      draft.completedSections
                                    ) >= 80
                                      ? "bg-green-50 text-green-700 border-green-200"
                                      : getCompletionPercentage(
                                          draft.completedSections
                                        ) >= 50
                                      ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                      : "bg-gray-50 text-gray-700 border-gray-200"
                                  }`}
                                >
                                  {getCompletionPercentage(
                                    draft.completedSections
                                  )}
                                  % complete
                                </Badge>
                              </div>

                              <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                                {draft.department && (
                                  <span>{draft.department}</span>
                                )}
                                {draft.positionsToHire && (
                                  <>
                                    <span>•</span>
                                    <span>
                                      {draft.positionsToHire} position
                                      {draft.positionsToHire !== 1 ? "s" : ""}
                                    </span>
                                  </>
                                )}
                                <span>•</span>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>
                                    Modified{" "}
                                    {new Date(
                                      draft.lastModified
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">
                                  {draft.completedSections.length}/
                                  {jobSections.length} sections completed
                                </span>
                                <div className="flex-1 h-1 bg-gray-200 rounded-full max-w-32">
                                  <div
                                    className="h-full bg-primary rounded-full transition-all duration-300"
                                    style={{
                                      width: `${getCompletionPercentage(
                                        draft.completedSections
                                      )}%`,
                                    }}
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
                                  <DropdownMenuItem
                                    onClick={() => duplicateDraft(draft)}
                                  >
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
                </div>
              </>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog
              open={!!deletingDraftId}
              onOpenChange={() => setDeletingDraftId(null)}
            >
              <AlertDialogContent className="mx-4 rounded-2xl sm:rounded-lg">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Draft</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this draft? This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                  <AlertDialogAction
                    onClick={() => {
                      if (deletingDraftId) {
                        deleteDraft(deletingDraftId);
                        setDeletingDraftId(null);
                      }
                    }}
                    className="w-full sm:w-auto order-1 sm:order-2 bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </AlertDialogAction>
                  <AlertDialogCancel className="w-full sm:w-auto order-2 sm:order-1">
                    Cancel
                  </AlertDialogCancel>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
}
