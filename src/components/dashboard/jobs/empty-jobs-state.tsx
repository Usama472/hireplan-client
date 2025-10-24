import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants";
import { Briefcase, Plus, Search, FileText, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface EmptyJobsStateProps {
  onClearFilters?: () => void;
  hasFilters?: boolean;
}

export function EmptyJobsState({
  onClearFilters,
  hasFilters,
}: EmptyJobsStateProps) {
  const navigate = useNavigate();

  if (hasFilters) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="p-3 bg-gray-100 rounded-xl mb-4">
          <Search className="h-8 w-8 text-gray-400" />
        </div>
        
        <h3 className="text-lg font-bold text-gray-900 mb-1.5">
          No jobs match your search
        </h3>
        <p className="text-gray-600 mb-5 text-center max-w-md text-sm">
          Try adjusting your filters or search criteria.
        </p>
        
        <Button
          onClick={onClearFilters}
          variant="outline"
          size="sm"
          className="border-gray-300"
        >
          <Search className="w-4 h-4 mr-2" />
          Clear filters
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="p-4 bg-primary rounded-xl shadow-sm mb-5">
        <Briefcase className="h-10 w-10 text-white" />
      </div>
      
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        No jobs posted yet
      </h3>
      <p className="text-gray-600 mb-6 text-center max-w-md text-sm">
        Create your first job posting and start attracting talented candidates.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-2.5">
        <Button
          onClick={() => navigate(ROUTES.DASHBOARD.CREATE_JOB)}
          className="bg-primary hover:bg-primary/90"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create your first job
        </Button>
        
        <Button
          onClick={() => navigate(ROUTES.DASHBOARD.JOB_TEMPLATES)}
          variant="outline"
          size="sm"
          className="border-gray-300"
        >
          <FileText className="w-4 h-4 mr-2" />
          Browse templates
        </Button>
      </div>
      
      {/* Compact Feature highlights */}
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl">
        <div className="text-center p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200">
          <div className="w-8 h-8 bg-blue-50 rounded-md flex items-center justify-center mx-auto mb-2">
            <Briefcase className="w-4 h-4 text-blue-600" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-1 text-xs">Quick Setup</h4>
          <p className="text-xs text-gray-600">
            Professional postings in minutes
          </p>
        </div>
        
        <div className="text-center p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200">
          <div className="w-8 h-8 bg-purple-50 rounded-md flex items-center justify-center mx-auto mb-2">
            <Zap className="w-4 h-4 text-purple-600" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-1 text-xs">AI-Powered</h4>
          <p className="text-xs text-gray-600">
            Smart matching & automation
          </p>
        </div>
        
        <div className="text-center p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200">
          <div className="w-8 h-8 bg-emerald-50 rounded-md flex items-center justify-center mx-auto mb-2">
            <Search className="w-4 h-4 text-emerald-600" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-1 text-xs">Wide Reach</h4>
          <p className="text-xs text-gray-600">
            Maximum candidate visibility
          </p>
        </div>
      </div>
    </div>
  );
}
