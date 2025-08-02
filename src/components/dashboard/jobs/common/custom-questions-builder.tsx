"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  X,
  Edit3,
  Trash2,
  HelpCircle,
  CheckSquare,
  List,
  Type,
  ChevronUp,
  ChevronDown,
  Eye,
} from "lucide-react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import type { CustomQuestion } from "@/interfaces";

interface CustomQuestionsBuilderProps {
  name: string;
  label?: string;
  description?: string;
}

const QUESTION_TYPES = [
  {
    value: "boolean",
    label: "Yes/No Question",
    description: "Simple yes or no response",
    icon: CheckSquare,
    color: "bg-green-50 border-green-200 text-green-700",
    iconColor: "text-green-600",
  },
  {
    value: "string",
    label: "Text Input",
    description: "Open-ended text response",
    icon: Type,
    color: "bg-blue-50 border-blue-200 text-blue-700",
    iconColor: "text-blue-600",
  },
  {
    value: "select",
    label: "Multiple Choice",
    description: "Choose from predefined options",
    icon: List,
    color: "bg-purple-50 border-purple-200 text-purple-700",
    iconColor: "text-purple-600",
  },
];

export function CustomQuestionsBuilder({
  name,
  label = "Custom Questions",
  description = "Add custom screening questions for applicants",
}: CustomQuestionsBuilderProps) {
  const { watch, setValue } = useFormContext();
  const questions: CustomQuestion[] = watch(name) || [];

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<CustomQuestion | null>(
    null
  );
  const [questionForm, setQuestionForm] = useState({
    type: "boolean" as "boolean" | "string" | "select",
    question: "",
    required: false,
    options: ["", ""],
    placeholder: "",
  });

  const resetForm = () => {
    setQuestionForm({
      type: "boolean",
      question: "",
      required: false,
      options: ["", ""],
      placeholder: "",
    });
    setEditingQuestion(null);
  };

  const openEditDialog = (question: CustomQuestion) => {
    setEditingQuestion(question);
    setQuestionForm({
      type: question.type,
      question: question.question,
      required: question.required,
      options: question.options || ["", ""],
      placeholder: question.placeholder || "",
    });
    setIsDialogOpen(true);
  };

  const handleSaveQuestion = () => {
    if (!questionForm.question.trim()) return;

    const newQuestion: CustomQuestion = {
      id: editingQuestion?.id || `q_${Date.now()}`,
      type: questionForm.type,
      question: questionForm.question.trim(),
      required: questionForm.required,
      placeholder: questionForm.placeholder.trim() || undefined,
    };

    if (questionForm.type === "select") {
      const validOptions = questionForm.options.filter((opt) => opt.trim());
      if (validOptions.length < 2) return;
      newQuestion.options = validOptions;
    }

    let updatedQuestions;
    if (editingQuestion) {
      updatedQuestions = questions.map((q) =>
        q.id === editingQuestion.id ? newQuestion : q
      );
    } else {
      updatedQuestions = [...questions, newQuestion];
    }

    setValue(name, updatedQuestions);
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDeleteQuestion = (questionId: string) => {
    const updatedQuestions = questions.filter((q) => q.id !== questionId);
    setValue(name, updatedQuestions);
  };

  const handleMoveQuestion = (questionId: string, direction: "up" | "down") => {
    const currentIndex = questions.findIndex((q) => q.id === questionId);
    if (currentIndex === -1) return;

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= questions.length) return;

    const updatedQuestions = [...questions];
    const [movedQuestion] = updatedQuestions.splice(currentIndex, 1);
    updatedQuestions.splice(newIndex, 0, movedQuestion);

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
    if (questionForm.options.length <= 2) return;
    const newOptions = questionForm.options.filter((_, i) => i !== index);
    setQuestionForm({
      ...questionForm,
      options: newOptions,
    });
  };

  const getQuestionTypeInfo = (type: string) => {
    return QUESTION_TYPES.find((t) => t.value === type);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{label}</h3>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={resetForm}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Question
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-xl">
                {editingQuestion ? "Edit Question" : "Create New Question"}
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Design a custom question that applicants will answer during the
                application process.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Question Type Selection */}
              <div className="space-y-4">
                <Label className="text-base font-medium text-gray-900">
                  Question Type
                </Label>
                <div className="grid grid-cols-1 gap-3">
                  {QUESTION_TYPES.map((type) => {
                    const Icon = type.icon;
                    const isSelected = questionForm.type === type.value;
                    return (
                      <div
                        key={type.value}
                        className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all ${
                          isSelected
                            ? `${type.color} border-current`
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                        onClick={() =>
                          setQuestionForm({
                            ...questionForm,
                            type: type.value as any,
                          })
                        }
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              isSelected ? "bg-white/20" : "bg-gray-100"
                            }`}
                          >
                            <Icon
                              className={`w-5 h-5 ${
                                isSelected ? type.iconColor : "text-gray-600"
                              }`}
                            />
                          </div>
                          <div className="flex-1">
                            <h4
                              className={`font-medium ${
                                isSelected ? "text-current" : "text-gray-900"
                              }`}
                            >
                              {type.label}
                            </h4>
                            <p
                              className={`text-sm ${
                                isSelected ? "text-current/80" : "text-gray-600"
                              }`}
                            >
                              {type.description}
                            </p>
                          </div>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-current flex items-center justify-center">
                              <CheckSquare className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* Question Configuration */}
              <div className="space-y-6">
                {/* Question Text */}
                <div className="space-y-3">
                  <Label className="text-base font-medium text-gray-900">
                    Question Text <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    placeholder="Enter your question here..."
                    value={questionForm.question}
                    onChange={(e) =>
                      setQuestionForm({
                        ...questionForm,
                        question: e.target.value,
                      })
                    }
                    rows={3}
                    className="resize-none"
                  />
                </div>

                {/* Required Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label className="text-base font-medium text-gray-900">
                      Required Question
                    </Label>
                    <p className="text-sm text-gray-600">
                      Applicants must answer this question to continue
                    </p>
                  </div>
                  <Switch
                    checked={questionForm.required}
                    onCheckedChange={(checked) =>
                      setQuestionForm({ ...questionForm, required: checked })
                    }
                  />
                </div>

                {/* Type-specific Configuration */}
                {questionForm.type === "string" && (
                  <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-900">
                      Text Input Settings
                    </h4>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-blue-900">
                        Placeholder Text
                      </Label>
                      <Input
                        placeholder="e.g., Please describe your experience..."
                        value={questionForm.placeholder}
                        onChange={(e) =>
                          setQuestionForm({
                            ...questionForm,
                            placeholder: e.target.value,
                          })
                        }
                        className="bg-white"
                      />
                    </div>
                  </div>
                )}

                {questionForm.type === "select" && (
                  <div className="space-y-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-purple-900">
                        Multiple Choice Options
                      </h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addOption}
                        className="border-purple-300 text-purple-700 hover:bg-purple-100 bg-transparent"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add Option
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {questionForm.options.map((option, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-purple-200 flex items-center justify-center text-xs font-medium text-purple-700">
                            {index + 1}
                          </div>
                          <Input
                            placeholder={`Option ${index + 1}`}
                            value={option}
                            onChange={(e) =>
                              updateOption(index, e.target.value)
                            }
                            className="bg-white"
                          />
                          {questionForm.options.length > 2 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeOption(index)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-purple-700">
                      Minimum 2 options required
                    </p>
                  </div>
                )}

                {questionForm.type === "boolean" && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-medium text-green-900 mb-2">
                      Yes/No Question
                    </h4>
                    <p className="text-sm text-green-700">
                      Applicants will be able to select either "Yes" or "No" as
                      their response.
                    </p>
                  </div>
                )}

                {/* Preview */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-gray-600" />
                    <Label className="text-base font-medium text-gray-900">
                      Preview
                    </Label>
                  </div>
                  <div className="p-6 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-gray-900">
                        {questionForm.question ||
                          "Your question will appear here..."}
                        {questionForm.required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </Label>

                      {questionForm.type === "boolean" && (
                        <div className="flex gap-4">
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              disabled
                              className="text-blue-600"
                            />
                            <span className="text-sm">Yes</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              disabled
                              className="text-blue-600"
                            />
                            <span className="text-sm">No</span>
                          </div>
                        </div>
                      )}

                      {questionForm.type === "string" && (
                        <div className="space-y-1">
                          <Textarea
                            placeholder={
                              questionForm.placeholder ||
                              "Enter your response..."
                            }
                            disabled
                            rows={2}
                            className="resize-none bg-white"
                          />
                        </div>
                      )}

                      {questionForm.type === "select" && (
                        <Select disabled>
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Select an option..." />
                          </SelectTrigger>
                          <SelectContent>
                            {questionForm.options
                              .filter((opt) => opt.trim())
                              .map((option, index) => (
                                <SelectItem key={index} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-6 border-t">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveQuestion}
                disabled={
                  !questionForm.question.trim() ||
                  (questionForm.type === "select" &&
                    questionForm.options.filter((opt) => opt.trim()).length < 2)
                }
                className="bg-blue-600 hover:bg-blue-700"
              >
                {editingQuestion ? "Update Question" : "Create Question"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Questions List */}
      {questions.length === 0 ? (
        <Card className="border-2 border-dashed border-gray-200">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Custom Questions Yet
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Create screening questions to gather specific information from
              applicants and streamline your hiring process.
            </p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={resetForm}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Question
                </Button>
              </DialogTrigger>
            </Dialog>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-none shadow-none">
          <CardHeader className="p-0">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Custom Questions</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {questions.length} question{questions.length !== 1 ? "s" : ""}{" "}
                  configured
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-200"
                >
                  {questions.filter((q) => q.required).length} required
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-gray-50 text-gray-700 border-gray-200"
                >
                  {questions.filter((q) => !q.required).length} optional
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 pt-8">
            <div className="space-y-4">
              {questions.map((question, index) => {
                const typeInfo = getQuestionTypeInfo(question.type);
                const Icon = typeInfo?.icon || HelpCircle;

                return (
                  <Card
                    key={question.id}
                    className="border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        {/* Question Number & Type Icon */}
                        <div className="flex flex-col items-center gap-2">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              typeInfo?.color || "bg-gray-100"
                            }`}
                          >
                            <Icon
                              className={`w-5 h-5 ${
                                typeInfo?.iconColor || "text-gray-600"
                              }`}
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-500">
                            #{index + 1}
                          </span>
                        </div>

                        {/* Question Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge
                                variant="secondary"
                                className="text-xs font-medium"
                              >
                                {typeInfo?.label || question.type}
                              </Badge>
                              {question.required && (
                                <Badge
                                  variant="destructive"
                                  className="text-xs font-medium text-white"
                                >
                                  Required
                                </Badge>
                              )}
                            </div>
                          </div>

                          <h4 className="font-medium text-gray-900 mb-2 leading-relaxed">
                            {question.question}
                          </h4>

                          {/* Question Details */}
                          <div className="space-y-2">
                            {question.type === "select" && question.options && (
                              <div>
                                <p className="text-xs text-gray-500 mb-1">
                                  Options:
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {question.options
                                    .slice(0, 3)
                                    .map((option, optIndex) => (
                                      <Badge
                                        key={optIndex}
                                        variant="outline"
                                        className="text-xs bg-gray-50"
                                      >
                                        {option}
                                      </Badge>
                                    ))}
                                  {question.options.length > 3 && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs bg-gray-50"
                                    >
                                      +{question.options.length - 3} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}

                            {question.placeholder &&
                              question.type !== "string" && (
                                <p className="text-xs text-gray-500">
                                  Placeholder: "{question.placeholder}"
                                </p>
                              )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleMoveQuestion(question.id, "up")
                            }
                            disabled={index === 0}
                            className="h-8 w-8 p-0"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleMoveQuestion(question.id, "down")
                            }
                            disabled={index === questions.length - 1}
                            className="h-8 w-8 p-0"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </Button>
                          <Separator
                            orientation="vertical"
                            className="h-6 mx-1"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(question)}
                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Question
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this question?
                                  This action cannot be undone and will remove
                                  it from your application form.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDeleteQuestion(question.id)
                                  }
                                  className="bg-red-500 hover:bg-red-600"
                                >
                                  Delete Question
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
