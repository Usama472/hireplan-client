"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Save,
  Undo2,
} from "lucide-react";

interface SaveChangesBarProps {
  isDirty: boolean;
  isLoading: boolean;
  isSaved: boolean;
  onSubmit: () => void;
  changedFieldsCount?: number;
  onDiscard: () => void;
}

export function SaveChangesBar({
  isDirty,
  isLoading,
  isSaved,
  onSubmit,
  changedFieldsCount = 0,
  onDiscard,
}: SaveChangesBarProps) {
  if (!isDirty && !isSaved) return null;

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out transform",
        isDirty || isSaved ? "translate-y-0" : "translate-y-full"
      )}
    >
      <div className="bg-white border-t shadow-2xl shadow-gray-900/10">
        <div className="container mx-auto px-4 py-4 max-w-5xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Status Indicator */}
              <div className="flex items-center gap-2">
                {isSaved ? (
                  <>
                    <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-700">
                        Changes saved successfully!
                      </p>
                      <p className="text-xs text-green-600">
                        Your profile has been updated
                      </p>
                    </div>
                  </>
                ) : isDirty ? (
                  <>
                    <div className="flex items-center justify-center w-8 h-8 bg-amber-100 rounded-full">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {changedFieldsCount > 0 ? (
                          <>
                            {changedFieldsCount}{" "}
                            {changedFieldsCount === 1 ? "change" : "changes"} to
                            save
                          </>
                        ) : (
                          "You have unsaved changes"
                        )}
                      </p>
                      <p className="text-xs text-gray-600">
                        Save your changes or discard them
                      </p>
                    </div>
                  </>
                ) : null}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {isDirty && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-gray-600 hover:text-gray-800 gap-2"
                    onClick={onDiscard}
                  >
                    <Undo2 className="h-3.5 w-3.5" />
                    Discard Changes
                  </Button>

                  <Button
                    type="button"
                    onClick={onSubmit}
                    // Always enable the button when there are changes
                    disabled={isLoading}
                    className={cn(
                      "min-w-[140px] font-medium shadow-lg transition-all duration-200",
                      isLoading
                        ? "bg-blue-500"
                        : "bg-blue-600 hover:bg-blue-700 hover:shadow-xl"
                    )}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
