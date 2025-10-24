import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  onClear: () => void;
  searchQuery: string;
}

export function SearchBar({
  placeholder = "Search...",
  onSearch,
  onClear,
  searchQuery,
}: SearchBarProps) {
  const [localQuery, setLocalQuery] = useState(searchQuery);

  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      onSearch(localQuery);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [localQuery, onSearch]);

  const handleClear = () => {
    setLocalQuery("");
    onClear();
  };

  return (
    <div className="relative w-full">
      <Input
        type="text"
        placeholder={placeholder}
        value={localQuery}
        onChange={(e) => setLocalQuery(e.target.value)}
        className="pl-9 pr-8 h-8 bg-white border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-md text-xs placeholder:text-gray-400 transition-all duration-200"
      />
      {localQuery && (
        <button
          onClick={handleClear}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-0.5 hover:bg-gray-100 rounded transition-colors duration-200"
          aria-label="Clear search"
        >
          <X className="h-3 w-3 text-gray-400 hover:text-gray-600" />
        </button>
      )}
    </div>
  );
}
