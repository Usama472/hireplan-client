import { useState, useEffect } from "react";
import { 
  Brain, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Star,
  Mail,
  Calendar,
  User,
  TrendingUp,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import API from "@/http";

interface AIFollowupQuestion {
  question: string;
  category?: string;
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

interface AIFollowupResponsesProps {
  applicantId: string;
  className?: string;
}

export default function AIFollowupResponses({ applicantId, className = "" }: AIFollowupResponsesProps) {
  const [followups, setFollowups] = useState<AIFollowup[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedFollowup, setExpandedFollowup] = useState<string | null>(null);

  useEffect(() => {
    fetchFollowups();
  }, [applicantId]);

  const fetchFollowups = async () => {
    try {
      const response = await API.aiFollowup.getFollowupsByApplicant(applicantId);
      setFollowups(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Error fetching AI follow-ups:', error);
    } finally {
      setLoading(false);
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

  const getRecommendationBadge = (type: string, confidence: number) => {
    const typeConfig = {
      recommend: { color: "bg-green-100 text-green-800 border-green-200", label: "✅ Recommend" },
      interview: { color: "bg-blue-100 text-blue-800 border-blue-200", label: "📞 Interview" },
      reject: { color: "bg-red-100 text-red-800 border-red-200", label: "❌ Reject" },
      request_more_info: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", label: "❓ More Info" },
    };

    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.interview;

    return (
      <div className="flex items-center gap-2">
        <Badge className={`${config.color} border font-medium`}>
          {config.label}
        </Badge>
        <span className="text-xs text-gray-500">{confidence}% confidence</span>
      </div>
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  if (followups.length === 0) {
    return (
      <div className={`${className}`}>
        <Card>
          <CardContent className="p-6 text-center">
            <Brain className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No AI follow-ups found for this candidate</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Brain className="h-5 w-5 text-purple-600" />
        <h3 className="text-lg font-medium">AI Follow-up Responses</h3>
        <Badge variant="outline" className="ml-auto">
          {followups.length} follow-up{followups.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {followups.map((followup) => (
        <Card key={followup._id} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusBadge(followup.processingStatus)}
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Calendar className="h-3 w-3" />
                  {new Date(followup.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <MessageSquare className="h-3 w-3" />
                  {followup.responses.length}/{followup.questions.length} responses
                </div>
              </div>
              
              <Collapsible open={expandedFollowup === followup._id} onOpenChange={(open) => setExpandedFollowup(open ? followup._id : null)}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-1">
                    {expandedFollowup === followup._id ? (
                      <>
                        <ChevronUp className="h-4 w-4" />
                        Hide Details
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        View Details
                      </>
                    )}
                  </Button>
                </CollapsibleTrigger>
              </Collapsible>
            </div>

            {/* Final Suggestion Summary */}
            {followup.finalSuggestion && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  {getRecommendationBadge(followup.finalSuggestion.type, followup.finalSuggestion.confidence)}
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium text-lg">{followup.finalSuggestion.overallScore}/100</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                  {followup.finalSuggestion.reasoning}
                </p>
              </div>
            )}
          </CardHeader>

          <Collapsible open={expandedFollowup === followup._id}>
            <CollapsibleContent>
              <CardContent className="pt-0">
                {/* Questions and Responses */}
                <div className="space-y-4">
                  {followup.questions.map((question, index) => {
                    const response = followup.responses.find(r => r.question === question.question);
                    return (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 mb-1">
                              {question.question}
                            </div>
                            {question.category && (
                              <Badge variant="outline" className="text-xs">
                                {question.category}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {response ? (
                          <div className="ml-9 space-y-3">
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <User className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-medium text-blue-800">Candidate Response</span>
                                <div className="ml-auto flex items-center gap-1">
                                  <Star className="h-4 w-4 text-yellow-500" />
                                  <span className={`font-bold ${getScoreColor(response.aiScore)}`}>
                                    {response.aiScore}/100
                                  </span>
                                </div>
                              </div>
                              <p className="text-gray-700 text-sm">{response.answer}</p>
                            </div>

                            <div className="bg-purple-50 p-3 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <Brain className="h-4 w-4 text-purple-600" />
                                <span className="text-sm font-medium text-purple-800">AI Analysis</span>
                              </div>
                              <p className="text-gray-700 text-sm mb-2">{response.aiAnalysis}</p>
                              <p className="text-xs text-gray-500">
                                <strong>Scoring Reason:</strong> {response.scoringReason}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="ml-9 text-sm text-gray-500 italic">
                            No response received yet
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Detailed Final Suggestion */}
                {followup.finalSuggestion && (
                  <div className="mt-6 border-t pt-6">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-purple-600" />
                      Final AI Recommendation
                    </h4>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        {getRecommendationBadge(followup.finalSuggestion.type, followup.finalSuggestion.confidence)}
                        <div className="flex items-center gap-1">
                          <Star className="h-5 w-5 text-yellow-500" />
                          <span className="text-xl font-bold">{followup.finalSuggestion.overallScore}/100</span>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-700 mb-3">{followup.finalSuggestion.reasoning}</p>
                        
                        {followup.finalSuggestion.nextSteps && followup.finalSuggestion.nextSteps.length > 0 && (
                          <div>
                            <h5 className="font-medium text-gray-900 mb-2">Recommended Next Steps:</h5>
                            <ul className="list-disc list-inside space-y-1">
                              {followup.finalSuggestion.nextSteps.map((step, index) => (
                                <li key={index} className="text-sm text-gray-700">{step}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Individual Question Scores */}
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Question Breakdown:</h5>
                        <div className="grid gap-2">
                          {followup.finalSuggestion.individualScores.map((score, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-white border rounded">
                              <span className="text-sm text-gray-600 truncate flex-1 mr-2">
                                Q{index + 1}: {score.question.substring(0, 50)}...
                              </span>
                              <div className="flex items-center gap-2">
                                <span className={`font-medium ${getScoreColor(score.score)}`}>
                                  {score.score}/100
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      ))}
    </div>
  );
}
