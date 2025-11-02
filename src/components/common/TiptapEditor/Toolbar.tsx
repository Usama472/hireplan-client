// components/common/Toolbar.tsx
"use client";

import { cn } from "@/lib/utils";
import { enhanceJobDescription } from "@/lib/ai";
import { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Link,
  Sparkles,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

interface ToolbarProps {
  editor: Editor | null;
  enableAI?: boolean;
  aiContext?: {
    jobTitle?: string;
    company?: string;
    requirements?: string[];
    compensation?: {
      type?: string;
      payRate?: {
        type?: string;
        min?: number;
        max?: number;
        period?: string;
        amount?: number;
      };
    };
    location?: {
      city?: string;
      state?: string;
      country?: string;
      workType?: string;
    };
    language?: string;
    employmentType?: string;
  };
  onAIEnhance?: (
    enhancedContent: string,
    suggestedQualifications?: string[]
  ) => void;
}

export function Toolbar({
  editor,
  enableAI,
  aiContext,
  onAIEnhance,
}: ToolbarProps) {
  const [url, setUrl] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const linkInputRef = useRef<HTMLDivElement>(null);

  // Close link input when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        linkInputRef.current &&
        !linkInputRef.current.contains(event.target as Node)
      ) {
        setShowLinkInput(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!editor) return null;

  const handleAIEnhance = async () => {
    if (!enableAI || !aiContext?.jobTitle || !onAIEnhance) {
      toast.error(
        "AI enhancement is not available. Please ensure job title is provided."
      );
      return;
    }

    const currentContent = editor.getHTML();
    if (!currentContent || currentContent.trim() === "<p></p>") {
      toast.error("Please add some content to enhance", {
        description:
          "The job description field is empty. Add some content before using AI enhancement.",
      });
      return;
    }

    setIsEnhancing(true);
    try {
      // Build compensation string
      let compensationStr = "";
      if (aiContext.compensation) {
        const { type, payRate } = aiContext.compensation;
        if (payRate) {
          if (payRate.type === "range" && payRate.min && payRate.max) {
            compensationStr = `${
              type || "Salary"
            }: ${payRate.min.toLocaleString()}-${payRate.max.toLocaleString()} ${
              payRate.period || "per year"
            }`;
          } else if (payRate.type === "exact" && payRate.amount) {
            compensationStr = `${
              type || "Salary"
            }: ${payRate.amount.toLocaleString()} ${
              payRate.period || "per year"
            }`;
          }
        }
      }

      // Build location string
      let locationStr = "";
      if (aiContext.location) {
        const parts = [];
        if (aiContext.location.city) parts.push(aiContext.location.city);
        if (aiContext.location.state) parts.push(aiContext.location.state);
        if (aiContext.location.country) parts.push(aiContext.location.country);
        if (parts.length > 0) {
          locationStr = parts.join(", ");
        }
        if (aiContext.location.workType) {
          locationStr += ` (${aiContext.location.workType})`;
        }
      }

      // Build comprehensive instructions for AI
      const instructionsParts = [];
      instructionsParts.push(
        `CRITICAL: Mention the job title "${aiContext.jobTitle}" at least 5 times naturally throughout the enhanced description.`
      );
      instructionsParts.push(
        "Integrate the following details seamlessly into the job description:"
      );

      if (aiContext.company) {
        instructionsParts.push(`- Company: ${aiContext.company}`);
      }
      if (locationStr) {
        instructionsParts.push(`- Location: ${locationStr}`);
      }
      if (compensationStr) {
        instructionsParts.push(`- Compensation: ${compensationStr}`);
      }
      if (aiContext.employmentType) {
        instructionsParts.push(
          `- Employment Type: ${aiContext.employmentType}`
        );
      }
      if (aiContext.language) {
        instructionsParts.push(`- Language: ${aiContext.language}`);
      }

      instructionsParts.push(
        "- Make sure all these details are naturally woven into the content, not just listed."
      );
      instructionsParts.push(
        "- The enhanced description should be comprehensive, engaging, and professional."
      );
      instructionsParts.push(
        "- Maintain the original structure and flow while adding these contextual details."
      );

      const result = await enhanceJobDescription({
        jobTitle: aiContext.jobTitle,
        jobDescription: currentContent,
        company: aiContext.company,
        requirements: aiContext.requirements,
        compensation: compensationStr || undefined,
        location: locationStr || undefined,
        language: aiContext.language,
        employmentType: aiContext.employmentType,
        instructions: instructionsParts.join("\n"),
      });
      console.log("✨ AI Enhancement complete:", result);

      // Remove markdown code block formatting if present
      let cleanedDescription = result.enhancedDescription;
      if (cleanedDescription) {
        // Remove ```html at the start
        cleanedDescription = cleanedDescription.replace(/^```html\s*/i, "");
        // Remove ``` at the end
        cleanedDescription = cleanedDescription.replace(/\s*```$/g, "");
        // Also handle cases with just ``` at start/end
        cleanedDescription = cleanedDescription.replace(/^```\s*/g, "");
        // Trim any extra whitespace
        cleanedDescription = cleanedDescription.trim();
      }

      onAIEnhance(cleanedDescription, result.suggestedQualifications);
      toast.success("Job description enhanced successfully!", {
        description:
          "The AI has improved your job description with additional context.",
      });
    } catch (error) {
      console.error("AI enhancement failed:", error);
      toast.error("Failed to enhance content", {
        description:
          "Please check your connection and try again. If the problem persists, contact support.",
      });
    } finally {
      setIsEnhancing(false);
    }
  };

  const setLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const previousUrl = editor.getAttributes("link").href;
    setUrl(previousUrl || "");
    setShowLinkInput(true);
  };

  const addLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
    setShowLinkInput(false);
  };

  const removeLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    editor.chain().focus().unsetLink().run();
    setShowLinkInput(false);
  };

  // Prevent form submission on toolbar button clicks
  const handleButtonClick = (e: React.MouseEvent, command: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    command();
  };

  return (
    <div
      className="border-b p-2 bg-gray-50 flex flex-wrap gap-1"
      onMouseDown={(e) => e.preventDefault()}
    >
      <button
        type="button"
        onClick={(e) =>
          handleButtonClick(e, () => editor.chain().focus().toggleBold().run())
        }
        className={cn(
          "p-2 rounded hover:bg-gray-200 transition-colors duration-200",
          editor.isActive("bold")
            ? "bg-blue-100 text-blue-700"
            : "text-gray-700"
        )}
        aria-label="Bold"
        title="Bold (Ctrl+B)"
      >
        <Bold className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={(e) =>
          handleButtonClick(e, () =>
            editor.chain().focus().toggleItalic().run()
          )
        }
        className={cn(
          "p-2 rounded hover:bg-gray-200 transition-colors duration-200",
          editor.isActive("italic")
            ? "bg-blue-100 text-blue-700"
            : "text-gray-700"
        )}
        aria-label="Italic"
        title="Italic (Ctrl+I)"
      >
        <Italic className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={(e) =>
          handleButtonClick(e, () =>
            editor.chain().focus().toggleStrike().run()
          )
        }
        className={cn(
          "p-2 rounded hover:bg-gray-200 transition-colors duration-200",
          editor.isActive("strike")
            ? "bg-blue-100 text-blue-700"
            : "text-gray-700"
        )}
        aria-label="Strikethrough"
        title="Strikethrough"
      >
        <Strikethrough className="w-4 h-4" />
      </button>

      <div className="border-l mx-1 border-gray-300" />

      <button
        type="button"
        onClick={(e) =>
          handleButtonClick(e, () =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          )
        }
        className={cn(
          "p-2 rounded hover:bg-gray-200 transition-colors duration-200",
          editor.isActive("heading", { level: 1 })
            ? "bg-blue-100 text-blue-700"
            : "text-gray-700"
        )}
        aria-label="Heading 1"
        title="Heading 1"
      >
        <Heading1 className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={(e) =>
          handleButtonClick(e, () =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          )
        }
        className={cn(
          "p-2 rounded hover:bg-gray-200 transition-colors duration-200",
          editor.isActive("heading", { level: 2 })
            ? "bg-blue-100 text-blue-700"
            : "text-gray-700"
        )}
        aria-label="Heading 2"
        title="Heading 2"
      >
        <Heading2 className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={(e) =>
          handleButtonClick(e, () =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          )
        }
        className={cn(
          "p-2 rounded hover:bg-gray-200 transition-colors duration-200",
          editor.isActive("heading", { level: 3 })
            ? "bg-blue-100 text-blue-700"
            : "text-gray-700"
        )}
        aria-label="Heading 3"
        title="Heading 3"
      >
        <Heading3 className="w-4 h-4" />
      </button>

      <div className="border-l mx-1 border-gray-300" />

      <button
        type="button"
        onClick={(e) =>
          handleButtonClick(e, () =>
            editor.chain().focus().toggleBulletList().run()
          )
        }
        className={cn(
          "p-2 rounded hover:bg-gray-200 transition-colors duration-200",
          editor.isActive("bulletList")
            ? "bg-blue-100 text-blue-700"
            : "text-gray-700"
        )}
        aria-label="Bullet List"
        title="Bullet List"
      >
        <List className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={(e) =>
          handleButtonClick(e, () =>
            editor.chain().focus().toggleOrderedList().run()
          )
        }
        className={cn(
          "p-2 rounded hover:bg-gray-200 transition-colors duration-200",
          editor.isActive("orderedList")
            ? "bg-blue-100 text-blue-700"
            : "text-gray-700"
        )}
        aria-label="Ordered List"
        title="Numbered List"
      >
        <ListOrdered className="w-4 h-4" />
      </button>

      <div className="border-l mx-1 border-gray-300" />

      <button
        type="button"
        onClick={setLink}
        className={cn(
          "p-2 rounded hover:bg-gray-200 transition-colors duration-200",
          editor.isActive("link")
            ? "bg-blue-100 text-blue-700"
            : "text-gray-700"
        )}
        aria-label="Add Link"
        title="Add Link"
      >
        <Link className="w-4 h-4" />
      </button>

      {enableAI && (
        <>
          <div className="border-l mx-1 border-gray-300" />
          <button
            type="button"
            onClick={handleAIEnhance}
            disabled={isEnhancing}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md hover:bg-purple-100 transition-colors duration-200 text-purple-700 text-sm font-medium",
              isEnhancing && "opacity-50 cursor-not-allowed"
            )}
            aria-label="Enhance with AI"
            title="Enhance with AI"
          >
            <Sparkles
              className={cn("w-4 h-4", isEnhancing && "animate-spin")}
            />
            <span className="whitespace-nowrap">
              {isEnhancing ? "Enhancing..." : "Enhance with AI"}
            </span>
          </button>
        </>
      )}

      {showLinkInput && (
        <div
          ref={linkInputRef}
          className="absolute z-10 mt-10 bg-white border rounded shadow-lg p-2 flex gap-2"
        >
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (url) {
                  editor.chain().focus().setLink({ href: url }).run();
                  setShowLinkInput(false);
                }
              }
              if (e.key === "Escape") {
                setShowLinkInput(false);
              }
            }}
            autoFocus
          />
          <button
            type="button"
            onClick={addLink}
            className="px-2 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
          >
            Apply
          </button>
          <button
            type="button"
            onClick={removeLink}
            className="px-2 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300 transition-colors"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
}
