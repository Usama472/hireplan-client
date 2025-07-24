import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, Plus } from "lucide-react";
import { ROUTES } from "@/constants";
import { useNavigate } from "react-router-dom";

interface EmptyJobsStateProps {
  onClearFilters: () => void;
  hasFilters: boolean;
}

export function EmptyJobsState({
  onClearFilters,
  hasFilters,
}: EmptyJobsStateProps) {
  const navigate = useNavigate();

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Briefcase className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {hasFilters ? "No jobs found" : "No jobs created yet"}
        </h3>
        <p className="text-gray-600 mb-6">
          {hasFilters
            ? "Try adjusting your filters or search terms"
            : "Create your first job posting to get started"}
        </p>
        {hasFilters ? (
          <Button onClick={onClearFilters}>Clear Filters</Button>
        ) : (
          <Button
            onClick={() => navigate(ROUTES.DASHBOARD.CREATE_JOB)}
            className="mt-4 sm:mt-0 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Job
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
