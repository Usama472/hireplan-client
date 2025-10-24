import { JobTemplatesList } from "@/components/dashboard/job-templates/JobTemplatesList";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ROUTES } from "@/constants";
import { FileText, Plus } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

const JobTemplatesPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 px-3 sm:px-4 lg:px-6 py-2.5 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-base sm:text-xl font-bold text-black">Job Templates</h1>
                <p className="text-black flex items-center gap-2 text-xs">
                  Create, manage, and use job templates
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Create Job Button */}
              <Button
                onClick={() => navigate(ROUTES.DASHBOARD.CREATE_JOB)}
                className="bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-sm hover:shadow-md transition-all duration-300 gap-1.5 px-2.5 h-8 text-xs"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                <span className="hidden sm:inline">Create Job from Template</span>
                <span className="sm:inline">Create Job</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 mt-2">
        {/* Professional Templates List Card */}
        <Card className="rounded-lg border border-gray-200 shadow-sm bg-white">
          <CardHeader className="border-b border-gray-100 px-3 py-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-3.5 w-3.5 text-gray-600" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold text-gray-900">
                    Template Library
                  </CardTitle>
                  <CardDescription className="text-xs text-gray-500 mt-0.5">
                    Manage and organize your job templates
                  </CardDescription>
                </div>
              </div>

              {/* Professional Stats */}
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-base font-semibold text-gray-900">12</div>
                  <div className="text-xs text-gray-500 font-medium">
                    Templates
                  </div>
                </div>
                <div className="h-6 w-px bg-gray-200" />
                <div className="text-right">
                  <div className="text-base font-semibold text-gray-900">8</div>
                  <div className="text-xs text-gray-500 font-medium">
                    Active
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-3">
            <JobTemplatesList />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JobTemplatesPage;
