import { Button } from "@/components/ui/button";
import { Filter, Plus, Search } from "lucide-react";

interface EmptyAutomationsStateProps {
  onCreateAutomation: () => void;
  onClearFilters?: () => void;
  hasFilters: boolean;
}

export default function EmptyAutomationsState({
  onCreateAutomation,
  onClearFilters,
  hasFilters,
}: EmptyAutomationsStateProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg animate-fadeIn">
      <div className="p-12 text-center">
        <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 animate-scaleIn animate-pulse-indigo">
          {hasFilters ? (
            <Search className="w-10 h-10 text-indigo-400" />
          ) : (
            <Filter className="w-10 h-10 text-indigo-400" />
          )}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          {hasFilters ? "No automations found" : "No automations created yet"}
        </h3>
        <p className="text-gray-600 mb-8 max-w-sm mx-auto">
          {hasFilters
            ? "Try adjusting your filters or search terms to find what you're looking for"
            : "Create your first automation workflow to streamline your recruitment process and save time"}
        </p>
        {hasFilters && onClearFilters ? (
          <Button
            onClick={onClearFilters}
            variant="outline"
            className="border-gray-200 transition-all duration-300 hover:border-indigo-300 hover:scale-105"
          >
            Clear Filters
          </Button>
        ) : (
          <Button
            onClick={onCreateAutomation}
            className="bg-indigo-600 hover:bg-indigo-700 px-6 py-6 h-auto text-base transition-all duration-300 hover:scale-105 hover:shadow-md"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Your First Automation
          </Button>
        )}
      </div>
    </div>
  );
}
