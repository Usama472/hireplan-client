"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import useAuthSessionContext from "@/lib/context/AuthSessionContext";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { CustomQuestion } from "@/interfaces";
import {
  CheckSquare,
  Edit,
  FileText,
  Hash,
  List,
  MessageSquare,
  Plus,
  Settings,
  Star,
  Trash2,
  Type,
  X,
  Calendar,
  Clock,
  Mail,
  Phone,
  Upload,
  Download,
  Copy,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";

// Question Type Definitions
const QUESTION_TYPES = [
  {
    id: "text",
    label: "Short Text",
    icon: Type,
    color: "bg-blue-100 text-blue-700",
    description: "Single line text input",
    placeholder: "Enter your answer here...",
  },
  {
    id: "textarea",
    label: "Long Text",
    icon: FileText,
    color: "bg-green-100 text-green-700",
    description: "Multi-line text input",
    placeholder: "Enter your detailed response...",
  },
  {
    id: "select",
    label: "Multiple Choice",
    icon: List,
    color: "bg-purple-100 text-purple-700",
    description: "Single selection from options",
    placeholder: "Select an option...",
  },
  {
    id: "radio",
    label: "Radio Buttons",
    icon: CheckSquare,
    color: "bg-orange-100 text-orange-700",
    description: "Single selection with radio buttons",
    placeholder: "Choose one option",
  },
  {
    id: "number",
    label: "Number",
    icon: Hash,
    color: "bg-red-100 text-red-700",
    description: "Numeric input",
    placeholder: "Enter a number...",
  },
  {
    id: "email",
    label: "Email",
    icon: Mail,
    color: "bg-indigo-100 text-indigo-700",
    description: "Email address input",
    placeholder: "Enter email address...",
  },
  {
    id: "phone",
    label: "Phone",
    icon: Phone,
    color: "bg-teal-100 text-teal-700",
    description: "Phone number input",
    placeholder: "Enter phone number...",
  },
  {
    id: "date",
    label: "Date",
    icon: Calendar,
    color: "bg-pink-100 text-pink-700",
    description: "Date picker",
    placeholder: "Select a date...",
  },
  {
    id: "time",
    label: "Time",
    icon: Clock,
    color: "bg-yellow-100 text-yellow-700",
    description: "Time picker",
    placeholder: "Select a time...",
  },
  {
    id: "file",
    label: "File Upload",
    icon: Upload,
    color: "bg-gray-100 text-gray-700",
    description: "File upload field",
    placeholder: "Choose file...",
  },
];

interface CustomQuestionsBuilderProps {
  name: string;
  label?: string;
  description?: string;
}

export function CustomQuestionsBuilder({
  name,
  label = "Custom Questions",
  description = "Add custom screening questions for applicants",
}: CustomQuestionsBuilderProps) {
  
  const { watch, setValue } = useFormContext();
  const { subscription } = useAuthSessionContext();
  
  // Check if user has AI features (Professional/Enterprise)
  const hasAIFeatures = subscription?.planId === 'professional' || subscription?.planId === 'enterprise';
  
  const questions: CustomQuestion[] = watch(name) || [];
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [questionForm, setQuestionForm] = useState<CustomQuestion>({
    type: "text",
    question: "",
    required: false,
    options: [],
    placeholder: "",
    aiScoringType: "scored",
    aiScoreValues: {},
  });

  const [showPreview, setShowPreview] = useState(false);


  const resetForm = () => {
    setQuestionForm({
      type: "text",
      question: "",
      required: false,
      options: [],
      placeholder: "",
      aiScoringType: "scored",
      aiScoreValues: {},
    });
    setEditingIndex(null);
  };

  const handleSaveQuestion = () => {
    if (!questionForm.question.trim()) return;

    const newQuestion: CustomQuestion = {
      ...questionForm,
      question: questionForm.question.trim(),
      placeholder: questionForm.placeholder?.trim() || "",
    };

    // Ensure options are provided for select/radio types
    if ((newQuestion.type === "select" || newQuestion.type === "radio") && newQuestion.options.length === 0) {
      alert("Please add at least one option for multiple choice questions.");
      return;
    }

    let updatedQuestions;
    if (editingIndex !== null) {
      updatedQuestions = [...questions];
      updatedQuestions[editingIndex] = newQuestion;
    } else {
      updatedQuestions = [...questions, newQuestion];
    }

    setValue(name, updatedQuestions);
    setIsDialogOpen(false);
    resetForm();
  };

  const handleEditQuestion = (index: number) => {
    const question = questions[index];
    setQuestionForm({ ...question });
    setEditingIndex(index);
    setIsDialogOpen(true);
  };

  const handleDeleteQuestion = (index: number) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setValue(name, updatedQuestions);
  };

  const handleDuplicateQuestion = (index: number) => {
    const questionToDuplicate = { ...questions[index] };
    questionToDuplicate.question = `${questionToDuplicate.question} (Copy)`;
    const updatedQuestions = [...questions, questionToDuplicate];
    setValue(name, updatedQuestions);
  };

  const addOption = () => {
    setQuestionForm({
      ...questionForm,
      options: [...questionForm.options, ""],
    });
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...questionForm.options];
    newOptions[index] = value;
    setQuestionForm({
      ...questionForm,
      options: newOptions,
    });
  };

  const removeOption = (index: number) => {
    const newOptions = questionForm.options.filter((_, i) => i !== index);
    setQuestionForm({
      ...questionForm,
      options: newOptions,
    });
  };


  const getTypeInfo = (type: string) => {
    return QUESTION_TYPES.find((t) => t.id === type) || QUESTION_TYPES[0];
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-medium">{label}</Label>
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className="text-xs"
          >
            {showPreview ? (
              <>
                <EyeOff className="w-3 h-3 mr-1" />
                Hide Preview
              </>
            ) : (
              <>
                <Eye className="w-3 h-3 mr-1" />
                Show Preview
              </>
            )}
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                type="button"
                size="sm"
                onClick={resetForm}
                disabled={questions.length >= 5}
                className="text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Question
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingIndex !== null ? "Edit Question" : "Add New Question"}
                </DialogTitle>
                <DialogDescription>
                  Create custom questions to gather specific information from applicants.
                  {hasAIFeatures && " Configure AI scoring to automatically evaluate responses."}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Question Type Selection */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Question Type</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {QUESTION_TYPES.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() =>
                          setQuestionForm({
                            ...questionForm,
                            type: type.id as any,
                            options: type.id === "select" || type.id === "radio" ? [""] : [],
                          })
                        }
                        className={`p-3 rounded-lg border text-left transition-all ${
                          questionForm.type === type.id
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <type.icon className="w-4 h-4" />
                          <span className="text-sm font-medium">{type.label}</span>
                        </div>
                        <p className="text-xs text-gray-500">{type.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* AI Scoring Configuration - Only for Professional/Enterprise */}
                {hasAIFeatures && (
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200/50 rounded-lg space-y-3">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-blue-600" />
                      <Label className="text-sm font-medium text-blue-800">AI Scoring Configuration</Label>
                    </div>
                    
                    <div className="space-y-3">
                      {/* Multiple Choice Questions */}
                      {(questionForm.type === "select" || questionForm.type === "radio") && (
                        <>
                          <div className="space-y-2">
                            <Label className="text-xs text-blue-700">Correct/Best Answer</Label>
                            <Select 
                              value={questionForm.correctAnswer || ""} 
                              onValueChange={(value) => setQuestionForm({...questionForm, correctAnswer: value})}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select the correct/best answer" />
                              </SelectTrigger>
                              <SelectContent>
                                {questionForm.options.filter(option => option.trim()).map((option, index) => (
                                  <SelectItem key={index} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <Label className="text-xs text-blue-700">Auto-reject wrong answers?</Label>
                            <Switch
                              checked={questionForm.autoReject || false}
                              onCheckedChange={(checked) => setQuestionForm({...questionForm, autoReject: checked})}
                              size="sm"
                            />
                          </div>
                        </>
                      )}

                      {/* Yes/No Questions */}
                      {questionForm.type === "select" && questionForm.options.length === 2 && 
                       questionForm.options.some(opt => opt.toLowerCase().includes('yes')) &&
                       questionForm.options.some(opt => opt.toLowerCase().includes('no')) && (
                        <>
                          <div className="space-y-2">
                            <Label className="text-xs text-blue-700">Expected Answer</Label>
                            <Select 
                              value={questionForm.expectedYesNo || ""} 
                              onValueChange={(value) => setQuestionForm({...questionForm, expectedYesNo: value})}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="What answer do you expect?" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="yes">Yes (positive response)</SelectItem>
                                <SelectItem value="no">No (negative response)</SelectItem>
                                <SelectItem value="either">Either (no preference)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <Label className="text-xs text-blue-700">Auto-reject wrong answers?</Label>
                            <Switch
                              checked={questionForm.autoReject || false}
                              onCheckedChange={(checked) => setQuestionForm({...questionForm, autoReject: checked})}
                              size="sm"
                            />
                          </div>
                        </>
                      )}

                      {/* Text Questions */}
                      {(questionForm.type === "text" || questionForm.type === "textarea") && (
                        <div className="space-y-2">
                          <Label className="text-xs text-blue-700">AI Evaluation Focus</Label>
                          <Textarea
                            value={questionForm.evaluationCriteria || ""}
                            onChange={(e) => setQuestionForm({...questionForm, evaluationCriteria: e.target.value})}
                            placeholder="What should AI look for in the answer? e.g., 'Look for specific examples of leadership, team management experience, and problem-solving skills'"
                            className="text-xs min-h-[60px]"
                          />
                          <p className="text-xs text-blue-600">
                            Guide AI on what makes a good answer to this question.
                          </p>
                        </div>
                      )}

                      {/* Number Questions */}
                      {questionForm.type === "number" && (
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs text-blue-700">Minimum Value</Label>
                            <Input
                              type="number"
                              value={questionForm.minValue || ""}
                              onChange={(e) => setQuestionForm({...questionForm, minValue: parseInt(e.target.value) || undefined})}
                              placeholder="Min"
                              className="h-7 text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-blue-700">Ideal Value</Label>
                            <Input
                              type="number"
                              value={questionForm.idealValue || ""}
                              onChange={(e) => setQuestionForm({...questionForm, idealValue: parseInt(e.target.value) || undefined})}
                              placeholder="Ideal"
                              className="h-7 text-xs"
                            />
                          </div>
                        </div>
                      )}

                      <div className="text-xs text-blue-600 bg-blue-100 p-2 rounded">
                        <strong>Multiple Choice:</strong> Set correct answer and auto-reject option<br/>
                        <strong>Text Questions:</strong> AI evaluates based on your criteria<br/>
                        <strong>Number Questions:</strong> Scored based on minimum and ideal values
                      </div>
                    </div>
                  </div>
                )}

                {/* Question Text */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Question</Label>
                  <Textarea
                    value={questionForm.question}
                    onChange={(e) =>
                      setQuestionForm({ ...questionForm, question: e.target.value })
                    }
                    placeholder="Enter your question here..."
                    className="min-h-[80px]"
                  />
                </div>

                {/* Placeholder Text */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Placeholder Text (Optional)</Label>
                  <Input
                    value={questionForm.placeholder || ""}
                    onChange={(e) =>
                      setQuestionForm({ ...questionForm, placeholder: e.target.value })
                    }
                    placeholder="Enter placeholder text..."
                  />
                </div>

                {/* Options for Select/Radio */}
                {(questionForm.type === "select" || questionForm.type === "radio") && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Options</Label>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={addOption}
                        className="text-xs"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add Option
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {questionForm.options.map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            value={option}
                            onChange={(e) => updateOption(index, e.target.value)}
                            placeholder={`Option ${index + 1}`}
                            className="text-sm"
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => removeOption(index)}
                            disabled={questionForm.options.length <= 1}
                            className="text-xs px-2"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Required Toggle */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <Label className="text-sm font-medium">Required Question</Label>
                    <p className="text-xs text-gray-500">
                      Applicants must answer this question to proceed
                    </p>
                  </div>
                  <Switch
                    checked={questionForm.required}
                    onCheckedChange={(checked) =>
                      setQuestionForm({ ...questionForm, required: checked })
                    }
                  />
                </div>

                {/* Question Preview */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Preview</Label>
                  <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <Label className="text-sm font-medium text-gray-900 flex-1">
                          {questionForm.question || "Your question will appear here..."}
                          {questionForm.required && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </Label>
                        {questionForm.required && (
                          <Badge variant="secondary" className="text-xs bg-red-100 text-red-800">
                            Required
                          </Badge>
                        )}
                      </div>

                      {/* Preview Input Based on Type */}
                      {questionForm.type === "text" && (
                        <Input
                          disabled
                          placeholder={questionForm.placeholder || "Enter your answer here..."}
                          className="bg-white"
                        />
                      )}
                      {questionForm.type === "textarea" && (
                        <Textarea
                          disabled
                          placeholder={questionForm.placeholder || "Enter your detailed response..."}
                          className="bg-white min-h-[80px]"
                        />
                      )}
                      {questionForm.type === "number" && (
                        <Input
                          type="number"
                          disabled
                          placeholder={questionForm.placeholder || "Enter a number..."}
                          className="bg-white"
                        />
                      )}
                      {questionForm.type === "email" && (
                        <Input
                          type="email"
                          disabled
                          placeholder={questionForm.placeholder || "Enter email address..."}
                          className="bg-white"
                        />
                      )}
                      {questionForm.type === "phone" && (
                        <Input
                          type="tel"
                          disabled
                          placeholder={questionForm.placeholder || "Enter phone number..."}
                          className="bg-white"
                        />
                      )}
                      {questionForm.type === "date" && (
                        <Input
                          type="date"
                          disabled
                          className="bg-white"
                        />
                      )}
                      {questionForm.type === "time" && (
                        <Input
                          type="time"
                          disabled
                          className="bg-white"
                        />
                      )}
                      {questionForm.type === "file" && (
                        <Input
                          type="file"
                          disabled
                          className="bg-white"
                        />
                      )}
                      {questionForm.type === "select" && (
                        <Select disabled>
                          <SelectTrigger className="bg-white py-1.5">
                            <SelectValue placeholder="Select an option..." />
                          </SelectTrigger>
                        </Select>
                      )}
                      {questionForm.type === "radio" && (
                        <div className="space-y-2">
                          {questionForm.options.map((option, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <input
                                type="radio"
                                disabled
                                className="text-primary"
                              />
                              <span className="text-sm text-gray-700">
                                {option || `Option ${index + 1}`}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSaveQuestion}
                  disabled={!questionForm.question.trim()}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingIndex !== null ? "Update Question" : "Add Question"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>


      {/* Current Questions List */}
      {questions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">
              Current Questions ({questions.length}/5)
            </Label>
            {questions.length >= 5 && (
              <Badge variant="secondary" className="text-xs">
                Maximum reached
              </Badge>
            )}
          </div>

          <div className="space-y-3">
            {questions.map((question, index) => {
              const typeInfo = getTypeInfo(question.type);
              return (
                <Card key={index} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Question Icon */}
                      <div className={`p-2 rounded-lg ${typeInfo.color} flex-shrink-0`}>
                        <typeInfo.icon className="w-4 h-4" />
                      </div>

                      {/* Question Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge
                                variant="outline"
                                className={`text-xs ${
                                  typeInfo?.color
                                    .replace("bg-", "bg-")
                                    .replace("text-", "text-") ||
                                  "bg-gray-100 text-gray-700"
                                } border-0`}
                              >
                                {typeInfo?.label || question.type}
                              </Badge>
                              {question.required && (
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-red-100 text-red-800 border-0"
                                >
                                  Required
                                </Badge>
                              )}
                              {hasAIFeatures && question.aiScoringType && (
                                <Badge
                                  variant="outline"
                                  className={`text-xs border-0 ${
                                    question.aiScoringType === "auto-reject"
                                      ? "bg-orange-100 text-orange-800"
                                      : "bg-purple-100 text-purple-800"
                                  }`}
                                >
                                  {question.aiScoringType === "auto-reject" ? "Auto-reject" : "Scored"}
                                </Badge>
                              )}
                            </div>

                            <h4 className="font-medium text-gray-900 text-sm">
                              {question.question}
                            </h4>

                            {/* Show options for select/radio types */}
                            {(question.type === "select" || question.type === "radio") &&
                              question.options && question.options.length > 0 && (
                                <div className="space-y-1">
                                  <p className="text-xs text-gray-500 font-medium">Options:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {question.options.map((option, optIndex) => (
                                      <Badge
                                        key={optIndex}
                                        variant="outline"
                                        className="text-xs bg-gray-50 text-gray-700 border-gray-200"
                                      >
                                        {option}
                                        {hasAIFeatures && question.aiScoreValues?.[option] && (
                                          <span className="ml-1 text-purple-600">
                                            ({question.aiScoreValues[option]})
                                          </span>
                                        )}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                            {question.placeholder && (
                              <p className="text-xs text-gray-500">
                                <span className="font-medium">Placeholder:</span> {question.placeholder}
                              </p>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-1 ml-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDuplicateQuestion(index)}
                                  className="h-8 w-8 p-0 text-gray-400 hover:text-blue-600"
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Duplicate question</p>
                              </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEditQuestion(index)}
                                  className="h-8 w-8 p-0 text-gray-400 hover:text-blue-600"
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Edit question</p>
                              </TooltipContent>
                            </Tooltip>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 text-gray-400 hover:text-red-600"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Question</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this question? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteQuestion(index)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Preview Mode */}
      {showPreview && questions.length > 0 && (
        <Card className="border-2 border-blue-200 bg-blue-50/30">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-600" />
                <Label className="text-lg font-semibold text-blue-900">
                  Application Preview
                </Label>
              </div>
              <Separator className="bg-blue-200" />
              <div className="space-y-6">
                {questions.map((question, index) => {
                  const typeInfo = getTypeInfo(question.type);
                  return (
                    <div key={index} className="space-y-3">
                      <div className="flex items-start gap-2">
                        <Label className="text-sm font-medium text-gray-900 flex-1">
                          {index + 1}. {question.question}
                          {question.required && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </Label>
                        <div className="flex items-center gap-1">
                          <Badge
                            variant="outline"
                            className={`text-xs ${typeInfo.color} border-0`}
                          >
                            {typeInfo.label}
                          </Badge>
                          {question.required && (
                            <Badge
                              variant="outline"
                              className="text-xs bg-red-100 text-red-800 border-0"
                            >
                              Required
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Preview Input Based on Type */}
                      <div className="ml-4">
                        {question.type === "text" && (
                          <Input
                            disabled
                            placeholder={question.placeholder || "Enter your answer here..."}
                            className="bg-white"
                          />
                        )}
                        {question.type === "textarea" && (
                          <Textarea
                            disabled
                            placeholder={question.placeholder || "Enter your detailed response..."}
                            className="bg-white min-h-[80px]"
                          />
                        )}
                        {question.type === "number" && (
                          <Input
                            type="number"
                            disabled
                            placeholder={question.placeholder || "Enter a number..."}
                            className="bg-white"
                          />
                        )}
                        {question.type === "email" && (
                          <Input
                            type="email"
                            disabled
                            placeholder={question.placeholder || "Enter email address..."}
                            className="bg-white"
                          />
                        )}
                        {question.type === "phone" && (
                          <Input
                            type="tel"
                            disabled
                            placeholder={question.placeholder || "Enter phone number..."}
                            className="bg-white"
                          />
                        )}
                        {question.type === "date" && (
                          <Input
                            type="date"
                            disabled
                            className="bg-white"
                          />
                        )}
                        {question.type === "time" && (
                          <Input
                            type="time"
                            disabled
                            className="bg-white"
                          />
                        )}
                        {question.type === "file" && (
                          <Input
                            type="file"
                            disabled
                            className="bg-white"
                          />
                        )}
                        {question.type === "select" && (
                          <Select disabled>
                            <SelectTrigger className="bg-white">
                              <SelectValue placeholder={question.placeholder || "Select an option..."} />
                            </SelectTrigger>
                          </Select>
                        )}
                        {question.type === "radio" && (
                          <div className="space-y-2">
                            {question.options?.map((option, optIndex) => (
                              <div key={optIndex} className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  disabled
                                  className="text-primary"
                                />
                                <span className="text-sm text-gray-700">{option}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {questions.length === 0 && (
        <Card className="border-dashed border-2 border-gray-200">
          <CardContent className="p-8 text-center">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No custom questions yet
            </h3>
            <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
              Add custom screening questions to gather specific information from applicants.
              Use templates to get started quickly.
            </p>
            <Button
              type="button"
              onClick={() => setIsDialogOpen(true)}
              className="text-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Question
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}