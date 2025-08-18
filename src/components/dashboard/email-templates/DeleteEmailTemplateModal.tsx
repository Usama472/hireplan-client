import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import API from "@/http";
import { useToast } from "@/lib/hooks/use-toast";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";

interface DeleteEmailTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeleteSuccess: () => void;
  templateId: string;
  templateName: string;
}

export const DeleteEmailTemplateModal = ({
  isOpen,
  onClose,
  onDeleteSuccess,
  templateId,
  templateName,
}: DeleteEmailTemplateModalProps) => {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!templateId) {
      toast({
        title: "Error",
        description: "Template ID is required",
        type: "error",
      });
      return;
    }

    setIsDeleting(true);

    try {
      await API.emailTemplate.deleteEmailTemplate(templateId);

      toast({
        title: "Template deleted successfully! 🗑️",
        description: `"${templateName}" has been permanently removed.`,
        type: "success",
      });

      onDeleteSuccess();
      onClose();
    } catch (error) {
      console.error("Error deleting template:", error);

      const errorMessage =
        (error as any)?.response?.data?.message ||
        (error as any)?.message ||
        "Failed to delete template. Please try again.";

      toast({
        title: "Delete failed",
        description: errorMessage,
        type: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-red-100 text-red-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">
                Delete Email Template
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                This action cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Trash2 className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-red-800">
                  Are you sure you want to delete this template?
                </p>
                <p className="text-sm text-red-700">
                  <strong>"{templateName}"</strong> will be permanently removed
                  from your system.
                </p>
                <ul className="text-xs text-red-600 space-y-1 ml-4">
                  <li>• All template data will be lost</li>
                  <li>• This action cannot be undone</li>
                  <li>
                    • Any active campaigns using this template may be affected
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Template
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
