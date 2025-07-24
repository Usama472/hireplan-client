"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import type { Job } from "@/interfaces";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  DollarSign,
  Edit,
  Eye,
  GraduationCap,
  MapPin,
  Trash2,
  TrendingUp,
  Users,
  Briefcase,
  CheckCircle,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { DeleteJobModal } from "@/components/dashboard/jobs/delete-job-modal";

// Mock data for demonstration - in real app, this would come from API
const mockJobData: Job & {
  company: string;
  companyLogo?: string;
  companyWebsite?: string;
  companyEmail?: string;
  companyPhone?: string;
  benefits?: string[];
  requirements?: string[];
  responsibilities?: string[];
  applicationDeadline?: string;
  postedDate: string;
  lastUpdated: string;
} = {
  id: "1",
  jobTitle: "Senior Frontend Developer",
  jobBoardTitle: "Senior Frontend Developer - React/Next.js",
  status: "active",
  jobStatus: "high",
  workplaceType: "remote",
  company: "TechCorp Inc.",
  companyWebsite: "https://techcorp.com",
  companyEmail: "hr@techcorp.com",
  companyPhone: "+1 (555) 123-4567",
  payType: "salary",
  employmentType: "full-time",
  positionsToHire: 2,
  educationRequirement: "bachelors-degree",
  jobDescription: `We are looking for an experienced Frontend Developer to join our dynamic team. You will be responsible for building modern, responsive web applications using React, Next.js, and TypeScript.

Key Responsibilities:
• Develop and maintain high-quality frontend applications
• Collaborate with designers and backend developers
• Implement responsive designs and ensure cross-browser compatibility
• Optimize applications for maximum speed and scalability
• Participate in code reviews and maintain coding standards

What We Offer:
• Competitive salary and equity package
• Comprehensive health, dental, and vision insurance
• Flexible work arrangements and remote-first culture
• Professional development opportunities
• Modern tech stack and tools`,
  requirements: [
    "5+ years of experience with React and modern JavaScript",
    "Strong proficiency in TypeScript and Next.js",
    "Experience with state management (Redux, Zustand, etc.)",
    "Knowledge of CSS frameworks (Tailwind CSS preferred)",
    "Experience with testing frameworks (Jest, Cypress)",
    "Understanding of web performance optimization",
    "Bachelor's degree in Computer Science or related field",
  ],
  responsibilities: [
    "Build and maintain responsive web applications",
    "Collaborate with cross-functional teams",
    "Write clean, maintainable, and well-documented code",
    "Participate in agile development processes",
    "Mentor junior developers",
    "Stay up-to-date with latest frontend technologies",
  ],
  benefits: [
    "Health, Dental & Vision Insurance",
    "401(k) with company matching",
    "Unlimited PTO policy",
    "Remote work flexibility",
    "Professional development budget",
    "Latest MacBook Pro and equipment",
    "Team building events and retreats",
  ],
  applicants: 47,
  views: 324,
  createdAt: "2024-01-15T10:00:00Z",
  postedDate: "2024-01-15T10:00:00Z",
  lastUpdated: "2024-01-20T14:30:00Z",
  endDate: "2024-02-15T23:59:59Z",
  applicationDeadline: "2024-02-15T23:59:59Z",
};

// Mock applications data
const mockApplications = [
  {
    id: "1",
    candidateName: "John Smith",
    email: "john.smith@email.com",
    status: "pending",
    appliedDate: "2024-01-20T10:00:00Z",
    experience: "5 years",
    location: "San Francisco, CA",
  },
  {
    id: "2",
    candidateName: "Sarah Johnson",
    email: "sarah.j@email.com",
    status: "reviewed",
    appliedDate: "2024-01-19T15:30:00Z",
    experience: "7 years",
    location: "Remote",
  },
  {
    id: "3",
    candidateName: "Mike Chen",
    email: "mike.chen@email.com",
    status: "interviewed",
    appliedDate: "2024-01-18T09:15:00Z",
    experience: "6 years",
    location: "New York, NY",
  },
];

