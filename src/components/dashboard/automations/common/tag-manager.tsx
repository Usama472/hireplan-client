import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Plus, Tag } from "lucide-react";
import { useState } from "react";

interface TagManagerProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
}

export function TagManager({ tags, onChange, maxTags = 10 }: TagManagerProps) {
  const [newTag, setNewTag] = useState("");

  const addTag = () => {
    const trimmedTag = newTag.trim();
    if (!trimmedTag) return;
    
    if (tags.includes(trimmedTag)) {
      return; // Already exists
    }
    
    if (tags.length >= maxTags) {
      return; // Max tags reached
    }

    onChange([...tags, trimmedTag]);
    setNewTag("");
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(t => t !== tagToRemove));
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium text-gray-700">
        Tags (Optional)
      </Label>
      <p className="text-xs text-gray-500">
        Add tags to organize and filter your automations
      </p>

      {/* Existing Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1 pl-2 pr-1"
            >
              <Tag className="h-3 w-3" />
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="ml-1 hover:text-red-600 p-0.5 hover:bg-red-100 rounded"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Add New Tag */}
      <div className="flex gap-2">
        <Input
          placeholder="Enter a tag name..."
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addTag();
            }
          }}
          disabled={tags.length >= maxTags}
          className="text-sm"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addTag}
          disabled={!newTag.trim() || tags.length >= maxTags}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>

      {tags.length >= maxTags && (
        <p className="text-xs text-amber-600">
          Maximum {maxTags} tags reached
        </p>
      )}
    </div>
  );
}

