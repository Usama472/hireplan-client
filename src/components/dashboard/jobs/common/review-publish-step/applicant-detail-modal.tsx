import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  Brain,
  Briefcase,
  Calendar,
  CalendarCheck,
  Check,
  CheckCircle,
  Clock,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Globe,
  GraduationCap,
  Linkedin,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Shield,
  Star,
  ThumbsUp,
  User,
  Users,
  Video,
  X,
} from "lucide-react";
import { useState } from "react";

export interface AIEvaluation {
  skillsMatchScore: number;
  skillsMatchJustification: string;
  experienceScore: number;
  experienceJustification: string;
  educationScore: number;
  educationJustification: string;
  culturalFitScore: number;
  culturalFitJustification: string;
  totalScore: number;
  overallAssessment: string;
  strengths: string[];
  weaknesses: string[];
  recommendationLevel: "Strong No" | "No" | "Maybe" | "Yes" | "Strong Yes";
}

interface Applicant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  city?: string;
  state?: string;
  resume?: string;
  coverLetter?: string;
  createdAt: string;
  aiScore?: number;
  aiEvaluation?: AIEvaluation | null;
  status?: "pending" | "reviewed" | "shortlisted" | "rejected";
  interviewScheduled?: boolean;
  invitationSent?: boolean;
  invitationSentAt?: string;
  interview?: {
    id: string;
    applicant: string;
    job: string;
    startTime: string;
    endTime: string;
    scheduledDate: string;
    meetingLink: string;
    timezone: string;
    meetingSource: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
  // Additional fields for enhanced profile
  linkedin?: string;
  github?: string;
  portfolio?: string;
}

interface ApplicantDetailModalProps {
  applicant: Applicant;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate?: (applicantId: string, status: string) => void;
}

const getStatusColor = (status?: string) => {
  switch (status) {
    case "shortlisted":
      return "bg-green-50 text-green-700 border-green-200";
    case "reviewed":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "rejected":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-yellow-50 text-yellow-700 border-yellow-200";
  }
};

const getRecommendationColor = (recommendation: string) => {
  switch (recommendation) {
    case "Strong Yes":
      return "bg-green-100 text-green-800 border-green-300";
    case "Yes":
      return "bg-emerald-100 text-emerald-800 border-emerald-300";
    case "Maybe":
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    case "No":
      return "bg-red-100 text-red-800 border-red-300";
    case "Strong No":
      return "bg-red-200 text-red-900 border-red-400";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300";
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatInterviewTime = (dateString: string, timezone: string) => {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timezone,
  });
};

const formatInvitationDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

