import React from "react";
import { JobTemplatesList } from "@/components/dashboard/job-templates/JobTemplatesList";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/constants";
import { ArrowLeft, Plus, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

const JobTemplatesPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(ROUTES.DASHBOARD.MAIN)}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Job Templates</h1>
                <p className="text-gray-600 mt-1">
                  Create, manage, and use job templates to streamline your hiring process
                </p>
              </div>
            </div>
            
            <Button
              onClick={() => navigate(ROUTES.DASHBOARD.CREATE_JOB)}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 shadow-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Job from Template
            </Button>
          </div>
        </div>

        {/* Templates List */}
        <Card className="rounded-xl border-gray-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900">
              Template Library
            </CardTitle>
            <CardDescription className="text-gray-600">
              Manage your job templates and create new ones from existing jobs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <JobTemplatesList />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JobTemplatesPage;
