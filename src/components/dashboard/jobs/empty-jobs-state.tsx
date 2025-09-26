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
    <Card className="border-0 shadow-none bg-gradient-to-br from-gray-50 to-white">
      <CardContent className="p-12 text-center">
        {/* Enhanced Icon with Gradient Background */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full"></div>
          <div className="absolute inset-2 bg-white rounded-full shadow-sm flex items-center justify-center">
            <Briefcase className="w-8 h-8 text-primary" />
          </div>
        </div>
        
        {/* Enhanced Typography */}
        <h3 className="text-xl font-bold text-gray-900 mb-3">
          {hasFilters ? "No jobs found" : "Ready to hire amazing talent?"}
        </h3>
        <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
          {hasFilters
            ? "Try adjusting your filters or search terms to find the jobs you're looking for"
            : "Create your first job posting and start attracting top candidates with HirePlan's powerful tools"}
        </p>
        
        {/* Enhanced Buttons */}
        {hasFilters ? (
          <div className="space-y-3">
            <Button 
              onClick={onClearFilters}
              variant="outline"
              className="border-primary/20 text-primary hover:bg-primary/5"
            >
              Clear Filters
            </Button>
            <p className="text-sm text-gray-500">or try a different search term</p>
          </div>
        ) : (
          <div className="space-y-4">
            <Button
              onClick={() => navigate(ROUTES.DASHBOARD.CREATE_JOB)}
              variant="secondary"
              className="text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Job
            </Button>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
              <span>✨ AI-powered matching</span>
              <span>•</span>
              <span>📊 Advanced analytics</span>
              <span>•</span>
              <span>🚀 Quick setup</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
