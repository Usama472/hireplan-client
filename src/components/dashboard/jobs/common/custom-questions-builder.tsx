"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";

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
import { Select, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Eye,
  HelpCircle,
  List,
  MessageSquare,
  Plus,
  Trash2,
  Type,
  X,
} from "lucide-react";

const QUESTION_TYPES = [
  {
    value: "boolean",
    label: "Yes/No",
    icon: CheckSquare,
    color: "bg-green-100 border-green-300 text-green-800",
    iconColor: "text-green-600",
  },
  {
    value: "string",
    label: "Text",
    icon: Type,
    color: "bg-blue-100 border-blue-300 text-blue-800",
    iconColor: "text-blue-600",
  },
  {
    value: "select",
    label: "Choice",
    icon: List,
    color: "bg-purple-100 border-purple-300 text-purple-800",
    iconColor: "text-purple-600",
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
  const { setValue, watch } = useFormContext();
  const questions: CustomQuestion[] = watch("customQuestions");
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

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{label}</h3>
            <p className="text-xs text-gray-500">{description}</p>
          </div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              onClick={resetForm}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Question
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-lg">
                {editingQuestion ? "Edit Question" : "Add New Question"}
              </DialogTitle>
              <DialogDescription className="text-sm">
                Design a custom question for applicants
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Question Type Selection */}
              <div>
                <Label className="font-medium text-gray-700">
                  Question Type
                </Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {QUESTION_TYPES.map((type) => {
                    const isSelected = questionForm.type === type.value;
                    return (
                      <div
                        key={type.value}
                        className={`cursor-pointer rounded-lg border p-3 transition-all ${
                          isSelected
                            ? `${type.color} border-current shadow-sm`
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                        onClick={() =>
                          setQuestionForm({
                            ...questionForm,
                            type: type.value as any,
                          })
                        }
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              isSelected ? "bg-white/30" : "bg-gray-100"
                            }`}
                          >
                            <type.icon
                              className={`w-4 h-4 ${
                                isSelected ? type.iconColor : "text-gray-600"
                              }`}
                            />
                          </div>
                          <span
                            className={`text-sm font-medium ${
                              isSelected ? "text-current" : "text-gray-800"
                            }`}
                          >
                            {type.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* Question Configuration */}
              <div className="space-y-4">
                {/* Question Text */}
                <div>
                  <div className="flex items-center justify-between">
                    <Label className="font-medium text-gray-700 flex items-center">
                      Question Text <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <span className="text-xs text-gray-500">
                      {questionForm.question.length}/200
                    </span>
                  </div>
                  <Textarea
                    placeholder="What would you like to ask?"
                    value={questionForm.question}
                    onChange={(e) => {
                      if (e.target.value.length <= 200) {
                        setQuestionForm({
                          ...questionForm,
                          question: e.target.value,
                        });
                      }
                    }}
                    rows={2}
                    className="mt-1 resize-none"
                  />
                </div>

                {/* Required Toggle */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <Label className="font-medium text-gray-700">
                      Required
                    </Label>
                    <p className="text-xs text-gray-500">
                      Applicant must answer
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
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <h4 className="font-medium text-blue-800 mb-2">
                      Text Settings
                    </h4>
                    <div>
                      <Label className="text-sm text-blue-800">
                        Placeholder Text
                      </Label>
                      <Input
                        placeholder="e.g., Describe your experience..."
                        value={questionForm.placeholder}
                        onChange={(e) =>
                          setQuestionForm({
                            ...questionForm,
                            placeholder: e.target.value,
                          })
                        }
                        className="mt-1 bg-white"
                      />
                    </div>
                  </div>
                )}

                {questionForm.type === "select" && (
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-purple-800">Options</h4>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addOption}
                        className="border-purple-300 text-purple-700 hover:bg-purple-100"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add Option
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {questionForm.options.map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-purple-200 flex items-center justify-center text-xs font-medium text-purple-800">
                            {index + 1}
                          </div>
                          <Input
                            placeholder={`Option ${index + 1}`}
                            value={option}
                            onChange={(e) =>
                              updateOption(index, e.target.value)
                            }
                            className="bg-white py-1.5"
                          />
                          {questionForm.options.length > 2 && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  onClick={() => removeOption(index)}
                                  className="text-gray-500 hover:text-red-500"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Remove option</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-purple-700 mt-2">
                      Minimum 2 options required
                    </p>
                  </div>
                )}
              </div>

              {/* Preview */}
              <div>
                <div className="flex items-center gap-1 mb-2">
                  <Eye className="w-4 h-4 text-gray-600" />
                  <Label className="font-medium text-gray-700">Preview</Label>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg bg-white">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-900 flex items-center">
                      {questionForm.question ||
                        "Your question will appear here"}
                      {questionForm.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </Label>

                    {/* Preview content based on type */}
                    {questionForm.type === "boolean" && (
                      <div className="flex gap-3 mt-1">
                        <label className="flex items-center gap-1.5 text-sm">
                          <input
                            type="radio"
                            disabled
                            className="h-3.5 w-3.5"
                          />
                          Yes
                        </label>
                        <label className="flex items-center gap-1.5 text-sm">
                          <input
                            type="radio"
                            disabled
                            className="h-3.5 w-3.5"
                          />
                          No
                        </label>
                      </div>
                    )}

                    {questionForm.type === "string" && (
                      <Textarea
                        placeholder={
                          questionForm.placeholder || "Enter response..."
                        }
                        disabled
                        rows={2}
                        className="resize-none bg-gray-50"
                      />
                    )}

                    {questionForm.type === "select" && (
                      <Select disabled>
                        <SelectTrigger className="bg-gray-50 py-1.5">
                          <SelectValue placeholder="Select an option..." />
                        </SelectTrigger>
                      </Select>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveQuestion}
                disabled={
                  !questionForm.question.trim() ||
                  (questionForm.type === "select" &&
                    questionForm.options.filter((opt) => opt.trim()).length < 2)
                }
                className="bg-blue-700"
              >
                {editingQuestion ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {questions.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-gray-300 rounded-xl bg-gray-50">
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="font-medium text-gray-900 mb-1">No Questions Yet</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
            Create questions to gather information from applicants.
          </p>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="bg-blue-700 text-white"
                onClick={resetForm}
              >
                <Plus className="w-4 h-4 mr-1" />
                Create Question
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Summary Stats */}
          <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-xs text-gray-600">
              <span className="font-medium text-gray-900">
                {questions.length}
              </span>{" "}
              question{questions.length !== 1 ? "s" : ""}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                {questions.filter((q) => q.required).length} required
              </Badge>
              <Badge variant="secondary">
                {questions.filter((q) => !q.required).length} optional
              </Badge>
            </div>
          </div>

          {/* Questions Grid */}
          <div className="space-y-3">
            {questions.map((question, index) => {
              const typeInfo = QUESTION_TYPES.find(
                (t) => t.value === question.type
              );
              const Icon = typeInfo?.icon || HelpCircle;

              return (
                <Card
                  key={question.id}
                  className="border border-gray-200 rounded-lg relative"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Enhanced Question Number Display */}
                      <div className=" flex-shrink-0">
                        <div className="absolute bottom-0 right-0 z-10  w-6 h-6 flex items-center justify-center text-xs font-medium text-blue-500 bg-blue-200 rounded-br-md">
                          {index + 1}
                        </div>
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                            typeInfo?.color || "bg-gray-100"
                          }`}
                        >
                          <Icon
                            className={`w-4 h-4 ${
                              typeInfo?.iconColor || "text-gray-600"
                            }`}
                          />
                        </div>
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
                            </div>

                            <h4 className="font-medium text-gray-900 text-sm">
                              {question.question}
                            </h4>
                          </div>

                          {/* Icon-only Action Buttons with Tooltips */}
                          <div className="flex items-center gap-1 ml-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  onClick={() => openEditDialog(question)}
                                  className="text-gray-600 hover:text-blue-600"
                                  size="icon"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Edit question</p>
                              </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      className="text-gray-600 hover:text-red-600"
                                      size="icon"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle className="text-lg">
                                        Delete Question?
                                      </AlertDialogTitle>
                                      <AlertDialogDescription className="text-sm">
                                        This will permanently remove the
                                        question from your form.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() =>
                                          handleDeleteQuestion(question.id)
                                        }
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Delete question</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>

                        {/* Question Details */}
                        {question.type === "select" && question.options && (
                          <div className="mt-2">
                            <div className="flex flex-wrap gap-1">
                              {question.options
                                .slice(0, 3)
                                .map((option, optIndex) => (
                                  <span
                                    key={optIndex}
                                    className="text-xs px-2 py-0.5 bg-purple-50 text-purple-700 rounded-md"
                                  >
                                    {option}
                                  </span>
                                ))}
                              {question.options.length > 3 && (
                                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md">
                                  +{question.options.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {question.placeholder && question.type === "string" && (
                          <p className="text-xs text-gray-500 mt-2">
                            Placeholder: "{question.placeholder}"
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
