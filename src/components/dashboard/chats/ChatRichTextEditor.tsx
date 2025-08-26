"use client";

import { cn } from "@/lib/utils";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { 
  Send, 
  Bold, 
  Italic, 
  List, 
  Link as LinkIcon, 
  Mail, 
  ChevronDown,
  FileText,
  Loader2,
  Paperclip,
  X,
  File,
  Image as ImageIcon,

} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import API from "@/http";

interface EmailTemplate {
  _id: string;
  name: string;
  category: string;
  subject: string;
  body: string;
  description?: string;
}

interface AttachedFile {
  id: string;
  file: File;
  preview?: string;
}

interface ChatRichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (attachments?: File[]) => void;
  placeholder?: string;
  sending?: boolean;
  disabled?: boolean;
  className?: string;
  maxFileSize?: number; // in MB
  allowedFileTypes?: string[];
}

export function ChatRichTextEditor({
  value,
  onChange,
  onSend,
  placeholder = "Type a message...",
  sending = false,
  disabled = false,
  className,
  maxFileSize = 10, // 10MB default
  allowedFileTypes = [
    'image/*',
    'application/pdf',
    '.doc,.docx',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.txt,.rtf'
  ]
}: ChatRichTextEditorProps) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const linkInputRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          class: "text-blue-600 underline hover:text-blue-800",
        },
      }),
      Placeholder.configure({
        placeholder: placeholder,
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm max-w-none focus:outline-none min-h-[60px] max-h-[200px] overflow-y-auto p-3",
          "prose-p:mb-2 prose-p:leading-relaxed",
          "prose-ul:mb-2 prose-ul:pl-4",
          "prose-ol:mb-2 prose-ol:pl-4",
          "prose-li:mb-0",
          "prose-strong:font-semibold prose-strong:text-gray-900",
          "prose-em:italic",
          "prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-800"
        ),
      },
      handleKeyDown: (_view, event) => {
        // Handle Enter key for sending
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          if (!sending && !disabled && (value.trim() || attachedFiles.length > 0)) {
            handleSend();
          }
          return true;
        }
        
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
          }
        }
        
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    editable: !disabled,
  });

  // Load email templates
  const loadTemplates = async () => {
    if (loadingTemplates) return;
    
    setLoadingTemplates(true);
    try {
      const response = await API.emailTemplate.getEmailTemplates({
        page: 1,
        limit: 50,
      });
      
      if (response.success) {
        setTemplates(response.data.results || []);
      }
    } catch (error) {
      console.error("Error loading email templates:", error);
    } finally {
      setLoadingTemplates(false);
    }
  };

  // Load templates on first render
  useEffect(() => {
    loadTemplates();
  }, []);

  // Update editor content when value changes externally
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  // Close link input when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (linkInputRef.current && !linkInputRef.current.contains(event.target as Node)) {
        setShowLinkInput(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTemplateSelect = (template: EmailTemplate) => {
    if (!editor) return;
    
    // Insert template content at cursor position or replace all content
    const isEmpty = editor.isEmpty;
    if (isEmpty) {
      editor.commands.setContent(template.body);
    } else {
      editor.commands.insertContent(`<br/><br/>${template.body}`);
    }
    
    // Focus editor after template insertion
    editor.commands.focus();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    files.forEach((file) => {
      // Check file size
      if (file.size > maxFileSize * 1024 * 1024) {
        alert(`File "${file.name}" is too large. Maximum size is ${maxFileSize}MB.`);
        return;
      }
      
      const newFile: AttachedFile = {
        id: Math.random().toString(36).substr(2, 9),
        file,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
      };
      
      setAttachedFiles(prev => [...prev, newFile]);
    });
    
    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (fileId: string) => {
    setAttachedFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter(f => f.id !== fileId);
    });
  };

  const handleSend = () => {
    if (!sending && !disabled && (value.trim() || attachedFiles.length > 0)) {
      const files = attachedFiles.map(af => af.file);
      onSend(files);
      
      // Clear attachments after sending
      attachedFiles.forEach(af => {
        if (af.preview) URL.revokeObjectURL(af.preview);
      });
      setAttachedFiles([]);
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.toLowerCase().split('.').pop();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return <ImageIcon className="h-4 w-4" />;
    }
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleLinkSubmit = () => {
    if (!editor || !linkUrl.trim()) return;
    
    editor.chain().focus().setLink({ href: linkUrl }).run();
    setLinkUrl("");
    setShowLinkInput(false);
  };

  const toggleBold = () => editor?.chain().focus().toggleBold().run();
  const toggleItalic = () => editor?.chain().focus().toggleItalic().run();
  const toggleBulletList = () => editor?.chain().focus().toggleBulletList().run();

  const isActive = (name: string) => editor?.isActive(name) || false;

  const groupedTemplates = templates.reduce((acc, template) => {
    const category = template.category || 'General';
    if (!acc[category]) acc[category] = [];
    acc[category].push(template);
    return acc;
  }, {} as Record<string, EmailTemplate[]>);

  return (
    <div className={cn("border border-gray-300 rounded-lg bg-white overflow-hidden", className)}>
      {/* Toolbar */}
      <div className="border-b border-gray-200 p-2 flex items-center gap-1">
        {/* Email Templates Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              disabled={disabled}
            >
              <Mail className="h-4 w-4 mr-1" />
              Templates
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-80 max-h-96">
            <div className="p-2">
              <div className="text-sm font-medium text-gray-900 mb-2">Email Templates</div>
              <div className="text-xs text-gray-500 mb-3">
                Select a template to insert into your message
              </div>
            </div>
            
            {loadingTemplates ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-gray-500">Loading templates...</span>
              </div>
            ) : (
              <ScrollArea className="max-h-64">
                {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
                  <div key={category}>
                    <div className="px-2 py-1 text-xs font-medium text-gray-400 uppercase tracking-wide">
                      {category}
                    </div>
                    {categoryTemplates.map((template) => (
                      <DropdownMenuItem
                        key={template._id}
                        onClick={() => handleTemplateSelect(template)}
                        className="flex flex-col items-start p-3 hover:bg-gray-50 cursor-pointer"
                      >
                        <div className="font-medium text-sm text-gray-900 mb-1">
                          {template.name}
                        </div>
                        {template.description && (
                          <div className="text-xs text-gray-500 mb-2">
                            {template.description}
                          </div>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {template.subject}
                        </Badge>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                  </div>
                ))}
                
                {templates.length === 0 && !loadingTemplates && (
                  <div className="p-4 text-center text-sm text-gray-500">
                    <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    No templates available
                  </div>
                )}
              </ScrollArea>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="w-px h-4 bg-gray-300 mx-1" />

        {/* File Attachment */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={allowedFileTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          disabled={disabled}
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        <div className="w-px h-4 bg-gray-300 mx-1" />

        {/* Formatting Tools */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleBold}
          className={cn(
            "h-8 w-8 p-0",
            isActive("bold") ? "bg-gray-200 text-gray-900" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          )}
          disabled={disabled}
        >
          <Bold className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={toggleItalic}
          className={cn(
            "h-8 w-8 p-0",
            isActive("italic") ? "bg-gray-200 text-gray-900" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          )}
          disabled={disabled}
        >
          <Italic className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={toggleBulletList}
          className={cn(
            "h-8 w-8 p-0",
            isActive("bulletList") ? "bg-gray-200 text-gray-900" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          )}
          disabled={disabled}
        >
          <List className="h-4 w-4" />
        </Button>

        {/* Link Tool */}
        <Popover open={showLinkInput} onOpenChange={setShowLinkInput}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 w-8 p-0",
                isActive("link") ? "bg-gray-200 text-gray-900" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              )}
              disabled={disabled}
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-3" align="start">
            <div className="space-y-2">
              <div className="text-sm font-medium">Add Link</div>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter URL..."
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleLinkSubmit()}
                  className="flex-1"
                />
                <Button onClick={handleLinkSubmit} size="sm">
                  Add
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Attachments Preview */}
      {attachedFiles.length > 0 && (
        <div className="border-t border-gray-200 p-3 bg-gray-50">
          <div className="text-xs font-medium text-gray-700 mb-2">
            Attachments ({attachedFiles.length})
          </div>
          <div className="flex flex-wrap gap-2">
            {attachedFiles.map((attachedFile) => (
              <div
                key={attachedFile.id}
                className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-2 text-xs"
              >
                {attachedFile.preview ? (
                  <img
                    src={attachedFile.preview}
                    alt={attachedFile.file.name}
                    className="w-8 h-8 object-cover rounded"
                  />
                ) : (
                  getFileIcon(attachedFile.file.name)
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {attachedFile.file.name}
                  </div>
                  <div className="text-gray-500">
                    {formatFileSize(attachedFile.file.size)}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAttachment(attachedFile.id)}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Editor Content */}
      <div className="relative">
        <EditorContent editor={editor} />
        
        {/* Send Button */}
        <div className="absolute bottom-2 right-2">
          <Button
            onClick={handleSend}
            disabled={sending || disabled || (!value.trim() && attachedFiles.length === 0)}
            size="sm"
            className="h-10 w-10 p-0 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-200"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
