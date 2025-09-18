"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  onClear?: () => void;
  className?: string;
  searchQuery: string;
}

export function SearchBar({
  placeholder = "Search jobs...",
  onSearch,
  onClear,
  className = "",
  searchQuery,
}: SearchBarProps) {
  const handleSearch = (value: string) => {
    onSearch(value);
  };

  const handleClear = () => {
    onSearch("");
    onClear?.();
  };

  return (
    <div className={`relative w-full ${className}`}>
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-primary transition-colors" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-12 pr-12 h-12 bg-white border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 text-sm placeholder:text-gray-500"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
          </Button>
        )}
      </div>
    </div>
  );
}
