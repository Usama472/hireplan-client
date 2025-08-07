"use client";

import { cn } from "@/lib/utils";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { AlertCircle, CheckCircle, Info } from "lucide-react";
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { Toolbar } from "./Toolbar";
import "./tiptap-editor.css";

interface TiptapEditorProps {
  name: string;
  placeholder?: string;
  validation?: {
    status: string;
    message: string;
  };
  className?: string;
  minHeight?: number;
  enableAI?: boolean;
  aiContext?: {
    jobTitle?: string;
    company?: string;
    requirements?: string[];
  };
}

export function TiptapEditor({
  name,
  placeholder,
  validation,
  className,
  minHeight = 200,
  enableAI = false,
  aiContext,
}: TiptapEditorProps) {
  const { setValue, watch } = useFormContext();
  const content = watch(name) || "";

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          class: "text-blue-600 underline hover:text-blue-800",
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || "Start typing...",
      }),
    ],
    content: content,
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4",
          "prose-headings:font-bold prose-headings:text-gray-900",
          "prose-h1:text-2xl prose-h1:mb-4 prose-h1:mt-6",
          "prose-h2:text-xl prose-h2:mb-3 prose-h2:mt-5",
          "prose-h3:text-lg prose-h3:mb-2 prose-h3:mt-4",
          "prose-p:mb-3 prose-p:leading-relaxed",
          "prose-ul:mb-3 prose-ul:pl-6",
          "prose-ol:mb-3 prose-ol:pl-6",
          "prose-li:mb-1",
          "prose-strong:font-semibold prose-strong:text-gray-900",
          "prose-em:italic",
          "prose-strike:line-through",
          "prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-800",
          "prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic",
          "prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm",
          "prose-pre:bg-gray-100 prose-pre:p-4 prose-pre:rounded prose-pre:overflow-x-auto"
        ),
      },
      handleKeyDown: (_view, event) => {
        // Handle keyboard shortcuts
        if (event.ctrlKey || event.metaKey) {
          switch (event.key.toLowerCase()) {
            case "b":
              event.preventDefault();
              editor?.chain().focus().toggleBold().run();
              return true;
            case "i":
              event.preventDefault();
              editor?.chain().focus().toggleItalic().run();
              return true;
            case "u":
              event.preventDefault();
              editor?.chain().focus().toggleStrike().run();
              return true;
            case "k": {
              event.preventDefault();
              // Trigger link dialog
              const url = window.prompt("Enter URL:");
              if (url) {
                editor?.chain().focus().setLink({ href: url }).run();
              }
              return true;
            }
          }
        }

        // Handle heading shortcuts
        if (event.key === "1" && (event.ctrlKey || event.metaKey)) {
          event.preventDefault();
          editor?.chain().focus().toggleHeading({ level: 1 }).run();
          return true;
        }
        if (event.key === "2" && (event.ctrlKey || event.metaKey)) {
          event.preventDefault();
          editor?.chain().focus().toggleHeading({ level: 2 }).run();
          return true;
        }
        if (event.key === "3" && (event.ctrlKey || event.metaKey)) {
          event.preventDefault();
          editor?.chain().focus().toggleHeading({ level: 3 }).run();
          return true;
        }

        return false;
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setValue(name, html, { shouldValidate: true });
    },
  });

  // Update editor content when form value changes externally
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const getStatusIcon = () => {
    if (!validation) return null;
    switch (validation.status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "warning":
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Info className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    if (!validation) return "";
    switch (validation.status) {
      case "success":
        return "text-green-600";
      case "warning":
        return "text-yellow-600";
      case "error":
        return "text-red-600";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div
        className={cn(
          "rounded-md border overflow-hidden bg-white",
          validation?.status === "error" && "border-red-500",
          validation?.status === "success" && "border-green-500"
        )}
        style={{ minHeight: `${minHeight}px` }}
      >
        <Toolbar 
          editor={editor} 
          enableAI={enableAI}
          aiContext={aiContext}
          onAIEnhance={(enhancedContent: string) => {
            editor?.commands.setContent(enhancedContent);
            setValue(name, enhancedContent);
          }}
        />
        <div className="tiptap-editor-content">
          <EditorContent editor={editor} />
        </div>
      </div>

      {validation && (
        <div className="flex items-center gap-2 text-sm">
          {getStatusIcon()}
          <span className={getStatusColor()}>{validation.message}</span>
        </div>
      )}
    </div>
  );
}
