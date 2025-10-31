import { useState, useEffect } from "react";
import { 
  Brain, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp,
  User,
  Mail,
  Star,
  Calendar,
  BarChart3,
  Filter,
  Search,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import API from "@/http";

interface AIFollowupQuestion {
  question: string;
  category?: string;
  weight?: number;
  scoringCriteria?: string;
}

interface AIFollowupResponse {
  question: string;
  answer: string;
  aiScore: number;
  aiAnalysis: string;
  scoringReason: string;
  timestamp: Date;
}

interface AIFollowupSuggestion {
  type: 'recommend' | 'interview' | 'reject' | 'request_more_info';
  confidence: number;
  reasoning: string;
  nextSteps?: string[];
  overallScore: number;
  individualScores: {
    question: string;
    score: number;
    analysis: string;
  }[];
}

interface AIFollowup {
  _id: string;
  applicantId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  jobId: {
    _id: string;
    jobBoardTitle: string;
  };
  questions: AIFollowupQuestion[];
  responses: AIFollowupResponse[];
  finalSuggestion?: AIFollowupSuggestion;
  processingStatus: 'pending' | 'questions_sent' | 'responses_received' | 'analysis_complete' | 'failed';
  emailSent: boolean;
  emailSentAt?: Date;
  responseDeadline?: Date;
  createdAt: Date;
  completedAt?: Date;
}

interface AIFollowupStats {
  totalFollowups: number;
  completedFollowups: number;
  averageResponseTime: number;
  averageScore: number;
  responseRate: number;
  scoreDistribution: { range: string; count: number }[];
  recentActivity: Array<{
    date: string;
    followupsCreated: number;
    responsesReceived: number;
  }>;
}

// Helper function for recommendation badge (used in multiple components)
const getRecommendationBadge = (type: string, confidence: number) => {
  const typeConfig = {
    recommend: { color: "bg-green-100 text-green-800 border-green-200", label: "Recommend" },
    interview: { color: "bg-blue-100 text-blue-800 border-blue-200", label: "Interview" },
    reject: { color: "bg-red-100 text-red-800 border-red-200", label: "Reject" },
    request_more_info: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", label: "More Info" },
  };

  const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.interview;

  return (
    <div className="flex items-center gap-2">
      <Badge className={`${config.color} border`}>
        {config.label}
      </Badge>
      <span className="text-xs text-gray-500">{confidence}% confidence</span>
    </div>
  );
};

export default function AIFollowupDashboard() {
  const [followups, setFollowups] = useState<AIFollowup[]>([]);
  const [stats, setStats] = useState<AIFollowupStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFollowup, setSelectedFollowup] = useState<AIFollowup | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [scoreFilter, setScoreFilter] = useState("all");

  useEffect(() => {
    fetchFollowups();
    fetchStats();
  }, []);

  const fetchFollowups = async () => {
    try {
      const response = await API.aiFollowup.getFollowups();
      setFollowups(response.data?.results || response.results || []);
    } catch (error) {
      console.error('Error fetching followups:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await API.aiFollowup.getFollowupAnalytics();
      setStats(response.data || response);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending", icon: Clock },
      questions_sent: { color: "bg-blue-100 text-blue-800", label: "Questions Sent", icon: Mail },
      responses_received: { color: "bg-purple-100 text-purple-800", label: "Responses Received", icon: MessageSquare },
      analysis_complete: { color: "bg-green-100 text-green-800", label: "Analysis Complete", icon: CheckCircle },
      failed: { color: "bg-red-100 text-red-800", label: "Failed", icon: AlertCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };


  const filteredFollowups = followups.filter(followup => {
    const matchesSearch = 
      followup.applicantId.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      followup.applicantId.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      followup.applicantId.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      followup.jobId.jobBoardTitle.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || followup.processingStatus === statusFilter;

    const matchesScore = scoreFilter === "all" || 
      (scoreFilter === "high" && followup.finalSuggestion && followup.finalSuggestion.overallScore >= 75) ||
      (scoreFilter === "medium" && followup.finalSuggestion && followup.finalSuggestion.overallScore >= 50 && followup.finalSuggestion.overallScore < 75) ||
      (scoreFilter === "low" && followup.finalSuggestion && followup.finalSuggestion.overallScore < 50);

    return matchesSearch && matchesStatus && matchesScore;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Follow-up Dashboard</h1>
          <p className="text-gray-600">Monitor and analyze AI-powered candidate follow-ups</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={fetchFollowups}
            variant="outline"
            size="sm"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Follow-ups</p>
                  <p className="text-2xl font-bold">{stats.totalFollowups}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold">{stats.completedFollowups}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Response Rate</p>
                  <p className="text-2xl font-bold">{stats.responseRate.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-600">Average Score</p>
                  <p className="text-2xl font-bold">{stats.averageScore.toFixed(1)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="followups" className="space-y-4">
        <TabsList>
          <TabsTrigger value="followups">Follow-ups</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="followups" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search candidates or jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="questions_sent">Questions Sent</SelectItem>
                <SelectItem value="responses_received">Responses Received</SelectItem>
                <SelectItem value="analysis_complete">Analysis Complete</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={scoreFilter} onValueChange={setScoreFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by score" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Scores</SelectItem>
                <SelectItem value="high">High (75+)</SelectItem>
                <SelectItem value="medium">Medium (50-74)</SelectItem>
                <SelectItem value="low">Low (0-49)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Follow-ups List */}
          <div className="grid gap-4">
            {filteredFollowups.map((followup) => (
              <Card key={followup._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">
                            {followup.applicantId.firstName} {followup.applicantId.lastName}
                          </span>
                        </div>
                        <div className="text-gray-400">•</div>
                        <span className="text-sm text-gray-600">{followup.jobId.jobBoardTitle}</span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {followup.applicantId.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(followup.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {followup.responses.length}/{followup.questions.length} responses
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {getStatusBadge(followup.processingStatus)}
                        {followup.finalSuggestion && (
                          <>
                            {getRecommendationBadge(followup.finalSuggestion.type, followup.finalSuggestion.confidence)}
                            <div className="flex items-center gap-1 text-sm">
                              <Star className="h-3 w-3 text-yellow-500" />
                              <span>{followup.finalSuggestion.overallScore}/100</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedFollowup(followup)}
                      className="flex items-center gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredFollowups.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Brain className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No follow-ups found</h3>
                  <p className="text-gray-500">
                    {followups.length === 0 
                      ? "No AI follow-ups have been created yet."
                      : "No follow-ups match your current filters."
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid gap-6">
            {stats && (
              <>
                {/* Score Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Score Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {stats.scoreDistribution.map((bucket, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="w-20 text-sm text-gray-600">{bucket.range}</div>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-purple-600 h-2 rounded-full"
                              style={{ 
                                width: `${(bucket.count / Math.max(...stats.scoreDistribution.map(b => b.count))) * 100}%` 
                              }}
                            />
                          </div>
                          <div className="w-8 text-sm text-gray-600">{bucket.count}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {stats.recentActivity.slice(-7).map((day, index) => (
                        <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                          <span className="text-sm text-gray-600">{new Date(day.date).toLocaleDateString()}</span>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-blue-600">{day.followupsCreated} created</span>
                            <span className="text-green-600">{day.responsesReceived} responses</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Detailed View Modal would go here */}
      {selectedFollowup && (
        <AIFollowupDetailModal
          followup={selectedFollowup}
          onClose={() => setSelectedFollowup(null)}
        />
      )}
    </div>
  );
}

// Detailed view component (simplified for now)
function AIFollowupDetailModal({ followup, onClose }: { followup: AIFollowup; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">
            AI Follow-up Details - {followup.applicantId.firstName} {followup.applicantId.lastName}
          </h2>
          <Button variant="ghost" onClick={onClose}>×</Button>
        </div>
        
        {/* Detailed content would go here */}
        <div className="space-y-6">
          {/* Questions and Responses */}
          <div>
            <h3 className="font-medium mb-3">Questions & Responses</h3>
            <div className="space-y-4">
              {followup.questions.map((question, index) => {
                const response = followup.responses.find(r => r.question === question.question);
                return (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="font-medium text-gray-900 mb-2">
                      Q{index + 1}: {question.question}
                    </div>
                    {response ? (
                      <div className="space-y-2">
                        <div className="text-gray-700">
                          <strong>Answer:</strong> {response.answer}
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="font-medium">{response.aiScore}/100</span>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          <strong>AI Analysis:</strong> {response.aiAnalysis}
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-500 italic">No response yet</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Final Suggestion */}
          {followup.finalSuggestion && (
            <div>
              <h3 className="font-medium mb-3">AI Recommendation</h3>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  {getRecommendationBadge(followup.finalSuggestion.type, followup.finalSuggestion.confidence)}
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium">{followup.finalSuggestion.overallScore}/100</span>
                  </div>
                </div>
                <div className="text-gray-700 mb-3">
                  <strong>Reasoning:</strong> {followup.finalSuggestion.reasoning}
                </div>
                {followup.finalSuggestion.nextSteps && followup.finalSuggestion.nextSteps.length > 0 && (
                  <div>
                    <strong>Next Steps:</strong>
                    <ul className="list-disc list-inside mt-1 text-gray-700">
                      {followup.finalSuggestion.nextSteps.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
