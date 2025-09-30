import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import API from '@/http';
import { 
  ChevronDown, 
  ChevronUp, 
  MessageSquare, 
  Star,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw
} from 'lucide-react';

interface AIFollowupResponse {
  question: string;
  answer: string;
  aiScore: number;
  aiAnalysis: string;
  scoringReason: string;
  timestamp: string;
}

interface AIFollowupData {
  _id: string;
  questions: Array<{
    question: string;
    category: string;
    scoringCriteria?: string;
  }>;
  responses: AIFollowupResponse[];
  finalSuggestion?: {
    type: 'hire' | 'maybe' | 'reject' | 'interview' | 'request_more_info';
    confidence: number;
    reasoning: string;
    keyStrengths?: string[];
    concerns?: string[];
    questionAnalysis?: Array<{
      question: string;
      score: number;
      analysis: string;
    }>;
  };
  processingStatus: 'pending' | 'questions_sent' | 'responses_received' | 'analysis_complete' | 'failed';
  allQuestionsAnswered: boolean;
}

interface AIFollowupMessageProps {
  message: any;
  isOutbound: boolean;
  conversationId: string;
}

export function AIFollowupMessage({ message, isOutbound, conversationId }: AIFollowupMessageProps) {
  const [followupData, setFollowupData] = useState<AIFollowupData | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [generatingSuggestion, setGeneratingSuggestion] = useState(false);

  useEffect(() => {
    if (message.metadata?.type === 'ai_followup' && message.metadata?.automationId && !followupData) {
      fetchFollowupData(message.metadata.automationId);
    }
  }, [message.metadata?.automationId]);

  const fetchFollowupData = async (followupId: string) => {
    // Prevent multiple simultaneous fetches
    if (loading) return;
    
    try {
      setLoading(true);
      const response = await API.aiFollowup.getFollowupById(followupId);
      
      if (response.success) {
        // Handle different response structures
        const followup = response.data.followup || response.data;
        setFollowupData(followup);
      }
    } catch (error) {
      console.error('Error fetching AI follow-up data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSuggestion = async () => {
    if (!followupData || !message.metadata?.automationId) return;

    try {
      setGeneratingSuggestion(true);
      const response = await API.aiFollowup.generateFinalSuggestion(message.metadata.automationId);

      if (response.success) {
        // Refresh the follow-up data
        await fetchFollowupData(message.metadata.automationId);
      }
    } catch (error) {
      console.error('Error generating suggestion:', error);
    } finally {
      setGeneratingSuggestion(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle2 className="h-4 w-4" />;
    if (score >= 60) return <AlertCircle className="h-4 w-4" />;
    return <AlertCircle className="h-4 w-4" />;
  };

  const getSuggestionColor = (type: string) => {
    switch (type) {
      case 'hire':
      case 'interview': return 'bg-green-100 text-green-800 border-green-200';
      case 'maybe':
      case 'request_more_info': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'reject': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Regular message display for non-AI followup messages
  if (!message.metadata?.type || message.metadata.type !== 'ai_followup') {
    return null;
  }

  // For outbound AI follow-up messages, return null to show regular message display
  if (isOutbound) {
    return null;
  }

  // AI Follow-up Response (Inbound) with Scoring
  if (!isOutbound && followupData) {
    const hasResponses = followupData.responses && followupData.responses.length > 0;
    const isProcessed = followupData.processingStatus === 'analysis_complete';

    return (
      <Card className="w-full max-w-xl border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
        <CardHeader className="pb-2 pt-3 px-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="bg-purple-600 p-1.5 rounded-lg">
                <MessageSquare className="h-4 w-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold text-purple-900">AI Follow-up</CardTitle>
                <Badge variant="outline" className={`mt-0.5 text-xs ${
                  isProcessed
                    ? 'bg-green-100 text-green-700 border-green-300'
                    : 'bg-yellow-100 text-yellow-700 border-yellow-300'
                }`}>
                  {followupData.processingStatus === 'pending' && 'Sent'}
                  {followupData.processingStatus === 'questions_sent' && 'Waiting'}
                  {followupData.processingStatus === 'responses_received' && 'Processing'}
                  {followupData.processingStatus === 'analysis_complete' && `Analyzed`}
                  {followupData.processingStatus === 'failed' && 'Failed'}
                </Badge>
              </div>
            </div>

            {/* Show Details button */}
            {hasResponses && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(!expanded)}
                className="text-purple-600 h-7 px-2"
              >
                {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-2 pt-2 px-4 pb-3">
          {/* Compact processing status */}
          {!isProcessed && (
            <div className="flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 text-yellow-600" />
                <span className="text-xs text-yellow-800 font-medium">
                  {followupData.processingStatus === 'responses_received' ? 'Ready for AI analysis' : 'Waiting for response'}
                </span>
              </div>
              
              {/* Compact manual trigger button */}
              {(followupData.processingStatus === 'responses_received' || followupData.processingStatus === 'failed') && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleGenerateSuggestion}
                  disabled={generatingSuggestion}
                  className="h-6 px-2 text-xs bg-purple-600 hover:bg-purple-700"
                >
                  {generatingSuggestion ? (
                    <>
                      <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Star className="h-3 w-3 mr-1" />
                      Analyze
                    </>
                  )}
                </Button>
              )}
            </div>
          )}

          {/* Compact Score Summary */}
          {hasResponses && isProcessed && (
            <div className="bg-white px-3 py-2 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-700">Scores</span>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-purple-600" />
                  <span className="text-xs text-purple-600 font-semibold">
                    {Math.round(followupData.responses.reduce((sum, r) => sum + r.aiScore, 0) / followupData.responses.length)}/100
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                {followupData.responses.slice(0, 4).map((response, index) => (
                  <div key={index} className={`flex-1 px-2 py-1.5 rounded border ${getScoreColor(response.aiScore)} text-center`}>
                    <div className="flex items-center justify-center gap-1 mb-0.5">
                      {getScoreIcon(response.aiScore)}
                      <span className="text-[10px] font-semibold">Q{index + 1}</span>
                    </div>
                    <div className="text-lg font-bold">{response.aiScore}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Compact Detailed Responses */}
          {hasResponses && isProcessed && expanded && (
            <div className="space-y-2">
              {followupData.responses.map((response, index) => (
                <div key={index} className="bg-white p-3 rounded-lg border border-gray-200">
                  <div className="flex items-start gap-2 mb-2">
                    <div className="bg-purple-100 text-purple-700 rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 mb-1 line-clamp-2">{response.question}</p>
                      <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${getScoreColor(response.aiScore)}`}>
                        {getScoreIcon(response.aiScore)}
                        {response.aiScore}/100
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-2 rounded mb-2">
                    <p className="text-[10px] text-gray-600 font-medium mb-0.5">Answer:</p>
                    <p className="text-xs text-gray-900 line-clamp-2">{response.answer}</p>
                  </div>
                  
                  <div className="bg-blue-50 p-2 rounded">
                    <p className="text-[10px] text-blue-600 font-medium mb-0.5">AI Analysis:</p>
                    <p className="text-xs text-blue-900 line-clamp-2">{response.aiAnalysis}</p>
                  </div>
                </div>
              ))}

              {/* Compact Final AI Suggestion */}
              {followupData.finalSuggestion && (
                <div className="bg-white p-3 rounded-lg border border-indigo-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <Star className="h-3.5 w-3.5 text-indigo-600" />
                      <span className="text-xs font-semibold text-indigo-900">Recommendation</span>
                    </div>
                    <Badge className={`${getSuggestionColor(followupData.finalSuggestion.type)} border text-xs px-2 py-0`}>
                      {followupData.finalSuggestion.type.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  
                  <p className="text-xs text-gray-700 mb-2 line-clamp-2">{followupData.finalSuggestion.reasoning}</p>
                  
                  {followupData.finalSuggestion.keyStrengths && followupData.finalSuggestion.keyStrengths.length > 0 && (
                    <div className="text-[10px] text-green-600">
                      ✓ {followupData.finalSuggestion.keyStrengths.slice(0, 2).join(' • ')}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return null;
}

