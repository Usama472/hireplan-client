// components/common/Toolbar.tsx
"use client";

import { cn } from "@/lib/utils";
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
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface ToolbarProps {
  editor: Editor | null;
}

export function Toolbar({ editor }: ToolbarProps) {
  const [url, setUrl] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
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
