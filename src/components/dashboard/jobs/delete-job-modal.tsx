"use client";

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
import { Badge } from "@/components/ui/badge";
import type { JobFormDataWithId } from "@/interfaces";
import { AlertTriangle, MapPin, Users } from "lucide-react";

interface DeleteJobModalProps {
  job: JobFormDataWithId | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (job: JobFormDataWithId) => void;
  isDeleting?: boolean;
}

export function DeleteJobModal({
  job,
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false,
}: DeleteJobModalProps) {
  if (!job) return null;

  const location = job.jobLocation
    ? `${job.jobLocation.city}, ${job.jobLocation.state}`
    : "Location not specified";

  const status = job.status
    ? job.status.charAt(0).toUpperCase() + job.status.slice(1)
    : "";

  const employmentType = job.employmentType
    ? job.employmentType
        .replace("-", " ")
        .replace(/\b\w/g, (l: string) => l.toUpperCase())
    : "";

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <AlertDialogTitle className="text-lg font-semibold text-gray-900">
                Delete Job Posting
              </AlertDialogTitle>
            </div>
          </div>
          <AlertDialogDescription className="text-sm text-gray-600 mb-4">
            This action cannot be undone. This will permanently delete the job
            posting and remove all associated data.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Job Details Preview */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-gray-900 mb-1">
                {job.jobTitle || job.jobBoardTitle}
              </h4>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{location}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {status}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {employmentType}
                </Badge>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Users className="w-4 h-4 mr-1" />
                <span>{job.applicantsCount || 0} applicants</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Warning</p>
              <p>
                {job.applicantsCount && job.applicantsCount > 0
                  ? `This job has ${job.applicantsCount} applicant${
                      job.applicantsCount > 1 ? "s" : ""
                    }. Deleting it will also remove all application data.`
                  : "All job data and settings will be permanently removed."}
              </p>
            </div>
          </div>
        </div>

        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel disabled={isDeleting} className="flex-1">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onConfirm(job)}
            disabled={isDeleting}
            className="flex-1 bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isDeleting ? "Deleting..." : "Delete Job"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
