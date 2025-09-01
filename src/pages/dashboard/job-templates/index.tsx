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
      <div className="bg-primary border-b border-primary/20 px-6 py-4 relative overflow-hidden max-h-[80px]">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-bold text-white">Job Templates</h1>
                <p className="text-sm text-white/80 flex items-center gap-3">
                  Create, manage, and use job templates to streamline your
                  hiring process
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Create Job Button */}
              <Button
                onClick={() => navigate(ROUTES.DASHBOARD.CREATE_JOB)}
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 text-white border border-white/20 gap-2 px-5 font-medium backdrop-blur-sm transition-all duration-200 text-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Job from Template
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-5">
        {/* Professional Templates List Card */}
        <Card className="rounded-lg border border-gray-200 shadow-sm bg-white">
          <CardHeader className="border-b border-gray-100 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Template Library
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-500 mt-1">
                    Manage and organize your job templates
                  </CardDescription>
                </div>
              </div>

              {/* Professional Stats */}
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">12</div>
                  <div className="text-xs text-gray-500 font-medium">
                    Templates
                  </div>
                </div>
                <div className="h-8 w-px bg-gray-200" />
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">8</div>
                  <div className="text-xs text-gray-500 font-medium">
                    Active
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <JobTemplatesList />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JobTemplatesPage;