const formatSalary = (job: typeof mockJobData) => {
  if (job.payRate?.amount) {
    const amount = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(job.payRate.amount);
    return `${amount}${job.payType === "hourly" ? "/hr" : "/year"}`;
  }
  return "Salary not specified";
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const getDaysUntilDeadline = (endDate: string) => {
  const today = new Date();
  const deadline = new Date(endDate);
  const diffTime = deadline.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "active":
      return "bg-green-100 text-green-800 border-green-200";
    case "draft":
      return "bg-gray-100 text-gray-800 border-gray-200";
    case "paused":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "closed":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority?.toLowerCase()) {
    case "high":
      return "bg-red-100 text-red-800 border-red-200";
    case "medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "low":
      return "bg-green-100 text-green-800 border-green-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getApplicationStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "reviewed":
      return "bg-blue-100 text-blue-800";
    case "interviewed":
      return "bg-purple-100 text-purple-800";
    case "hired":
      return "bg-green-100 text-green-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // In real app, fetch job data based on ID
  const job = mockJobData;
  const applications = mockApplications;

  const salary = formatSalary(job);
  const daysLeft = job.endDate ? getDaysUntilDeadline(job.endDate) : null;
  const applicationRate = ((job.applicants || 0) / (job.views || 1)) * 100;

  const handleEdit = () => {
    navigate(`/dashboard/jobs/${id}/edit`);
  };

  const handleDelete = async (jobToDelete: Job) => {
    setIsDeleting(true);
    try {
      // API call to delete job
      console.log("Deleting job:", jobToDelete.id);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      navigate("/dashboard/jobs");
    } catch (error) {
      console.error("Error deleting job:", error);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pt-6 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard/jobs")}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Jobs
            </Button>
          </div>

          {/* Header Section */}
          <div className="bg-white rounded-lg shadow-sm border mb-8">
            <div className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div className="flex-1">
                  {/* Status and Priority Badges */}
                  <div className="flex items-center gap-2 mb-4">
                    <Badge
                      className={cn(
                        "text-sm font-medium",
                        getStatusColor(job.status)
                      )}
                    >
                      {job.status?.charAt(0).toUpperCase() +
                        job.status?.slice(1)}
                    </Badge>
                    {job.jobStatus && (
                      <Badge
                        className={cn(
                          "text-sm font-medium",
                          getPriorityColor(job.jobStatus)
                        )}
                      >
                        {job.jobStatus.charAt(0).toUpperCase() +
                          job.jobStatus.slice(1)}{" "}
                        Priority
                      </Badge>
                    )}
                    {daysLeft !== null && (
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-sm",
                          daysLeft <= 7 &&
                            daysLeft > 0 &&
                            "border-orange-300 text-orange-700",
                          daysLeft <= 0 && "border-red-300 text-red-700"
                        )}
                      >
                        <Clock className="w-3 h-3 mr-1" />
                        {daysLeft > 0
                          ? `${daysLeft} days left`
                          : daysLeft === 0
                          ? "Expires today"
                          : "Expired"}
                      </Badge>
                    )}
                  </div>

                  {/* Job Title and Company */}
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {job.jobTitle}
                  </h1>
                  <div className="flex items-center gap-6 text-lg text-gray-600 mb-4">
                    <div className="flex items-center">
                      <Building2 className="w-5 h-5 mr-2" />
                      <span className="font-medium">{job.company}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 mr-2" />
                      <span>
                        {job.jobLocation
                          ? `${job.jobLocation.city}, ${job.jobLocation.state}`
                          : "Remote"}
                      </span>
                    </div>
                    <div className="flex items-center text-green-600 font-semibold">
                      <DollarSign className="w-5 h-5 mr-2" />
                      <span>{salary}</span>
                    </div>
                  </div>

                  {/* Job Details */}
                  <div className="flex flex-wrap items-center gap-4">
                    <Badge variant="outline" className="text-sm">
                      {job.employmentType
                        ?.replace("-", " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </Badge>
                    <Badge variant="outline" className="text-sm">
                      {job.workplaceType?.charAt(0).toUpperCase() +
                        job.workplaceType?.slice(1)}
                    </Badge>
                    {job.positionsToHire && job.positionsToHire > 1 && (
                      <Badge variant="outline" className="text-sm">
                        <Briefcase className="w-3 h-3 mr-1" />
                        {job.positionsToHire} positions
                      </Badge>
                    )}
                    {job.educationRequirement && (
                      <Badge variant="outline" className="text-sm">
                        <GraduationCap className="w-3 h-3 mr-1" />
                        {job.educationRequirement
                          .replace("-", " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <Button
                    onClick={handleEdit}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Job
                  </Button>

                  <Button
                    onClick={() => setShowDeleteModal(true)}
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Applications
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {job.applicants || 0}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center text-sm text-green-600">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span>+12% from last week</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Views
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {job.views || 0}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Eye className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center text-sm text-green-600">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span>+8% from last week</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Application Rate
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {applicationRate.toFixed(1)}%
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <Progress value={applicationRate} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Days Active
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {Math.ceil(
                        (Date.now() - new Date(job.createdAt).getTime()) /
                          (1000 * 60 * 60 * 24)
                      )}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-sm text-gray-600">
                    Posted on {formatDate(job.createdAt)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="applications">
                Applications ({applications.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Job Description */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Job Description</CardTitle>
                    </CardHeader>
                    <CardContent className="prose max-w-none">
                      <div className="whitespace-pre-line text-gray-700">
                        {job.jobDescription}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Requirements */}
                  {job.requirements && (
                    <Card className="mt-6">
                      <CardHeader>
                        <CardTitle>Requirements</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {job.requirements.map((req, index) => (
                            <li key={index} className="flex items-start">
                              <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700">{req}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {/* Responsibilities */}
                  {job.responsibilities && (
                    <Card className="mt-6">
                      <CardHeader>
                        <CardTitle>Key Responsibilities</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {job.responsibilities.map((resp, index) => (
                            <li key={index} className="flex items-start">
                              <Briefcase className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700">{resp}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Job Details */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Job Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Employment Type</span>
                        <span className="font-medium">
                          {job.employmentType
                            ?.replace("-", " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-gray-600">Workplace Type</span>
                        <span className="font-medium">
                          {job.workplaceType?.charAt(0).toUpperCase() +
                            job.workplaceType?.slice(1)}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-gray-600">Positions</span>
                        <span className="font-medium">
                          {job.positionsToHire || 1}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-gray-600">Education</span>
                        <span className="font-medium">
                          {job.educationRequirement
                            ?.replace("-", " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Application Deadline
                        </span>
                        <span className="font-medium">
                          {job.applicationDeadline
                            ? formatDate(job.applicationDeadline)
                            : "No deadline"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Benefits */}
                  {job.benefits && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Benefits & Perks</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {job.benefits.map((benefit, index) => (
                            <li key={index} className="flex items-start">
                              <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700">
                                {benefit}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="applications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Applications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {applications.map((application) => (
                      <div
                        key={application.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-medium text-gray-900">
                              {application.candidateName}
                            </h4>
                            <Badge
                              className={cn(
                                "text-xs",
                                getApplicationStatusColor(application.status)
                              )}
                            >
                              {application.status.charAt(0).toUpperCase() +
                                application.status.slice(1)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>{application.email}</span>
                            <span>•</span>
                            <span>{application.experience} experience</span>
                            <span>•</span>
                            <span>{application.location}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Applied on {formatDate(application.appliedDate)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            View Profile
                          </Button>
                          <Button size="sm">Review</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <DeleteJobModal
        job={job}
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