export function ApplicantDetailModal({
  applicant,
  isOpen,
  onClose,
  onStatusUpdate,
}: ApplicantDetailModalProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [animateHeader, setAnimateHeader] = useState(false);

  // Trigger animation on initial render
  setTimeout(() => setAnimateHeader(true), 100);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  console.log(applicant);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-4xl overflow-hidden flex flex-col p-0 bg-gradient-to-b from-white to-gray-50">
        {/* Profile Header - with animation */}
        <div
          className={`relative w-full bg-gradient-to-r from-blue-600 to-purple-700 transition-all duration-700 ease-in-out ${animateHeader ? "h-48" : "h-32"
            }`}
        >
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,white_0,transparent_70%)]"></div>
          </div>

          {/* Header Content */}
          <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-between items-end">
            <div className="flex items-center gap-4">
              {/* Avatar with animation */}
              <div
                className={`relative bg-white rounded-2xl shadow-lg transform transition-all duration-700 ease-in-out ${animateHeader ? "w-24 h-24 -mb-12" : "w-16 h-16 mb-0"
                  }`}
              >
                <div className="absolute inset-1 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                  {applicant.firstName[0]}
                  {applicant.lastName[0]}
                </div>
              </div>
              <div className="mb-1">
                <h2 className="text-2xl font-bold text-white transition-all duration-500 ease-in-out transform">
                  {applicant.firstName} {applicant.lastName}
                </h2>
                <p className="text-blue-100 flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  Applied {formatDate(applicant.createdAt || "")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                className={`text-xs font-medium ${getStatusColor(
                  applicant.status
                )}`}
              >
                {applicant.status || "pending"}
              </Badge>
              {applicant.aiEvaluation && (
                <Badge
                  className={`text-xs font-medium ${getRecommendationColor(
                    applicant.aiEvaluation.recommendationLevel
                  )}`}
                >
                  {applicant.aiEvaluation.recommendationLevel}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Profile Body */}
        <div className="flex-1 min-h-0 pt-14">
          {" "}
          {/* Added padding to account for avatar overlap */}
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="h-full flex flex-col px-6"
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 transition-all duration-300"
              >
                <User className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="ai-score"
                className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 transition-all duration-300"
              >
                <Brain className="w-4 h-4 mr-2" />
                AI Analysis
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 min-h-0 relative">
              <ScrollArea className="h-full pr-3">
                {/* Overview Tab */}
                <TabsContent
                  value="overview"
                  className="mt-0 space-y-8 animate-in slide-in-from-left duration-500"
                >
                  {/* Personal Details Section */}
                  <section>
                    <h3 className="text-lg font-semibold mb-4 flex items-center text-blue-800">
                      <User className="w-5 h-5 mr-2 text-blue-600" />
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-8">
                      {/* Left Column - Basic Info */}
                      <div className="space-y-4 md:col-span-2">
                        {/* Location */}
                        {(applicant.city || applicant.state) && (
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                              <MapPin className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Location
                              </p>
                              <p className="font-medium">
                                {applicant.city && applicant.state
                                  ? `${applicant.city}, ${applicant.state}`
                                  : applicant.city || applicant.state}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right Column - Contact */}
                      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <h4 className="text-sm font-medium text-gray-600 mb-3">
                          Contact Details
                        </h4>
                        {applicant.email && (
                          <div className="group/item flex items-center gap-3">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <p className="font-medium text-sm group-hover/item:text-blue-600 transition-colors">
                              {applicant.email}
                            </p>
                          </div>
                        )}
                        {applicant.phone && (
                          <div className="group/item flex items-center gap-3">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <p className="font-medium text-sm group-hover/item:text-blue-600 transition-colors">
                              {applicant.phone}
                            </p>
                          </div>
                        )}
                        {(applicant.linkedin || applicant.portfolio) && (
                          <Separator className="my-2" />
                        )}
                        {applicant.linkedin && (
                          <div className="group/item flex items-center gap-3">
                            <Linkedin className="w-4 h-4 text-muted-foreground" />
                            <a
                              href={applicant.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-sm text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
                            >
                              LinkedIn Profile
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                        {applicant.portfolio && (
                          <div className="group/item flex items-center gap-3">
                            <Globe className="w-4 h-4 text-muted-foreground" />
                            <a
                              href={applicant.portfolio}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-sm text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
                            >
                              Portfolio
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </section>

                  {/* Documents Section */}
                  <section>
                    <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
                      <FileText className="w-5 h-5 mr-2 text-gray-600" />
                      Documents
                    </h3>
                    <div className="space-y-6">
                      {/* Resume */}
                      {applicant.resume && (
                        <div className="group flex items-center bg-gray-50 hover:bg-gray-100 rounded-lg p-4 transition-all duration-300">
                          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4 transform group-hover:scale-110 transition-transform duration-300">
                            <FileText className="w-6 h-6 text-red-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium mb-1">Resume</h4>
                            <p className="text-sm text-gray-500 mb-2">
                              Candidate's professional resume
                            </p>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="text-xs"
                              >
                                <a
                                  href={applicant.resume}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Eye className="w-3 h-3 mr-1" />
                                  View
                                </a>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="text-xs"
                              >
                                <a href={applicant.resume} download>
                                  <Download className="w-3 h-3 mr-1" />
                                  Download
                                </a>
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Cover Letter */}
                      {applicant.coverLetter && (
                        <div className="group hover:shadow-md transition-all duration-300">
                          <div className="flex items-center mb-3">
                            <MessageSquare className="w-5 h-5 mr-2 text-purple-600" />
                            <h4 className="font-medium">Cover Letter</h4>
                          </div>
                          <div className="prose prose-sm max-w-none p-4 bg-gray-50 rounded-lg border max-h-48 overflow-auto">
                            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                              {applicant.coverLetter}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Interview Section */}
                  {applicant.interviewScheduled && applicant.interview && (
                    <section>
                      <h3 className="text-lg font-semibold mb-4 flex items-center text-purple-800">
                        <Video className="w-5 h-5 mr-2 text-purple-600" />
                        Interview Details
                      </h3>
                      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Interview Time */}
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                                <CalendarCheck className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Scheduled Time
                                </p>
                                <p className="font-medium text-purple-800">
                                  {formatInterviewTime(
                                    applicant.interview.scheduledDate,
                                    applicant.interview.timezone
                                  )}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                <Globe className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Timezone
                                </p>
                                <p className="font-medium text-blue-800">
                                  {applicant.interview.timezone}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Meeting Link */}
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                <Video className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Meeting Platform
                                </p>
                                <p className="font-medium text-green-800 capitalize">
                                  {applicant.interview.meetingSource}
                                </p>
                              </div>
                            </div>

                            {applicant.interview.meetingLink && (
                              <div className="mt-4">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  asChild
                                  className="w-full bg-white hover:bg-gray-50 border-purple-200 text-purple-700 hover:text-purple-800"
                                >
                                  <a
                                    href={applicant.interview.meetingLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                    Join Meeting
                                  </a>
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="mt-4 flex justify-end">
                          <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Interview Scheduled
                          </Badge>
                        </div>
                      </div>
                    </section>
                  )}

                  {/* Invitation Section */}
                  {applicant.invitationSent &&
                    !applicant.interviewScheduled && (
                      <section>
                        <h3 className="text-lg font-semibold mb-4 flex items-center text-orange-800">
                          <Calendar className="w-5 h-5 mr-2 text-orange-600" />
                          Interview Invitation
                        </h3>
                        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-6 border border-orange-200">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Invitation Details */}
                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                                  <Calendar className="w-5 h-5" />
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    Invitation Sent
                                  </p>
                                  <p className="font-medium text-orange-800">
                                    {formatInvitationDate(
                                      applicant.invitationSentAt || ""
                                    )}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                                  <Clock className="w-5 h-5" />
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    Status
                                  </p>
                                  <p className="font-medium text-amber-800">
                                    Waiting for candidate response
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                  <MessageSquare className="w-5 h-5" />
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    Status
                                  </p>
                                  <p className="font-medium text-blue-800">
                                    Waiting for candidate response
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div className="mt-4 flex justify-end">
                            <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                              <Calendar className="w-3 h-3 mr-1" />
                              Invitation Sent
                            </Badge>
                          </div>
                        </div>
                      </section>
                    )}
                </TabsContent>

                {/* AI Score Tab */}
                <TabsContent
                  value="ai-score"
                  className="mt-0 space-y-8 animate-in slide-in-from-right duration-500"
                >
                  {applicant.aiEvaluation ? (
                    <>
                      {/* AI Score Header */}
                      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white mb-8">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,theme(colors.purple.300/30),transparent_50%)]"></div>
                        <div className="relative flex flex-col md:flex-row gap-6 items-center">
                          <div className="flex-1 space-y-2">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                              <Shield className="w-5 h-5" /> AI Talent
                              Assessment
                            </h2>
                            <p className="text-purple-100 max-w-md">
                              Our AI has analyzed this candidate's fit for the
                              role based on skills, experience, education, and
                              cultural alignment.
                            </p>
                          </div>
                          <div className="flex flex-col items-center justify-center">
                            <div className="relative w-24 h-24 flex items-center justify-center">
                              <div className="absolute inset-0 rounded-full bg-white/20"></div>
                              <div className="absolute inset-1 rounded-full bg-white/10 animate-pulse"></div>
                              <span className="text-3xl font-bold">
                                {applicant.aiEvaluation.totalScore}%
                              </span>
                            </div>
                            <p className="text-sm mt-2 font-medium">
                              Overall Match
                            </p>
                          </div>
                          <div>
                            <div className="bg-white/20 rounded-lg px-4 py-3 text-center">
                              <div className="text-xs uppercase tracking-wide text-purple-200">
                                Recommendation
                              </div>
                              <div className="text-xl font-bold mt-1">
                                {applicant.aiEvaluation.recommendationLevel}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Overall Assessment */}
                      <section className="mb-8">
                        <h3 className="text-lg font-semibold mb-4 flex items-center text-purple-800">
                          <Brain className="w-5 h-5 mr-2 text-purple-600" />
                          Overall Assessment
                        </h3>
                        <div className="text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 p-5 rounded-lg border">
                          {applicant.aiEvaluation.overallAssessment}
                        </div>
                      </section>

                      {/* Strengths and Weaknesses */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Strengths */}
                        <section className="bg-gradient-to-br from-green-50 to-white rounded-lg p-5 border-l-4 border-green-400">
                          <h3 className="text-base font-semibold flex items-center gap-2 mb-4 text-green-800">
                            <ThumbsUp className="w-4 h-4 text-green-600" />
                            Key Strengths
                          </h3>
                          <ul className="space-y-2">
                            {applicant.aiEvaluation.strengths.map(
                              (strength, index) => (
                                <li
                                  key={index}
                                  className="flex items-start gap-2 p-2 text-sm rounded-md hover:bg-green-100/50 transition-colors duration-200"
                                >
                                  <Check className="w-4 h-4 text-green-600 mt-0.5" />
                                  <span>{strength}</span>
                                </li>
                              )
                            )}
                          </ul>
                        </section>

                        {/* Weaknesses */}
                        <section className="bg-gradient-to-br from-amber-50 to-white rounded-lg p-5 border-l-4 border-amber-400">
                          <h3 className="text-base font-semibold flex items-center gap-2 mb-4 text-amber-800">
                            <AlertCircle className="w-4 h-4 text-amber-600" />
                            Areas for Improvement
                          </h3>
                          <ul className="space-y-2">
                            {applicant.aiEvaluation.weaknesses.map(
                              (weakness, index) => (
                                <li
                                  key={index}
                                  className="flex items-start gap-2 p-2 text-sm rounded-md hover:bg-amber-100/50 transition-colors duration-200"
                                >
                                  <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                                  <span>{weakness}</span>
                                </li>
                              )
                            )}
                          </ul>
                        </section>
                      </div>

                      <Separator />

                      {/* Score Categories */}
                      <section>
                        <h3 className="text-lg font-semibold mb-6 flex items-center text-gray-800">
                          <Check className="w-5 h-5 mr-2 text-gray-600" />
                          Evaluation Areas
                        </h3>
                        <div className="space-y-8">
                          {/* Skills Match */}
                          <div className="relative">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                  <Star className="w-5 h-5" />
                                </div>
                                <div>
                                  <h4 className="font-semibold">
                                    Skills Match
                                  </h4>
                                  <p className="text-sm text-muted-foreground">
                                    Job-specific skills alignment
                                  </p>
                                </div>
                              </div>
                              <div className="text-2xl font-bold text-blue-600">
                                {applicant.aiEvaluation.skillsMatchScore}%
                              </div>
                            </div>
                            <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden mt-2 mb-3">
                              <div
                                className="absolute top-0 left-0 h-full bg-blue-500 rounded-full"
                                style={{
                                  width: `${applicant.aiEvaluation.skillsMatchScore}%`,
                                }}
                              ></div>
                            </div>
                            <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg border border-blue-100 mt-3 max-h-24 overflow-auto">
                              {applicant.aiEvaluation.skillsMatchJustification}
                            </div>
                          </div>

                          {/* Experience */}
                          <div className="relative">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                                  <Briefcase className="w-5 h-5" />
                                </div>
                                <div>
                                  <h4 className="font-semibold">Experience</h4>
                                  <p className="text-sm text-muted-foreground">
                                    Work history relevance
                                  </p>
                                </div>
                              </div>
                              <div className="text-2xl font-bold text-indigo-600">
                                {applicant.aiEvaluation.experienceScore}%
                              </div>
                            </div>
                            <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden mt-2 mb-3">
                              <div
                                className="absolute top-0 left-0 h-full bg-indigo-500 rounded-full"
                                style={{
                                  width: `${applicant.aiEvaluation.experienceScore}%`,
                                }}
                              ></div>
                            </div>
                            <div className="text-sm text-gray-600 bg-indigo-50 p-4 rounded-lg border border-indigo-100 mt-3 max-h-24 overflow-auto">
                              {applicant.aiEvaluation.experienceJustification}
                            </div>
                          </div>

                          {/* Education */}
                          <div className="relative">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                                  <GraduationCap className="w-5 h-5" />
                                </div>
                                <div>
                                  <h4 className="font-semibold">Education</h4>
                                  <p className="text-sm text-muted-foreground">
                                    Academic qualifications
                                  </p>
                                </div>
                              </div>
                              <div className="text-2xl font-bold text-green-600">
                                {applicant.aiEvaluation.educationScore}%
                              </div>
                            </div>
                            <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden mt-2 mb-3">
                              <div
                                className="absolute top-0 left-0 h-full bg-green-500 rounded-full"
                                style={{
                                  width: `${applicant.aiEvaluation.educationScore}%`,
                                }}
                              ></div>
                            </div>
                            <div className="text-sm text-gray-600 bg-green-50 p-4 rounded-lg border border-green-100 mt-3 max-h-24 overflow-auto">
                              {applicant.aiEvaluation.educationJustification}
                            </div>
                          </div>

                          {/* Cultural Fit */}
                          <div className="relative">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                                  <Users className="w-5 h-5" />
                                </div>
                                <div>
                                  <h4 className="font-semibold">
                                    Cultural Fit
                                  </h4>
                                  <p className="text-sm text-muted-foreground">
                                    Alignment with company values
                                  </p>
                                </div>
                              </div>
                              <div className="text-2xl font-bold text-amber-600">
                                {applicant.aiEvaluation.culturalFitScore}%
                              </div>
                            </div>
                            <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden mt-2 mb-3">
                              <div
                                className="absolute top-0 left-0 h-full bg-amber-500 rounded-full"
                                style={{
                                  width: `${applicant.aiEvaluation.culturalFitScore}%`,
                                }}
                              ></div>
                            </div>
                            <div className="text-sm text-gray-600 bg-amber-50 p-4 rounded-lg border border-amber-100 mt-3 max-h-24 overflow-auto">
                              {applicant.aiEvaluation.culturalFitJustification}
                            </div>
                          </div>
                        </div>
                      </section>
                    </>
                  ) : (
                    <div className="min-h-[400px] flex items-center justify-center">
                      <div className="text-center p-8">
                        <div className="relative w-24 h-24 mx-auto mb-4">
                          <div className="absolute inset-0 bg-purple-100 rounded-full animate-ping opacity-25"></div>
                          <div className="relative flex items-center justify-center w-full h-full bg-purple-50 rounded-full">
                            <Brain className="w-10 h-10 text-purple-300" />
                          </div>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">
                          AI Assessment Not Available
                        </h3>
                        <p className="text-muted-foreground max-w-md mx-auto">
                          This candidate hasn't been evaluated by our AI system
                          yet. Check back later for a comprehensive assessment.
                        </p>
                        <Button variant="outline" className="mt-4">
                          <Brain className="w-4 h-4 mr-2" />
                          Request AI Assessment
                        </Button>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </ScrollArea>
            </div>
          </Tabs>
        </div>

        {/* Action Buttons */}
        <div className="border-t p-6 bg-white/80 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row gap-3">
            {!applicant.invitationSent &&
              !applicant.interviewScheduled &&
              applicant.status === "pending" ? (
              <>
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700 transform transition-all duration-200 hover:-translate-y-0.5"
                  onClick={() => onStatusUpdate?.(applicant.id, "rejected")}
                >
                  <X className="w-4 h-4 mr-2" />
                  Reject Candidate
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 transform transition-all duration-200 hover:-translate-y-0.5"
                  onClick={() => onStatusUpdate?.(applicant.id, "shortlisted")}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Shortlist Candidate
                </Button>
              </>
            ) : (
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700 transform transition-all duration-200 hover:-translate-y-0.5"
                onClick={() => onStatusUpdate?.(applicant.id, "shortlisted")}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Shortlist Candidate
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
