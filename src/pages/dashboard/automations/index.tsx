import AutomationPreview from "@/components/dashboard/automations/automation-preview";
import AutomationsList from "@/components/dashboard/automations/automations-list";
import EmptyAutomationsState from "@/components/dashboard/automations/empty-automations-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { AutomationType } from "@/interfaces/automations";
import { useToast } from "@/lib/hooks/use-toast";
import { Filter, HelpCircle, Plus, Search } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

// Temporary mock data for development
const mockAutomations: AutomationType[] = [
  {
    id: "1",
    name: "Send rejection email after 10 days",
    description:
      "Automatically sends a rejection email 10 days after an application is rejected",
    trigger: {
      type: "application_status_changed",
      config: {
        from: null,
        to: "rejected",
      },
    },
    conditions: [
      {
        field: "resumeScore",
        operator: "<",
        value: "50",
      },
    ],
    actions: [
      {
        type: "send_email",
        config: {
          templateId: "rejection-standard",
          delay: {
            value: 10,
            unit: "days",
          },
          timezone: "Asia/Karachi",
        },
      },
    ],
    enabled: true,
    lastRunAt: "2023-10-15T14:30:00Z",
    nextRunAt: "2023-10-25T14:30:00Z",
    createdAt: "2023-10-15T14:30:00Z",
    updatedAt: "2023-10-15T14:30:00Z",
  },
  {
    id: "2",
    name: "Send follow-up to qualified candidates",
    description:
      "Sends a follow-up email to candidates with high resume scores",
    trigger: {
      type: "resume_score_updated",
      config: {},
    },
    conditions: [
      {
        field: "resumeScore",
        operator: ">",
        value: "75",
      },
    ],
    actions: [
      {
        type: "send_email",
        config: {
          templateId: "qualified-followup",
          delay: {
            value: 1,
            unit: "days",
          },
          timezone: "America/New_York",
        },
      },
    ],
    enabled: true,
    lastRunAt: "2023-10-18T09:45:00Z",
    nextRunAt: "2023-10-19T09:45:00Z",
    createdAt: "2023-10-10T11:20:00Z",
    updatedAt: "2023-10-10T11:20:00Z",
  },
];

export default function AutomationsDashboard() {
  const [automations, setAutomations] =
    useState<AutomationType[]>(mockAutomations);
  const [selectedAutomation, setSelectedAutomation] =
    useState<AutomationType | null>(
      automations.length > 0 ? automations[0] : null
    );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();
  const [isLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  // Filter automations based on search and status
  const filteredAutomations = useMemo(() => {
    return automations.filter((automation) => {
      // Filter by search query
      const matchesSearch =
        automation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        automation.description
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      // Filter by status
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "enabled" && automation.enabled) ||
        (statusFilter === "disabled" && !automation.enabled);

      return matchesSearch && matchesStatus;
    });
  }, [automations, searchQuery, statusFilter]);

  // Handlers
  const handleSelectAutomation = (automation: AutomationType) => {
    setSelectedAutomation(automation);
  };

  const handleCreateAutomation = useCallback(() => {
    navigate("/dashboard/automations/create");
  }, [navigate]);

  const handleEditAutomation = useCallback(
    (id: string) => {
      navigate(`/dashboard/automations/edit/${id}`);
    },
    [navigate]
  );

  const handleEnableToggle = (id: string, enabled: boolean) => {
    setAutomations((prev) =>
      prev.map((automation) =>
        automation.id === id ? { ...automation, enabled } : automation
      )
    );

    toast({
      title: enabled ? "Automation enabled" : "Automation disabled",
      description: `"${automations.find((a) => a.id === id)?.name}" has been ${
        enabled ? "enabled" : "disabled"
      }.`,
      type: "success",
    });
  };

  const handleDeleteAutomation = (id: string) => {
    setAutomations((prev) => prev.filter((automation) => automation.id !== id));

    if (selectedAutomation?.id === id) {
      setSelectedAutomation(automations.length > 0 ? automations[0] : null);
    }

    toast({
      title: "Automation deleted",
      description: "The automation has been deleted successfully.",
      type: "success",
    });
  };

  const hasAutomations = filteredAutomations.length > 0;
  const hasFilters = searchQuery !== "" || statusFilter !== "all";

  return (
    <div className="min-h-full">
      <div className="space-y-6">
        {/* Enhanced Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 relative overflow-hidden max-h-[80px]">
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-100 rounded-xl">
                  <Filter className="h-6 w-6 text-gray-600" />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-2xl font-bold text-gray-900">
                    Automations
                  </h1>
                  <p className="text-gray-600 flex items-center gap-2">
                    Create and manage recruitment workflow automations
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Button
                  onClick={handleCreateAutomation}
                  className="bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-lg hover:shadow-xl hover:shadow-blue-600/25 transition-all duration-300 gap-2 px-5 font-medium"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Automation
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 max-w-[98%] mx-auto">
          {/* Main Content with wider layout */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 animate-slideIn">
            {/* Left Column: Automations List - narrower */}
            <div className="lg:col-span-1">
              <div className="space-y-5">
                {/* Controls */}
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    All Automations
                  </h2>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-primary/10 hover:text-primary transition-colors duration-200"
                      >
                        <HelpCircle className="h-5 w-5 text-gray-500" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-80 text-sm">
                        Automations help you streamline your recruitment process
                        by automating repetitive tasks. Create rules to trigger
                        actions based on specific events and conditions.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                {/* Search & Filter with improved styling */}
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search automations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 border-gray-200 focus:ring-primary transition-all duration-200"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-36 border-gray-200 focus:ring-primary transition-all duration-200">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="enabled">Enabled</SelectItem>
                      <SelectItem value="disabled">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Automations List Component */}
                {isLoading ? (
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : hasAutomations ? (
                  <div className="overflow-auto max-h-[calc(100vh-220px)]">
                    <AutomationsList
                      automations={filteredAutomations}
                      selectedId={selectedAutomation?.id}
                      onSelect={handleSelectAutomation}
                      onEnableToggle={handleEnableToggle}
                      onEdit={handleEditAutomation}
                      onDelete={handleDeleteAutomation}
                    />
                  </div>
                ) : (
                  <EmptyAutomationsState
                    onCreateAutomation={handleCreateAutomation}
                    hasFilters={hasFilters}
                    onClearFilters={() => {
                      setSearchQuery("");
                      setStatusFilter("all");
                    }}
                  />
                )}
              </div>
            </div>

            {/* Right Column: Automation Preview - wider */}
            <div className="lg:col-span-4">
              {selectedAutomation && (
                <AutomationPreview
                  automation={selectedAutomation}
                  onEdit={() => handleEditAutomation(selectedAutomation.id)}
                  onEnableToggle={(enabled) =>
                    handleEnableToggle(selectedAutomation.id, enabled)
                  }
                  onDelete={() => handleDeleteAutomation(selectedAutomation.id)}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
