"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import useAuthSessionContext from "@/lib/context/AuthSessionContext";
import {
  Award,
  Brain,
  Briefcase,
  CheckCircle,
  FileText,
  Info,
  MessageSquare,
  Plus,
  RotateCcw,
  Settings,
  Star,
  Target,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { CustomQuestionsBuilder } from "./custom-questions-builder";

// Navigation items for AI Analysis step
const aiAnalysisNavItems = [
  {
    id: "resume-analysis",
    label: "Resume Analysis",
    icon: FileText,
    description: "Resume screening & criteria",
  },
  {
    id: "pre-screening",
    label: "Pre-Screening",
    icon: MessageSquare,
    description: "Custom questions",
  },
  {
    id: "evaluation",
    label: "Evaluation",
    icon: Brain,
    description: "Scoring & thresholds",
  },
];

export function AIAnalysisStep() {
  const { watch, setValue } = useFormContext();
  const { subscription } = useAuthSessionContext();
  const [newCriterion, setNewCriterion] = useState("");
  const [activeSection, setActiveSection] = useState<string>("resume-analysis");
  const [isScrolling, setIsScrolling] = useState(false);

  const hasAIFeatures =
    subscription?.planId === "professional" ||
    subscription?.planId === "enterprise";

  const resumeCriteria = watch("resumeCriteria") || [];
  const resumeAnalysisMode = watch("resumeAnalysisMode") || "simple";

  const [showWeightEditor, setShowWeightEditor] = useState(false);
  const [qualificationsWeight, setQualificationsWeight] = useState([40]);
  const [resumeWeight, setResumeWeight] = useState([30]);
  const [questionsWeight, setQuestionsWeight] = useState([30]);

  const qualifications = watch("qualifications") || [];
  const customQuestions = watch("customQuestions") || [];
  const automation = watch("automation") || {};

  const hasQualifications = qualifications.length > 0;
  const hasCustomQuestions = customQuestions.length > 0;
  const availableSections = [
    hasQualifications && "qualifications",
    "resume",
    hasCustomQuestions && "customQuestions",
  ].filter(Boolean);

  // Handle scroll and update active section
  useEffect(() => {
    const handleScroll = () => {
      let scrollContainer: HTMLElement | Window = window;
      const container = document.querySelector(
        ".overflow-y-auto"
      ) as HTMLElement;
      if (container) {
        scrollContainer = container;
      }

      const sections = aiAnalysisNavItems.map((item) => ({
        id: item.id,
        element: document.getElementById(item.id),
      }));

      const scrollTop =
        scrollContainer === window
          ? window.scrollY
          : (scrollContainer as HTMLElement).scrollTop;

      const headerOffset = 150;
      const threshold = scrollTop + headerOffset;

      let activeId = sections[0]?.id;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section.element) {
          let elementTop: number;

          if (scrollContainer === window) {
            elementTop = section.element.offsetTop;
          } else {
            const containerRect = (
              scrollContainer as HTMLElement
            ).getBoundingClientRect();
            const elementRect = section.element.getBoundingClientRect();
            const containerScrollTop = (scrollContainer as HTMLElement)
              .scrollTop;
            elementTop =
              containerScrollTop + (elementRect.top - containerRect.top);
          }

          if (threshold >= elementTop) {
            activeId = section.id;
            break;
          }
        }
      }

      if (!isScrolling) {
        setActiveSection(activeId);
      }
    };

    let timeoutId: NodeJS.Timeout;
    const throttledScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, 100);
    };

    const scrollContainer = document.querySelector(".overflow-y-auto");
    const targetElement = scrollContainer || window;

    targetElement.addEventListener("scroll", throttledScroll, {
      passive: true,
    });
    handleScroll();

    return () => {
      if (targetElement === window) {
        window.removeEventListener("scroll", throttledScroll);
      } else {
        (targetElement as HTMLElement).removeEventListener(
          "scroll",
          throttledScroll
        );
      }
      clearTimeout(timeoutId);
    };
  }, [isScrolling]);

  // Handle navigation click
  const handleNavClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    sectionId: string
  ) => {
    e.preventDefault();
    e.stopPropagation();

    setActiveSection(sectionId);

    setIsScrolling(true);
    const element = document.getElementById(sectionId);
    if (element) {
      const scrollContainer = document.querySelector(
        ".overflow-y-auto"
      ) as HTMLElement;
      const headerOffset = 100;

      if (scrollContainer) {
        const elementRect = element.getBoundingClientRect();
        const containerRect = scrollContainer.getBoundingClientRect();
        const relativeTop = elementRect.top - containerRect.top;
        const scrollPosition =
          scrollContainer.scrollTop + relativeTop - headerOffset;

        scrollContainer.scrollTo({
          top: Math.max(0, scrollPosition),
          behavior: "smooth",
        });
      } else {
        const elementTop = element.offsetTop;
        const offsetPosition = elementTop - headerOffset;

        window.scrollTo({
          top: Math.max(0, offsetPosition),
          behavior: "smooth",
        });
      }

      setTimeout(() => {
        setIsScrolling(false);
        const scrollContainer = document.querySelector(
          ".overflow-y-auto"
        ) as HTMLElement;
        const targetElement = scrollContainer || window;
        if (targetElement === window) {
          window.dispatchEvent(new Event("scroll"));
        } else {
          scrollContainer.dispatchEvent(new Event("scroll"));
        }
      }, 800);
    }
  };

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .slider-smooth [data-radix-slider-track] {
        transition: all 0.2s ease-out;
      }
      .slider-smooth [data-radix-slider-thumb] {
        transition: all 0.15s ease-out;
      }
      .slider-smooth [data-radix-slider-thumb]:hover {
        transform: scale(1.1);
      }
      .slider-smooth [data-radix-slider-thumb]:active {
        transform: scale(1.05);
      }
      .slider-smooth [data-radix-slider-range] {
        transition: all 0.2s ease-out;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    const sectionWeights = automation?.sectionWeights || {};

    if (availableSections.length === 1) {
      setQualificationsWeight([0]);
      setResumeWeight([100]);
      setQuestionsWeight([0]);
    } else if (availableSections.length === 2) {
      if (hasQualifications && hasCustomQuestions) {
        setQualificationsWeight([sectionWeights.qualifications || 50]);
        setResumeWeight([sectionWeights.resume || 0]);
        setQuestionsWeight([sectionWeights.customQuestions || 50]);
      } else if (hasQualifications) {
        setQualificationsWeight([sectionWeights.qualifications || 60]);
        setResumeWeight([sectionWeights.resume || 40]);
        setQuestionsWeight([sectionWeights.customQuestions || 0]);
      } else {
        setQualificationsWeight([sectionWeights.qualifications || 0]);
        setResumeWeight([sectionWeights.resume || 60]);
        setQuestionsWeight([sectionWeights.customQuestions || 40]);
      }
    } else {
      setQualificationsWeight([sectionWeights.qualifications || 40]);
      setResumeWeight([sectionWeights.resume || 30]);
      setQuestionsWeight([sectionWeights.customQuestions || 30]);
    }
  }, [
    automation,
    hasQualifications,
    hasCustomQuestions,
    availableSections.length,
  ]);

  const addCriterion = () => {
    if (newCriterion.trim()) {
      const newCrit = {
        text: newCriterion.trim(),
        type: "skill",
        aiCategory: hasAIFeatures ? "should" : undefined,
        weight: 1,
      };
      setValue("resumeCriteria", [...resumeCriteria, newCrit]);
      setNewCriterion("");
    }
  };

  const removeCriterion = (index: number) => {
    const updated = resumeCriteria.filter((_: any, i: number) => i !== index);
    setValue("resumeCriteria", updated);
  };

  const updateCriterionType = (index: number, type: string) => {
    const updated = resumeCriteria.map((crit: any, i: number) =>
      i === index ? { ...crit, type } : crit
    );
    setValue("resumeCriteria", updated);
  };

  const updateCriterionCategory = (index: number, aiCategory: string) => {
    const updated = resumeCriteria.map((crit: any, i: number) =>
      i === index ? { ...crit, aiCategory } : crit
    );
    setValue("resumeCriteria", updated);
  };

  const criteriaTemplates = [
    { text: "React.js", type: "skill" },
    { text: "Node.js", type: "skill" },
    { text: "TypeScript", type: "skill" },
    { text: "Project Management", type: "skill" },
    { text: "Team Leadership", type: "experience" },
    { text: "Healthcare Experience", type: "experience" },
  ];

  const addFromTemplate = (template: any) => {
    const newCrit = {
      text: template.text,
      type: template.type,
      aiCategory: hasAIFeatures ? "should" : undefined,
      weight: 1,
    };
    setValue("resumeCriteria", [...resumeCriteria, newCrit]);
  };

  const getTypeInfo = (type: string) => {
    const types = {
      skill: {
        label: "Skill",
        icon: Target,
        color: "bg-blue-50 text-blue-700 border-blue-200",
      },
      experience: {
        label: "Experience",
        icon: Briefcase,
        color: "bg-emerald-50 text-emerald-700 border-emerald-200",
      },
      education: {
        label: "Education",
        icon: Award,
        color: "bg-purple-50 text-purple-700 border-purple-200",
      },
      certification: {
        label: "Certification",
        icon: Award,
        color: "bg-amber-50 text-amber-700 border-amber-200",
      },
    };
    return types[type as keyof typeof types] || types.skill;
  };

  const balanceWeights = useCallback(
    (changedSection: string, newValue: number) => {
      const remaining = 100 - newValue;
      const activeSections = availableSections.filter(
        (section) => section !== changedSection
      );

      if (activeSections.length === 0) return;

      requestAnimationFrame(() => {
        if (activeSections.length === 1) {
          const otherSection = activeSections[0];
          if (otherSection === "qualifications") {
            setQualificationsWeight([remaining]);
          } else if (otherSection === "resume") {
            setResumeWeight([remaining]);
          } else if (otherSection === "customQuestions") {
            setQuestionsWeight([remaining]);
          }
        } else {
          const currentQual =
            changedSection === "qualifications"
              ? newValue
              : qualificationsWeight[0];
          const currentResume =
            changedSection === "resume" ? newValue : resumeWeight[0];
          const currentQuestions =
            changedSection === "questions" ? newValue : questionsWeight[0];

          if (changedSection === "qualifications") {
            if (hasCustomQuestions) {
              const total = currentResume + currentQuestions;
              if (total > 0) {
                const resumeRatio = currentResume / total;
                const newResumeWeight = Math.round(remaining * resumeRatio);
                const newQuestionsWeight = remaining - newResumeWeight;
                setResumeWeight([Math.max(5, newResumeWeight)]);
                setQuestionsWeight([Math.max(5, newQuestionsWeight)]);
              } else {
                setResumeWeight([Math.round(remaining / 2)]);
                setQuestionsWeight([remaining - Math.round(remaining / 2)]);
              }
            } else {
              setResumeWeight([remaining]);
            }
          } else if (changedSection === "resume") {
            if (hasQualifications && hasCustomQuestions) {
              const total = currentQual + currentQuestions;
              if (total > 0) {
                const qualRatio = currentQual / total;
                const newQualWeight = Math.round(remaining * qualRatio);
                const newQuestionsWeight = remaining - newQualWeight;
                setQualificationsWeight([Math.max(5, newQualWeight)]);
                setQuestionsWeight([Math.max(5, newQuestionsWeight)]);
              } else {
                setQualificationsWeight([Math.round(remaining / 2)]);
                setQuestionsWeight([remaining - Math.round(remaining / 2)]);
              }
            } else if (hasQualifications) {
              setQualificationsWeight([remaining]);
            } else {
              setQuestionsWeight([remaining]);
            }
          } else if (changedSection === "questions") {
            if (hasQualifications) {
              const total = currentQual + currentResume;
              if (total > 0) {
                const qualRatio = currentQual / total;
                const newQualWeight = Math.round(remaining * qualRatio);
                const newResumeWeight = remaining - newQualWeight;
                setQualificationsWeight([Math.max(5, newQualWeight)]);
                setResumeWeight([Math.max(5, newResumeWeight)]);
              } else {
                setQualificationsWeight([Math.round(remaining / 2)]);
                setResumeWeight([remaining - Math.round(remaining / 2)]);
              }
            } else {
              setResumeWeight([remaining]);
            }
          }
        }
      });
    },
    [
      availableSections,
      hasQualifications,
      hasCustomQuestions,
      qualificationsWeight,
      resumeWeight,
      questionsWeight,
    ]
  );

  const saveWeights = () => {
    setValue("automation", {
      ...automation,
      sectionWeights: {
        qualifications: qualificationsWeight[0],
        resume: resumeWeight[0],
        customQuestions: questionsWeight[0],
      },
    });
    setShowWeightEditor(false);
  };

  const resetWeights = () => {
    if (availableSections.length === 1) {
      setQualificationsWeight([0]);
      setResumeWeight([100]);
      setQuestionsWeight([0]);
    } else if (availableSections.length === 2) {
      if (hasQualifications && hasCustomQuestions) {
        setQualificationsWeight([50]);
        setResumeWeight([0]);
        setQuestionsWeight([50]);
      } else if (hasQualifications) {
        setQualificationsWeight([60]);
        setResumeWeight([40]);
        setQuestionsWeight([0]);
      } else {
        setQualificationsWeight([0]);
        setResumeWeight([60]);
        setQuestionsWeight([40]);
      }
    } else {
      setQualificationsWeight([40]);
      setResumeWeight([30]);
      setQuestionsWeight([30]);
    }
  };

  const qualStats = {
    total: qualifications.length,
    required: qualifications.filter((q: any) => q.isRequired).length,
    preferred: qualifications.filter((q: any) => !q.isRequired).length,
    need: qualifications.filter((q: any) => q.aiCategory === "need").length,
    should: qualifications.filter((q: any) => q.aiCategory === "should").length,
    nice: qualifications.filter((q: any) => q.aiCategory === "nice").length,
  };

  const questionStats = {
    total: customQuestions.length,
    required: customQuestions.filter((q: any) => q.required).length,
    autoReject: customQuestions.filter((q: any) => q.autoReject).length,
    simpleMode: customQuestions.filter((q: any) => q.scoringMode === "simple")
      .length,
    advancedMode: customQuestions.filter(
      (q: any) => q.scoringMode === "advanced"
    ).length,
    withWeights: customQuestions.filter(
      (q: any) => q.scoringMode === "advanced" && q.weight
    ).length,
  };

  const resumeStats = {
    mode: resumeAnalysisMode,
    criteriaCount: resumeCriteria.length,
    skillsCriteria: resumeCriteria.filter((c: any) => c.type === "skill")
      .length,
    experienceCriteria: resumeCriteria.filter(
      (c: any) => c.type === "experience"
    ).length,
  };

  if (!hasAIFeatures) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">AI Analysis</h2>
          <p className="text-gray-600 mt-1">
            Professional features require upgrade
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 text-center border border-gray-200 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl hover:border-blue-300 transition-all">
            <Brain className="w-12 h-12 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">
              Resume Analysis
            </h3>
            <p className="text-sm text-gray-600">
              Intelligent resume screening with AI-powered matching
            </p>
          </div>

          <div className="p-5 text-center border border-gray-200 bg-gradient-to-br from-slate-50 to-purple-50 rounded-xl hover:border-purple-300 transition-all">
            <Star className="w-12 h-12 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Smart Scoring</h3>
            <p className="text-sm text-gray-600">
              Advanced evaluation with configurable weighting
            </p>
          </div>
        </div>

        <div className="p-6 text-center border border-gray-200 bg-gradient-to-r from-blue-50 via-slate-50 to-purple-50 rounded-xl">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Brain className="w-6 h-6 text-blue-600" />
            <Star className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Upgrade to Professional
          </h3>
          <p className="text-gray-600 mb-4">
            Unlock AI-powered hiring automation
          </p>
          <Button className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2 rounded-lg">
            Upgrade Now
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900">AI Analysis</h2>
        <p className="text-gray-600 mt-1">
          Configure intelligent candidate evaluation
        </p>
      </div>

      <div className="flex gap-4">
        {/* Sidebar Navigation - Desktop Only */}
        <aside className="hidden lg:block w-52 flex-shrink-0">
          <div className="sticky top-24">
            <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
              <div className="mb-2.5">
                <h3 className="text-xs font-semibold text-gray-900 mb-0.5">
                  Quick Navigation
                </h3>
                <p className="text-[10px] text-gray-500">Jump to any section</p>
              </div>
              <nav className="space-y-0.5">
                {aiAnalysisNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={(e) => handleNavClick(e, item.id)}
                      className={`w-full text-left p-2 rounded-md transition-all duration-300 ease-in-out group cursor-pointer ${
                        isActive
                          ? "bg-blue-50 border border-blue-200 text-blue-900 shadow-sm"
                          : "text-gray-700 hover:bg-gray-50 border border-transparent"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div
                          className={`p-1 rounded-md flex-shrink-0 mt-0.5 transition-all duration-300 ease-in-out ${
                            isActive
                              ? "bg-blue-100 text-blue-600"
                              : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5 transition-transform duration-300 ease-in-out group-hover:scale-110" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div
                            className={`text-xs font-medium mb-0.5 transition-colors duration-300 ease-in-out ${
                              isActive ? "text-blue-900" : "text-gray-900"
                            }`}
                          >
                            {item.label}
                          </div>
                          <div
                            className={`text-[10px] leading-tight transition-colors duration-300 ease-in-out ${
                              isActive ? "text-blue-700" : "text-gray-500"
                            }`}
                          >
                            {item.description}
                          </div>
                        </div>
                        {isActive && (
                          <div className="w-1 h-1 rounded-full bg-blue-600 flex-shrink-0 mt-1.5 transition-opacity duration-300 ease-in-out"></div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Section 1: Resume Analysis */}
          <section id="resume-analysis" className="scroll-mt-24">
            <div className="border border-gray-200 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-900">
                  Resume Analysis
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div
                  className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    resumeAnalysisMode === "simple"
                      ? "border-blue-500 bg-white"
                      : "border-gray-200 hover:border-blue-300 bg-white/70"
                  }`}
                  onClick={() => setValue("resumeAnalysisMode", "simple")}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        resumeAnalysisMode === "simple"
                          ? "bg-blue-500"
                          : "bg-gray-300"
                      }`}
                    />
                    <span className="text-sm font-medium">Smart Mode</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Automatic analysis • Zero setup
                  </p>
                </div>

                <div
                  className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    resumeAnalysisMode === "detailed"
                      ? "border-purple-500 bg-white"
                      : "border-gray-200 hover:border-purple-300 bg-white/70"
                  }`}
                  onClick={() => setValue("resumeAnalysisMode", "detailed")}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        resumeAnalysisMode === "detailed"
                          ? "bg-purple-500"
                          : "bg-gray-300"
                      }`}
                    />
                    <span className="text-sm font-medium">Advanced Mode</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Custom criteria • Fine control
                  </p>
                </div>
              </div>
            </div>

            {resumeAnalysisMode === "simple" && (
              <div className="border border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-4 text-center">
                <div className="inline-flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                    <Brain className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-semibold text-emerald-900">
                    AI Ready
                  </span>
                </div>
                <p className="text-sm text-emerald-700">
                  Intelligent analysis based on job requirements
                </p>
              </div>
            )}

            {resumeAnalysisMode === "detailed" && (
              <>
                <div className="border border-gray-200 bg-white rounded-xl">
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="w-5 h-5 text-purple-600" />
                          <span className="font-medium text-gray-900">
                            Resume Criteria
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">
                          Define specific skills, experiences, education, or
                          certifications that AI should look for when analyzing
                          candidate resumes. The AI will score candidates based
                          on how well their resumes match these criteria.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 space-y-4">
                    {/* Information Banner */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="space-y-1.5 text-xs text-blue-800">
                          <p className="font-medium">How it works:</p>
                          <ul className="space-y-1 ml-2">
                            <li>
                              • Add specific criteria (e.g., "5 years React
                              experience", "AWS Certification")
                            </li>
                            <li>
                              • Set the type (Skill, Experience, Education,
                              Certification)
                            </li>
                            <li>
                              • Choose AI priority:{" "}
                              <span className="font-semibold text-red-600">
                                Need
                              </span>{" "}
                              (auto-reject if missing),{" "}
                              <span className="font-semibold text-amber-600">
                                Should
                              </span>{" "}
                              (important), or{" "}
                              <span className="font-semibold text-emerald-600">
                                Nice
                              </span>{" "}
                              (preferred)
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Input
                          placeholder="e.g., 5+ years React.js, AWS Certification, Master's in CS..."
                          value={newCriterion}
                          onChange={(e) => setNewCriterion(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addCriterion();
                            }
                          }}
                          className="text-sm rounded-lg"
                        />
                        <p className="text-xs text-gray-500 mt-1 ml-1">
                          Press Enter or click Add to include this criterion
                        </p>
                      </div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            size="sm"
                            onClick={addCriterion}
                            disabled={!newCriterion.trim()}
                            className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-4"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p className="text-xs">
                            Add this criterion to resume analysis
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>

                    {criteriaTemplates.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-700 mb-2">
                          Quick Add Templates:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {criteriaTemplates.map((template, index) => (
                            <Tooltip key={index}>
                              <TooltipTrigger asChild>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="text-xs h-7 px-3 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-md"
                                  onClick={() => addFromTemplate(template)}
                                >
                                  + {template.text}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <p className="text-xs">
                                  Click to add "{template.text}" as a{" "}
                                  {template.type}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          ))}
                        </div>
                      </div>
                    )}

                    {resumeCriteria.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-medium text-gray-700">
                            Your Resume Criteria ({resumeCriteria.length})
                          </p>
                        </div>
                        <div className="space-y-2">
                          {resumeCriteria.map(
                            (criterion: any, index: number) => {
                              const typeInfo = getTypeInfo(criterion.type);
                              return (
                                <div
                                  key={index}
                                  className="flex items-center gap-3 p-3 bg-slate-50 border border-gray-200 rounded-lg hover:bg-slate-100 transition-colors"
                                >
                                  <typeInfo.icon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                  <span className="font-medium flex-1 min-w-0 truncate text-sm">
                                    {criterion.text}
                                  </span>
                                  <span
                                    className={`px-2 py-1 rounded-md text-xs font-medium border flex-shrink-0 ${typeInfo.color}`}
                                  >
                                    {typeInfo.label}
                                  </span>

                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div>
                                        <Select
                                          value={criterion.type || "skill"}
                                          onValueChange={(value) =>
                                            updateCriterionType(index, value)
                                          }
                                        >
                                          <SelectTrigger className="h-7 w-24 text-xs rounded-md">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent className="rounded-lg">
                                            <SelectItem value="skill">
                                              <div className="flex items-center gap-2">
                                                <Target className="w-3 h-3" />
                                                Skill
                                              </div>
                                            </SelectItem>
                                            <SelectItem value="experience">
                                              <div className="flex items-center gap-2">
                                                <Briefcase className="w-3 h-3" />
                                                Experience
                                              </div>
                                            </SelectItem>
                                            <SelectItem value="education">
                                              <div className="flex items-center gap-2">
                                                <Award className="w-3 h-3" />
                                                Education
                                              </div>
                                            </SelectItem>
                                            <SelectItem value="certification">
                                              <div className="flex items-center gap-2">
                                                <Award className="w-3 h-3" />
                                                Certification
                                              </div>
                                            </SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent
                                      side="top"
                                      className="max-w-xs"
                                    >
                                      <p className="text-xs mb-1 font-medium">
                                        Criterion Type:
                                      </p>
                                      <ul className="text-xs space-y-1">
                                        <li>
                                          • <strong>Skill:</strong> Technical or
                                          soft skills (e.g., "React.js",
                                          "Leadership")
                                        </li>
                                        <li>
                                          • <strong>Experience:</strong> Work
                                          experience (e.g., "5 years in
                                          healthcare")
                                        </li>
                                        <li>
                                          • <strong>Education:</strong> Degree
                                          or academic qualifications
                                        </li>
                                        <li>
                                          • <strong>Certification:</strong>{" "}
                                          Professional certifications or
                                          licenses
                                        </li>
                                      </ul>
                                    </TooltipContent>
                                  </Tooltip>

                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div>
                                        <Select
                                          value={
                                            criterion.aiCategory || "should"
                                          }
                                          onValueChange={(value) =>
                                            updateCriterionCategory(
                                              index,
                                              value
                                            )
                                          }
                                        >
                                          <SelectTrigger className="h-7 w-24 text-xs rounded-md">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent className="rounded-lg">
                                            <SelectItem value="need">
                                              <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-red-500 rounded-full" />
                                                Need
                                              </div>
                                            </SelectItem>
                                            <SelectItem value="should">
                                              <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-amber-500 rounded-full" />
                                                Should
                                              </div>
                                            </SelectItem>
                                            <SelectItem value="nice">
                                              <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                                                Nice
                                              </div>
                                            </SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent
                                      side="top"
                                      className="max-w-xs"
                                    >
                                      <p className="text-xs mb-1 font-medium">
                                        AI Evaluation Priority:
                                      </p>
                                      <ul className="text-xs space-y-1">
                                        <li>
                                          <span className="font-semibold text-red-600">
                                            Need:
                                          </span>{" "}
                                          Critical - Candidates without this are
                                          auto-rejected
                                        </li>
                                        <li>
                                          <span className="font-semibold text-amber-600">
                                            Should:
                                          </span>{" "}
                                          Important - Significantly impacts
                                          candidate scoring
                                        </li>
                                        <li>
                                          <span className="font-semibold text-emerald-600">
                                            Nice:
                                          </span>{" "}
                                          Preferred - Bonus points if present,
                                          but not essential
                                        </li>
                                      </ul>
                                    </TooltipContent>
                                  </Tooltip>

                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeCriterion(index)}
                                        className="h-7 w-7 p-0 text-gray-400 hover:text-red-600 rounded-md flex-shrink-0"
                                      >
                                        <X className="w-4 h-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                      <p className="text-xs">
                                        Remove this criterion
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                              );
                            }
                          )}
                        </div>
                      </div>
                    )}

                    {resumeCriteria.length === 0 && (
                      <div className="p-6 text-center border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                        <Target className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          No resume criteria added yet
                        </p>
                        <p className="text-xs text-gray-600 mb-4 max-w-md mx-auto">
                          Start by adding specific skills, experiences,
                          education, or certifications that are important for
                          this position. AI will analyze candidate resumes and
                          score them based on these criteria.
                        </p>
                        <div className="text-xs text-gray-500 space-y-1">
                          <p className="font-medium">Examples:</p>
                          <ul className="space-y-0.5">
                            <li>• "5+ years React.js experience"</li>
                            <li>• "AWS Certified Solutions Architect"</li>
                            <li>• "Master's degree in Computer Science"</li>
                            <li>• "Team leadership experience"</li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {resumeCriteria.length > 0 && (
                  <div className="border border-purple-200 bg-gradient-to-r from-purple-50 to-slate-50 rounded-xl p-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-3 bg-white border border-red-200 rounded-lg">
                        <div className="text-xl font-bold text-red-600">
                          {
                            resumeCriteria.filter(
                              (c: any) => c.aiCategory === "need"
                            ).length
                          }
                        </div>
                        <div className="text-xs font-medium text-red-700 mt-1">
                          Critical
                        </div>
                      </div>
                      <div className="text-center p-3 bg-white border border-amber-200 rounded-lg">
                        <div className="text-xl font-bold text-amber-600">
                          {
                            resumeCriteria.filter(
                              (c: any) => c.aiCategory === "should"
                            ).length
                          }
                        </div>
                        <div className="text-xs font-medium text-amber-700 mt-1">
                          Important
                        </div>
                      </div>
                      <div className="text-center p-3 bg-white border border-emerald-200 rounded-lg">
                        <div className="text-xl font-bold text-emerald-600">
                          {
                            resumeCriteria.filter(
                              (c: any) => c.aiCategory === "nice"
                            ).length
                          }
                        </div>
                        <div className="text-xs font-medium text-emerald-700 mt-1">
                          Preferred
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </section>

          {/* Section 2: Pre-Screening Questions */}
          <section id="pre-screening" className="scroll-mt-24">
            <div className="border border-gray-200 bg-white rounded-xl">
              <div className="p-4 sm:p-5 border-b border-gray-100">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 bg-emerald-50 rounded-lg">
                        <MessageSquare className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 text-base">
                          Pre-Screening Questions
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Ask candidates specific questions before they apply
                        </p>
                      </div>
                    </div>
                  </div>
                  {customQuestions && customQuestions.length > 0 && (
                    <Badge
                      variant="secondary"
                      className="bg-emerald-100 text-emerald-700 border-emerald-200 font-medium"
                    >
                      {customQuestions.length} / 5
                    </Badge>
                  )}
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="space-y-1.5 text-xs text-blue-800">
                      <p className="font-medium">
                        Benefits of pre-screening questions:
                      </p>
                      <ul className="space-y-1 ml-2">
                        <li>
                          • Filter candidates early in the application process
                        </li>
                        <li>
                          • Ensure candidates meet basic requirements before
                          review
                        </li>
                        <li>
                          • Save time by auto-rejecting unqualified applicants
                        </li>
                        <li>
                          • Use question responses in AI candidate scoring
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4 sm:p-5">
                <CustomQuestionsBuilder
                  name="customQuestions"
                  label=""
                  description=""
                />
              </div>
            </div>
          </section>

          {/* Section 3: Evaluation Overview */}
          <section id="evaluation" className="scroll-mt-24">
            <div className="border-t border-gray-200 pt-4 space-y-4">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-medium text-gray-900">
                  Evaluation Overview
                </h3>
              </div>

              <div className="border border-gray-200 bg-white rounded-xl">
                <div className="p-4 border-b border-gray-100">
                  <span className="font-medium text-gray-900">
                    Configuration Summary
                  </span>
                  <p className="text-sm text-gray-600 mt-1">
                    Your AI scoring setup
                  </p>
                </div>
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border border-blue-200 bg-gradient-to-br from-blue-50 to-slate-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">
                          Qualifications
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Critical</span>
                          <Badge
                            variant="outline"
                            className="bg-red-50 text-red-700 border-red-200 rounded-md"
                          >
                            {qualStats.need}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Important</span>
                          <Badge
                            variant="outline"
                            className="bg-amber-50 text-amber-700 border-amber-200 rounded-md"
                          >
                            {qualStats.should}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Preferred</span>
                          <Badge
                            variant="outline"
                            className="bg-emerald-50 text-emerald-700 border-emerald-200 rounded-md"
                          >
                            {qualStats.nice}
                          </Badge>
                        </div>
                      </div>
                      <Progress
                        value={
                          (qualStats.total / Math.max(qualStats.total, 1)) * 100
                        }
                        className="h-2 mt-3"
                      />
                      <p className="text-xs text-blue-700 font-medium mt-1">
                        {qualStats.total} total
                      </p>
                    </div>

                    <div className="border border-purple-200 bg-gradient-to-br from-purple-50 to-slate-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-900">
                          Questions
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Simple AI</span>
                          <Badge
                            variant="outline"
                            className="bg-emerald-50 text-emerald-700 border-emerald-200 rounded-md"
                          >
                            {questionStats.simpleMode}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Advanced</span>
                          <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-700 border-blue-200 rounded-md"
                          >
                            {questionStats.advancedMode}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Required</span>
                          <Badge
                            variant="outline"
                            className="bg-amber-50 text-amber-700 border-amber-200 rounded-md"
                          >
                            {questionStats.required}
                          </Badge>
                        </div>
                      </div>
                      <Progress
                        value={(questionStats.total / 5) * 100}
                        className="h-2 mt-3"
                      />
                      <p className="text-xs text-purple-700 font-medium mt-1">
                        {questionStats.total}/5 questions
                      </p>
                    </div>

                    <div className="border border-emerald-200 bg-gradient-to-br from-emerald-50 to-slate-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm font-medium text-emerald-900">
                          Resume
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Mode</span>
                          <Badge
                            variant="outline"
                            className={`rounded-md text-xs ${
                              resumeStats.mode === "simple"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-purple-50 text-purple-700 border-purple-200"
                            }`}
                          >
                            {resumeStats.mode === "simple"
                              ? "Smart"
                              : "Advanced"}
                          </Badge>
                        </div>
                        {resumeStats.mode === "detailed" && (
                          <>
                            <div className="flex justify-between text-xs">
                              <span>Skills</span>
                              <Badge
                                variant="outline"
                                className="bg-blue-50 text-blue-700 border-blue-200 rounded-md"
                              >
                                {resumeStats.skillsCriteria}
                              </Badge>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span>Experience</span>
                              <Badge
                                variant="outline"
                                className="bg-emerald-50 text-emerald-700 border-emerald-200 rounded-md"
                              >
                                {resumeStats.experienceCriteria}
                              </Badge>
                            </div>
                          </>
                        )}
                      </div>
                      <Progress
                        value={
                          resumeStats.mode === "simple"
                            ? 100
                            : (resumeStats.criteriaCount / 10) * 100
                        }
                        className="h-2 mt-3"
                      />
                      {resumeStats.mode === "detailed" && (
                        <p className="text-xs text-emerald-700 font-medium mt-1">
                          {resumeStats.criteriaCount} criteria
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="border border-gray-200 bg-slate-50 rounded-lg">
                    <div className="p-3 border-b border-gray-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Brain className="w-4 h-4 text-slate-700" />
                        <span className="font-medium text-gray-900">
                          AI Evaluation Process
                        </span>
                      </div>
                      {availableSections.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowWeightEditor(!showWeightEditor)}
                          className="h-7 px-3 text-xs rounded-md border-slate-300 hover:bg-slate-100"
                        >
                          <Settings className="w-3 h-3 mr-1" />
                          {showWeightEditor ? "Hide" : "Configure"} Weights
                        </Button>
                      )}
                    </div>
                    <div className="p-3">
                      {showWeightEditor && (
                        <div className="bg-white border border-gray-200 rounded-lg p-3 mb-3">
                          <div className="space-y-3">
                            {hasQualifications && (
                              <div className="flex items-center gap-3">
                                <Label className="text-sm text-gray-900 w-24">
                                  Qualifications
                                </Label>
                                <Slider
                                  value={qualificationsWeight}
                                  onValueChange={(value) => {
                                    setQualificationsWeight(value);
                                    balanceWeights("qualifications", value[0]);
                                  }}
                                  min={5}
                                  max={90}
                                  step={1}
                                  className="flex-1 slider-smooth"
                                />
                                <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-md w-16 text-center font-medium">
                                  {qualificationsWeight[0]}%
                                </span>
                              </div>
                            )}

                            <div className="flex items-center gap-3">
                              <Label className="text-sm text-gray-900 w-24">
                                Resume
                              </Label>
                              <Slider
                                value={resumeWeight}
                                onValueChange={(value) => {
                                  setResumeWeight(value);
                                  balanceWeights("resume", value[0]);
                                }}
                                min={5}
                                max={90}
                                step={1}
                                className="flex-1 slider-smooth"
                              />
                              <span className="text-sm bg-purple-100 text-purple-800 px-3 py-1 rounded-md w-16 text-center font-medium">
                                {resumeWeight[0]}%
                              </span>
                            </div>

                            {hasCustomQuestions && (
                              <div className="flex items-center gap-3">
                                <Label className="text-sm text-gray-900 w-24">
                                  Questions
                                </Label>
                                <Slider
                                  value={questionsWeight}
                                  onValueChange={(value) => {
                                    setQuestionsWeight(value);
                                    balanceWeights("questions", value[0]);
                                  }}
                                  min={5}
                                  max={90}
                                  step={1}
                                  className="flex-1 slider-smooth"
                                />
                                <span className="text-sm bg-emerald-100 text-emerald-800 px-3 py-1 rounded-md w-16 text-center font-medium">
                                  {questionsWeight[0]}%
                                </span>
                              </div>
                            )}

                            <div className="flex gap-3 pt-2 border-t border-gray-200">
                              <Button
                                type="button"
                                size="sm"
                                onClick={saveWeights}
                                className="flex-1 h-8 text-sm bg-slate-900 hover:bg-slate-800 rounded-md"
                              >
                                Save Configuration
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={resetWeights}
                                className="h-8 text-sm px-4 rounded-md"
                              >
                                <RotateCcw className="w-4 h-4 mr-1" />
                                Reset
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      <div
                        className={`grid gap-3 ${
                          availableSections.length === 1
                            ? "grid-cols-1"
                            : availableSections.length === 2
                            ? "grid-cols-2"
                            : "grid-cols-3"
                        }`}
                      >
                        {hasQualifications && (
                          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-lg">
                            <div className="w-8 h-8 bg-blue-600 rounded-full text-white text-sm font-bold flex items-center justify-center mx-auto mb-2">
                              1
                            </div>
                            <h4 className="text-sm font-semibold text-blue-900 mb-1">
                              Qualifications
                            </h4>
                            <p className="text-xs text-blue-700 mb-2">
                              Auto-filtering
                            </p>
                            <div className="text-lg font-bold text-blue-600">
                              {qualificationsWeight[0]}%
                            </div>
                          </div>
                        )}

                        <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-white border border-purple-200 rounded-lg">
                          <div className="w-8 h-8 bg-purple-600 rounded-full text-white text-sm font-bold flex items-center justify-center mx-auto mb-2">
                            {hasQualifications ? "2" : "1"}
                          </div>
                          <h4 className="text-sm font-semibold text-purple-900 mb-1">
                            Resume
                          </h4>
                          <p className="text-xs text-purple-700 mb-2">
                            {resumeStats.mode === "simple"
                              ? "Smart analysis"
                              : "Custom matching"}
                          </p>
                          <div className="text-lg font-bold text-purple-600">
                            {resumeWeight[0]}%
                          </div>
                        </div>

                        {hasCustomQuestions && (
                          <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-white border border-emerald-200 rounded-lg">
                            <div className="w-8 h-8 bg-emerald-600 rounded-full text-white text-sm font-bold flex items-center justify-center mx-auto mb-2">
                              {hasQualifications ? "3" : "2"}
                            </div>
                            <h4 className="text-sm font-semibold text-emerald-900 mb-1">
                              Questions
                            </h4>
                            <p className="text-xs text-emerald-700 mb-2">
                              Custom scoring
                            </p>
                            <div className="text-lg font-bold text-emerald-600">
                              {questionsWeight[0]}%
                            </div>
                          </div>
                        )}
                      </div>

                      {/* <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                        <p className="text-sm font-medium text-slate-900 mb-2">
                          Evaluation Steps:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-xs">
                          <div className="text-center p-2 bg-white border border-slate-200 rounded-md">
                            <div className="font-medium text-slate-700">
                              1. Filter
                            </div>
                            <div className="text-slate-600">Auto-reject</div>
                          </div>
                          <div className="text-center p-2 bg-white border border-slate-200 rounded-md">
                            <div className="font-medium text-slate-700">
                              2. Score
                            </div>
                            <div className="text-slate-600">Each section</div>
                          </div>
                          <div className="text-center p-2 bg-white border border-slate-200 rounded-md">
                            <div className="font-medium text-slate-700">
                              3. Weight
                            </div>
                            <div className="text-slate-600">Combine scores</div>
                          </div>
                          <div className="text-center p-2 bg-white border border-slate-200 rounded-md">
                            <div className="font-medium text-slate-700">
                              4. Rank
                            </div>
                            <div className="text-slate-600">Generate level</div>
                          </div>
                          <div className="text-center p-2 bg-white border border-slate-200 rounded-md">
                            <div className="font-medium text-slate-700">
                              5. Review
                            </div>
                            <div className="text-slate-600">Human decision</div>
                          </div>
                        </div>
                      </div> */}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 bg-slate-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-4 h-4 text-slate-700" />
                  <span className="font-medium text-gray-900">
                    Decision Thresholds
                  </span>
                </div>

                <div className="space-y-3">
                  <div
                    className="relative h-6 bg-gradient-to-r from-red-100 via-amber-100 to-emerald-100 rounded-md border border-gray-200 cursor-pointer"
                    onClick={(e) => {
                      if (
                        (e.target as HTMLElement).closest(".threshold-handle")
                      )
                        return;
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const percentage = Math.round((x / rect.width) * 100);

                      if (percentage <= 40) {
                        setValue(
                          "automation.autoRejectThreshold",
                          Math.max(0, Math.min(40, percentage))
                        );
                      } else if (percentage <= 90) {
                        setValue(
                          "automation.manualReviewThreshold",
                          Math.max(30, Math.min(95, percentage))
                        );
                        // Accept threshold is always exactly 5% above review threshold unless review threshold is at 95+
                        setValue(
                          "automation.acceptanceThreshold",
                          Math.max(
                            Math.min(100, Math.round(percentage + 5)),
                            Math.round(percentage + 5)
                          )
                        );
                      } else {
                        setValue(
                          "automation.acceptanceThreshold",
                          Math.max(95, Math.min(100, percentage))
                        );
                        setValue(
                          "automation.manualReviewThreshold",
                          Math.min(Math.max(30, percentage - 5), 95)
                        );
                      }
                    }}
                  >
                    {/* Reject Segment */}
                    <div
                      className="absolute top-0 left-0 h-full bg-red-400 rounded-l-md transition-all duration-300"
                      style={{
                        width: `${automation?.autoRejectThreshold || 25}%`,
                      }}
                    />
                    {/* Review Segment, always 5% gap to Accept */}
                    <div
                      className="absolute top-0 h-full bg-amber-400 transition-all duration-300"
                      style={{
                        left: `${automation?.autoRejectThreshold || 25}%`,
                        width: `${
                          (automation?.manualReviewThreshold || 70) -
                          (automation?.autoRejectThreshold || 25)
                        }%`,
                      }}
                    />
                    {/* Accept Segment, always starts exactly 5% after review */}
                    <div
                      className="absolute top-0 h-full bg-emerald-400 rounded-r-md transition-all duration-300"
                      style={{
                        left: `${
                          automation?.acceptanceThreshold ||
                          (automation?.manualReviewThreshold || 70) + 5
                        }%`,
                        width: `${
                          100 -
                          (automation?.acceptanceThreshold ||
                            (automation?.manualReviewThreshold || 70) + 5)
                        }%`,
                      }}
                    />

                    {/* Reject Handle */}
                    <div
                      className="threshold-handle reject-threshold absolute -top-1 h-8 w-4 z-30 cursor-grab active:cursor-grabbing hover:scale-110 transition-transform"
                      style={{
                        left: `calc(${
                          automation?.autoRejectThreshold || 25
                        }% - 8px)`,
                      }}
                      title={`Auto Reject: ${
                        automation?.autoRejectThreshold || 25
                      }%`}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        const bar = e.currentTarget.parentElement;
                        if (!bar) return;

                        document.body.style.userSelect = "none";
                        document.body.style.cursor = "grabbing";

                        const handleMouseMove = (moveEvent: MouseEvent) => {
                          moveEvent.preventDefault();
                          const rect = bar.getBoundingClientRect();
                          const x = moveEvent.clientX - rect.left;
                          const percentage = Math.round((x / rect.width) * 100);
                          const clampedValue = Math.max(
                            0,
                            Math.min(40, percentage)
                          );
                          setValue(
                            "automation.autoRejectThreshold",
                            clampedValue
                          );
                        };

                        const handleMouseUp = () => {
                          document.removeEventListener(
                            "mousemove",
                            handleMouseMove
                          );
                          document.removeEventListener(
                            "mouseup",
                            handleMouseUp
                          );
                          document.body.style.userSelect = "";
                          document.body.style.cursor = "";
                        };

                        document.addEventListener("mousemove", handleMouseMove);
                        document.addEventListener("mouseup", handleMouseUp);
                      }}
                    >
                      <div className="absolute top-1 left-1/2 w-1 h-6 bg-white rounded-full transform -translate-x-1/2" />
                      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-5 h-5 bg-red-600 rounded-full border-2 border-white flex items-center justify-center">
                        <X className="w-3 h-3 text-white" />
                      </div>
                    </div>

                    {/* Review Handle - uses a different icon (Eye if possible, else Star) */}
                    <div
                      className="threshold-handle review-threshold absolute -top-1 h-8 w-4 z-30 cursor-grab active:cursor-grabbing hover:scale-110 transition-transform"
                      style={{
                        left: `calc(${
                          automation?.manualReviewThreshold || 70
                        }% - 8px)`,
                      }}
                      title={`Manual Review: ${
                        automation?.manualReviewThreshold || 70
                      }%`}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        const bar = e.currentTarget.parentElement;
                        if (!bar) return;

                        document.body.style.userSelect = "none";
                        document.body.style.cursor = "grabbing";

                        const handleMouseMove = (moveEvent: MouseEvent) => {
                          moveEvent.preventDefault();
                          const rect = bar.getBoundingClientRect();
                          const x = moveEvent.clientX - rect.left;
                          const percentage = Math.round((x / rect.width) * 100);
                          const rejectThreshold =
                            automation?.autoRejectThreshold || 25;
                          // Accept threshold should always be at least review+5
                          const acceptThreshold =
                            automation?.acceptanceThreshold ??
                            Math.min(100, percentage + 5);
                          const clampedValue = Math.max(
                            rejectThreshold + 5,
                            Math.min(acceptThreshold - 5, percentage, 95)
                          );
                          setValue(
                            "automation.manualReviewThreshold",
                            clampedValue
                          );
                          setValue(
                            "automation.acceptanceThreshold",
                            Math.max(clampedValue + 5, acceptThreshold)
                          );
                        };

                        const handleMouseUp = () => {
                          document.removeEventListener(
                            "mousemove",
                            handleMouseMove
                          );
                          document.removeEventListener(
                            "mouseup",
                            handleMouseUp
                          );
                          document.body.style.userSelect = "";
                          document.body.style.cursor = "";
                        };

                        document.addEventListener("mousemove", handleMouseMove);
                        document.addEventListener("mouseup", handleMouseUp);
                      }}
                    >
                      <div className="absolute top-1 left-1/2 w-1 h-6 bg-white rounded-full transform -translate-x-1/2" />
                      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-5 h-5 bg-amber-600 rounded-full border-2 border-white flex items-center justify-center">
                        {/* Use Star as the review icon if Eye is not available */}
                        <Star className="w-3 h-3 text-white" />
                      </div>
                    </div>

                    {/* Accept Handle */}
                    <div
                      className="threshold-handle accept-threshold absolute -top-1 h-8 w-4 z-30 cursor-grab active:cursor-grabbing hover:scale-110 transition-transform"
                      style={{
                        left: `calc(${
                          automation?.acceptanceThreshold ||
                          (automation?.manualReviewThreshold || 70) + 5
                        }% - 8px)`,
                      }}
                      title={`Auto Accept: ${
                        automation?.acceptanceThreshold ||
                        (automation?.manualReviewThreshold || 70) + 5
                      }%`}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        const bar = e.currentTarget.parentElement;
                        if (!bar) return;

                        document.body.style.userSelect = "none";
                        document.body.style.cursor = "grabbing";

                        const handleMouseMove = (moveEvent: MouseEvent) => {
                          moveEvent.preventDefault();
                          const rect = bar.getBoundingClientRect();
                          const x = moveEvent.clientX - rect.left;
                          const percentage = Math.round((x / rect.width) * 100);
                          const reviewThreshold =
                            automation?.manualReviewThreshold || 70;
                          // Accept always >= review + 5
                          const clampedValue = Math.max(
                            reviewThreshold + 5,
                            Math.min(100, percentage)
                          );
                          setValue(
                            "automation.acceptanceThreshold",
                            clampedValue
                          );
                        };

                        const handleMouseUp = () => {
                          document.removeEventListener(
                            "mousemove",
                            handleMouseMove
                          );
                          document.removeEventListener(
                            "mouseup",
                            handleMouseUp
                          );
                          document.body.style.userSelect = "";
                          document.body.style.cursor = "";
                        };

                        document.addEventListener("mousemove", handleMouseMove);
                        document.addEventListener("mouseup", handleMouseUp);
                      }}
                    >
                      <div className="absolute top-1 left-1/2 w-1 h-6 bg-white rounded-full transform -translate-x-1/2" />
                      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-5 h-5 bg-emerald-600 rounded-full border-2 border-white flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center p-2 bg-white border border-red-200 rounded-md">
                    <div className="text-sm font-bold text-red-600">
                      {automation?.autoRejectThreshold || 25}%
                    </div>
                    <div className="text-red-700">Reject</div>
                  </div>
                  <div className="text-center p-2 bg-white border border-amber-200 rounded-md">
                    <div className="text-sm font-bold text-amber-600">
                      {automation?.manualReviewThreshold || 70}%
                    </div>
                    <div className="text-amber-700 flex items-center gap-1 justify-center">
                      {/* Use Star as visual indicator */}
                      <Star className="inline w-3 h-3 text-amber-500 mr-1" />
                      Review
                    </div>
                  </div>
                  <div className="text-center p-2 bg-white border border-emerald-200 rounded-md">
                    <div className="text-sm font-bold text-emerald-600">
                      {automation?.acceptanceThreshold ||
                        (automation?.manualReviewThreshold || 70) + 5}
                      %
                    </div>
                    <div className="text-emerald-700">Accept</div>
                  </div>
                </div>

                <div className="p-2 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-xs text-blue-800">
                    <strong>Drag thresholds</strong> to adjust AI decision
                    boundaries. Reject: 0-
                    {automation?.autoRejectThreshold || 25}% • Review:{" "}
                    {automation?.autoRejectThreshold || 25}-
                    {automation?.manualReviewThreshold || 70}% • Accept:{" "}
                    {(automation?.manualReviewThreshold || 70) + 5}-100%
                  </p>
                </div>
              </div>

              {(qualStats.total > 0 ||
                questionStats.total > 0 ||
                resumeStats.mode === "detailed") && (
                <Alert className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg">
                  <Star className="h-5 w-5 text-emerald-600" />
                  <AlertDescription className="text-emerald-800">
                    <strong>AI Configuration Complete!</strong> Evaluating{" "}
                    {qualStats.total} qualifications
                    {questionStats.total > 0 &&
                      `, ${questionStats.total} questions`}
                    {resumeStats.mode === "detailed"
                      ? `, ${resumeStats.criteriaCount} criteria`
                      : ", smart resume analysis"}
                    .
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
