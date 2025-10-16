import { useState, useMemo, useEffect } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  HelpCircle,
  Brain,
  MessageSquare,
  Calendar,
  Zap,
  Shield,
  DollarSign,
  Settings,
  FileText,
  ArrowRight,
  ChevronDown,
  Search,
  X
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSEO, addStructuredData, removeStructuredData } from "@/lib/hooks/useSEO";

const faqs = [
  {
    category: "Platform Overview",
    icon: HelpCircle,
    color: "bg-blue-500",
    questions: [
      {
        question: "What is HirePlan?",
        answer: "HirePlan is an AI-powered recruitment platform that revolutionizes hiring by automating candidate screening, evaluation, and communication. It uses advanced AI to match candidates to jobs with 95% accuracy, reducing hiring time from weeks to minutes while eliminating bias and improving quality of hire."
      },
      {
        question: "How does HirePlan differ from traditional ATS systems?",
        answer: "Unlike traditional ATS systems that simply store resumes, HirePlan uses AI to actively evaluate and score candidates based on job requirements, automatically communicate with applicants, schedule interviews, and provide data-driven hiring insights. It's a complete hiring automation platform rather than just a data storage system."
      },
      {
        question: "Who should use HirePlan?",
        answer: "HirePlan is ideal for companies of all sizes looking to streamline their hiring process. It's particularly valuable for growing companies (50-500 employees) that need to scale hiring without proportionally scaling their HR team, and for enterprises that want to improve hiring quality and reduce time-to-hire."
      },
      {
        question: "What industries does HirePlan support?",
        answer: "HirePlan supports all industries including technology, healthcare, finance, manufacturing, retail, hospitality, education, and professional services. The AI system adapts to any job type and industry requirements."
      }
    ]
  },
  {
    category: "AI & Automation",
    icon: Brain,
    color: "bg-purple-500",
    questions: [
      {
        question: "How does AI resume scoring work?",
        answer: "HirePlan's AI analyzes resumes using three main criteria: Qualifications (40% weight), Resume Analysis (30% weight), and Custom Questions (30% weight). The AI uses natural language processing to understand context, skills relevance, experience quality, and education fit. It provides scores from 0-100 and recommendation levels from 'Strong No' to 'Strong Yes'."
      },
      {
        question: "What is AI follow-up and how does it work?",
        answer: "AI follow-up allows recruiters to send custom questions to candidates and receive AI-powered analysis of responses. The system sends questions via email, tracks responses, and provides detailed scoring and recommendations based on candidate answers. This helps identify top talent beyond just resumes."
      },
      {
        question: "Can I customize AI scoring criteria?",
        answer: "Yes! Professional and Enterprise plans allow you to customize scoring weights, set minimum thresholds for automatic actions (acceptance, manual review, rejection), and create custom qualification categories. You can also define specific resume criteria for different job types."
      },
      {
        question: "How accurate is the AI matching?",
        answer: "HirePlan's AI achieves 95% accuracy in candidate-job matching, significantly outperforming manual screening. The system continuously learns from your hiring decisions to improve recommendations over time."
      },
      {
        question: "Does the AI eliminate bias in hiring?",
        answer: "Yes, the AI eliminates unconscious bias by focusing purely on job-related criteria and skills. It doesn't consider names, photos, demographics, or other protected characteristics. All evaluations are based solely on qualifications, experience, and job fit."
      }
    ]
  },
  {
    category: "Communication & Chat",
    icon: MessageSquare,
    color: "bg-green-500",
    questions: [
      {
        question: "How does the applicant portal work?",
        answer: "The applicant portal gives candidates a personalized dashboard to track their applications, communicate with recruiters, view interview schedules, and update their profiles. Applicants receive a unique link that logs them in automatically, providing a seamless experience without requiring account creation."
      },
      {
        question: "What communication features are available?",
        answer: "HirePlan supports multiple communication channels: Email (primary), SMS (for invitations and reminders), and a unified chat system that works across all channels. Recruiters can send personalized messages, interview invitations, and follow-ups automatically based on candidate status and automation rules."
      },
      {
        question: "How does SMS integration work?",
        answer: "SMS integration allows you to send interview invitations, reminders, and updates via text message. Candidates can opt-in to receive SMS notifications, and the system handles compliance with SMS regulations. SMS messages include unsubscribe options and are tracked for delivery status."
      },
      {
        question: "Can candidates respond to messages?",
        answer: "Yes! Candidates can reply to emails and SMS messages. The system automatically routes responses to the appropriate recruiter and maintains conversation history. The chat system works seamlessly whether candidates reply via email, SMS, or the applicant portal."
      },
      {
        question: "What are conversation aliases?",
        answer: "Conversation aliases are unique email addresses that allow seamless email communication between recruiters and candidates. When candidates reply to emails, their responses are automatically routed to the correct conversation thread, maintaining context and history."
      }
    ]
  },
  {
    category: "Interview Scheduling",
    icon: Calendar,
    color: "bg-orange-500",
    questions: [
      {
        question: "How does interview scheduling work?",
        answer: "Interview scheduling integrates with Google Calendar, Outlook, Zoom, and Teams. Recruiters set their availability, and the system automatically finds available time slots that work for both parties. Candidates can self-schedule interviews, and the system sends calendar invitations and meeting links automatically."
      },
      {
        question: "What video platforms are supported?",
        answer: "HirePlan supports Google Meet, Zoom, Microsoft Teams, and phone calls. The system automatically creates meeting links and calendar invitations based on your preferred platform. All meetings are tracked and synced with your calendar."
      },
      {
        question: "Can I customize interview availability?",
        answer: "Yes! You can set recurring availability (e.g., Monday-Friday 9 AM-5 PM) and specific date availability. The system prevents double-booking and respects time zone differences."
      },
      {
        question: "How do interview reminders work?",
        answer: "The system automatically sends SMS and email reminders 24 hours and 1 hour before interviews. Recruiters can also set custom reminder schedules. All reminders are tracked for delivery status and can be customized per job or candidate."
      },
      {
        question: "Can candidates reschedule interviews?",
        answer: "Yes, candidates can reschedule interviews through the applicant portal or by replying to invitation emails. The system automatically updates calendars, sends notifications to all parties, and prevents scheduling conflicts."
      }
    ]
  },
  {
    category: "Jobs & Applications",
    icon: FileText,
    color: "bg-blue-600",
    questions: [
      {
        question: "How do I create a job posting?",
        answer: "Job creation is a guided 6-step process: 1) Job Details, 2) Requirements & Benefits, 3) Qualifications, 4) AI Analysis Setup, 5) Posting & Budget, 6) Review & Publish. You can save drafts at any step and use templates for faster setup."
      },
      {
        question: "How does application tracking work?",
        answer: "All applications are automatically tracked with status updates, timestamps, and history. The system provides real-time dashboards showing application volume, conversion rates, and hiring metrics. You can filter applications by status, source, and criteria."
      },
      {
        question: "Can I use job templates?",
        answer: "Yes! You can save any job as a template for future use. Templates preserve all settings including qualifications, requirements, automation rules, and custom questions. This significantly speeds up job creation for similar positions."
      },
      {
        question: "How does the scoring system work?",
        answer: "Applications are scored on a 0-100 scale using AI analysis. Scores are categorized as: 80-100 (Strong Yes), 60-79 (Yes), 40-59 (Maybe), 20-39 (No), 0-19 (Strong No). You can customize score thresholds for automatic actions like shortlisting or rejection."
      }
    ]
  },
  {
    category: "Pricing & Plans",
    icon: DollarSign,
    color: "bg-green-600",
    questions: [
      {
        question: "What are the pricing plans?",
        answer: "Starter ($149/month): Up to 50 candidates, basic AI, 5 job postings. Professional ($249/month): Unlimited candidates, advanced AI, unlimited jobs, SMS, custom workflows. Enterprise (custom): Everything in Professional plus API access, white-label, dedicated support, and custom integrations."
      },
      {
        question: "What payment methods are accepted?",
        answer: "We accept all major credit cards (Visa, MasterCard, American Express, Discover) and ACH bank transfers for annual plans. Enterprise customers can also arrange custom billing terms and invoicing."
      },
      {
        question: "Can I change plans anytime?",
        answer: "Yes, you can upgrade or downgrade your plan at any time. Upgrades take effect immediately, and downgrades take effect at the next billing cycle. You'll be prorated for any changes made mid-cycle."
      },
    ]
  },
  {
    category: "Security & Privacy",
    icon: Shield,
    color: "bg-red-500",
    questions: [
      {
        question: "How secure is candidate data?",
        answer: "HirePlan uses enterprise-grade security with encryption for data protection. All data is encrypted at rest and in transit. We maintain strict access controls and follow industry best practices for data security."
      },
      {
        question: "Where is data stored?",
        answer: "All data is stored in secure cloud infrastructure with redundancy and backup procedures to ensure data availability and integrity."
      },
      {
        question: "Do you conduct background checks?",
        answer: "HirePlan does not conduct background checks. We provide integration options for third-party background check services, but all background screening must be handled through certified providers in compliance with FCRA regulations."
      }
    ]
  },
  {
    category: "Automation & Workflows",
    icon: Zap,
    color: "bg-yellow-500",
    questions: [
      {
        question: "What automations are available?",
        answer: "You can automate: welcome emails, status updates, interview invitations, SMS notifications, follow-up questions, rejection letters, and custom workflows based on application status, scores, or time triggers."
      },
      {
        question: "How do I set up automations?",
        answer: "Use the visual automation builder to create workflows. Set triggers (new application, status change, score threshold), conditions (score ranges, keywords, time delays), and actions (send email/SMS, update status, schedule interview)."
      },
      {
        question: "Can I use templates for automations?",
        answer: "Yes! HirePlan includes pre-built automation templates for common scenarios like 'Auto Interview for Shortlisted' or 'Welcome Email for New Applicants'. You can customize these templates or create entirely new ones."
      },
      {
        question: "How do time-based automations work?",
        answer: "You can schedule automations to run at specific times (e.g., send reminders 24 hours before interviews) or after time delays (e.g., follow up if no response in 3 days). All times respect the candidate's time zone."
      },
    ]
  },
  {
    category: "Support & Setup",
    icon: Settings,
    color: "bg-gray-500",
    questions: [
      {
        question: "How long does setup take?",
        answer: "Basic setup takes 5-10 minutes. Full configuration with custom automations and integrations typically takes 1-2 hours."
      },
      {
        question: "What support is included?",
        answer: "We offer email support for all plans. Professional and Enterprise plans include priority support with faster response times."
      },
      {
        question: "What integrations are available?",
        answer: "HirePlan integrates with Google Workspace (Google Calendar, Google Meet), Microsoft 365 (Outlook, Teams), and Zoom for video conferencing and scheduling. We also support SMS messaging and email communication."
      }
    ]
  }
];

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // SEO configuration
  useSEO({
    title: "FAQ - HirePlan | Frequently Asked Questions About AI Recruitment",
    description: "Get answers to common questions about HirePlan's AI-powered recruitment platform. Learn about features, pricing, integrations, security, and more.",
    keywords: "HirePlan FAQ, recruitment software questions, ATS help, hiring platform support, AI recruitment answers",
    ogTitle: "Frequently Asked Questions - HirePlan",
    ogDescription: "Get answers to common questions about HirePlan's AI-powered recruitment platform.",
    ogUrl: "https://hireplan.co/faq",
    ogImage: "https://hireplan.co/og-image-faq.png",
    canonical: "https://hireplan.co/faq",
  });

  // Add FAQ structured data
  useEffect(() => {
    const faqStructuredData = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.flatMap(category => 
        category.questions.map(faq => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer
          }
        }))
      )
    };

    addStructuredData(faqStructuredData, 'faq-structured-data');

    return () => {
      removeStructuredData('faq-structured-data');
    };
  }, []);

  // Filter FAQs based on search query
  const filteredFaqs = useMemo(() => {
    if (!searchQuery && !selectedCategory) return faqs;

    return faqs
      .map((category) => ({
        ...category,
        questions: category.questions.filter((faq) => {
          const matchesSearch = !searchQuery || 
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
          
          const matchesCategory = !selectedCategory || category.category === selectedCategory;
          
          return matchesSearch && matchesCategory;
        }),
      }))
      .filter((category) => category.questions.length > 0);
  }, [searchQuery, selectedCategory]);

  // Count total results
  const totalResults = filteredFaqs.reduce((acc, cat) => acc + cat.questions.length, 0);

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden w-full">
      {/* Hero Section */}
      <section className="bg-primary text-white py-8 sm:py-12 md:py-16 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 pointer-events-none"></div>
        <div className="absolute top-10 sm:top-20 right-5 sm:right-10 w-32 sm:w-64 h-32 sm:h-64 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 pointer-events-none"></div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6 border border-white/30">
            <HelpCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
            <span>Knowledge Base</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 tracking-tight px-4">
            Frequently Asked Questions
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed mb-6 sm:mb-8 px-4">
            Everything you need to know about HirePlan's AI-powered recruitment platform
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative px-2 sm:px-0">
            <Search className="absolute left-5 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 pointer-events-none" />
            <Input
              type="text"
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-6 text-sm sm:text-base bg-white text-gray-900 placeholder:text-gray-500 border-0 shadow-lg rounded-xl focus-visible:ring-2 focus-visible:ring-white/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-5 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Category Filter Pills */}
      <section className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm overflow-hidden">
        <div className="max-w-5xl mx-auto py-3 sm:py-4">
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto overflow-y-hidden scrollbar-hide px-4 sm:px-6 lg:px-8" style={{ WebkitOverflowScrolling: 'touch' }}>
            <Badge
              variant={selectedCategory === null ? "default" : "outline"}
              className={`cursor-pointer whitespace-nowrap px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm transition-all flex-shrink-0 ${
                selectedCategory === null
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => setSelectedCategory(null)}
            >
              All Categories
            </Badge>
            {faqs.map((category, index) => {
              const Icon = category.icon;
              return (
                <Badge
                  key={index}
                  variant={selectedCategory === category.category ? "default" : "outline"}
                  className={`cursor-pointer whitespace-nowrap px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 transition-all flex-shrink-0 ${
                    selectedCategory === category.category
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => setSelectedCategory(category.category)}
                >
                  <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  <span className="hidden sm:inline">{category.category}</span>
                  <span className="sm:hidden">{category.category.split(' ')[0]}</span>
                </Badge>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-6 sm:py-8 md:py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Results Count */}
          {(searchQuery || selectedCategory) && (
            <div className="mb-4 sm:mb-6 text-center">
              <p className="text-sm sm:text-base text-gray-600 px-4">
                Found <span className="font-semibold text-gray-900">{totalResults}</span> result{totalResults !== 1 ? 's' : ''}
                {searchQuery && <span className="block sm:inline"> for "<span className="text-blue-600 break-words">{searchQuery}</span>"</span>}
                {selectedCategory && <span className="block sm:inline"> in <span className="text-purple-600">{selectedCategory}</span></span>}
              </p>
            </div>
          )}

          {/* No Results */}
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12 sm:py-16 px-4">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-100 mb-3 sm:mb-4">
                <Search className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No results found</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 max-w-md mx-auto px-4">
                We couldn't find any FAQs matching your search. Try different keywords or browse all categories.
              </p>
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory(null);
                }}
                variant="outline"
                className="border-blue-200 hover:bg-blue-50 text-sm"
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {filteredFaqs.map((category, index) => (
                <Card key={index} className="shadow-sm border-0 hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
                    <CardTitle className="flex items-center justify-between gap-2 sm:gap-3 text-base sm:text-lg md:text-xl">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <div className={`p-1.5 sm:p-2 rounded-lg ${category.color} text-white flex-shrink-0`}>
                          <category.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                        </div>
                        <span className="truncate">{category.category}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs flex-shrink-0">
                        {category.questions.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 sm:px-6">
                    <div className="space-y-1">
                      {category.questions.map((faq, faqIndex) => (
                        <Collapsible key={faqIndex}>
                          <CollapsibleTrigger className="w-full text-left font-medium hover:text-blue-600 py-3 sm:py-4 px-3 sm:px-4 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all flex items-center justify-between group border border-transparent hover:border-blue-100 text-sm sm:text-base">
                            <span className="pr-3 sm:pr-4 leading-snug">{faq.question}</span>
                            <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180 text-gray-400 group-hover:text-blue-600" />
                          </CollapsibleTrigger>
                          <CollapsibleContent className="px-3 sm:px-4 pb-3 sm:pb-4">
                            <div className="text-sm sm:text-base text-gray-600 leading-relaxed pt-2 sm:pt-3 pl-3 sm:pl-4 border-l-2 border-blue-200 ml-2 sm:ml-4">
                              {faq.answer}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Contact CTA */}
          {filteredFaqs.length > 0 && (
            <Card className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 shadow-md">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Still have questions?
              </h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Our team is here to help you get the most out of HirePlan.
                Contact us for personalized support or to schedule a demo.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
                <Button variant="outline" className="border-blue-200 hover:bg-blue-50">
                  Schedule Demo
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}
