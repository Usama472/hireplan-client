import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { TimeSlot } from "@/interfaces";
import { cn } from "@/lib/utils/index";
import { Clock, Trash2, Edit3, Check } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TimeSlotProps {
  slot: TimeSlot;
  onDelete: (id: string) => void;
  onUpdate: (id: string, startTime: string, endTime: string) => void;
}

export function TimeSlotComponent({ slot, onDelete, onUpdate }: TimeSlotProps) {
  const [startTime, setStartTime] = useState(slot.startTime);
  const [endTime, setEndTime] = useState(slot.endTime);
  const [hasChanges, setHasChanges] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Sync state with props when slot changes
  useEffect(() => {
    setStartTime(slot.startTime);
    setEndTime(slot.endTime);
    setHasChanges(false);
    setIsEditing(false);
  }, [slot.startTime, slot.endTime]);

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartTime = e.target.value;
    setStartTime(newStartTime);
    setHasChanges(true);
  };

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndTime = e.target.value;
    setEndTime(newEndTime);
    setHasChanges(true);
  };

  const handleTimeUpdate = () => {
    if (hasChanges) {
      onUpdate(slot.id, startTime, endTime);
      setHasChanges(false);
      setIsEditing(false);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Save changes
      handleTimeUpdate();
    } else {
      // Enter edit mode
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setStartTime(slot.startTime);
    setEndTime(slot.endTime);
    setHasChanges(false);
    setIsEditing(false);
  };

  // Calculate duration
  const getDuration = () => {
    const start = convertTimeToMinutes(startTime);
    const end = convertTimeToMinutes(endTime);
    const duration = end - start;
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;

    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  };

  const convertTimeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  return (
    <div
      className={cn(
        "group relative bg-white rounded-lg p-2.5 transition-all duration-200 hover:bg-gray-25 border border-gray-100",
        hasChanges &&
          "bg-amber-25 border-l-4 border-l-amber-400 border-l-amber-400"
      )}
    >
      {/* Main Content - Compact Layout */}
      <div className="flex items-center gap-2.5">
        {/* Time Icon - Smaller */}
        <div
          className={cn(
            "flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center transition-colors duration-200",
            hasChanges
              ? "bg-amber-100 text-amber-600"
              : "bg-blue-100 text-blue-600"
          )}
        >
          <Clock size={10} />
        </div>

        {/* Time Inputs - Compact Inline */}
        <div className="flex-1 flex items-center gap-2">
          {isEditing ? (
            <>
              <Input
                type="time"
                value={startTime}
                onChange={handleStartTimeChange}
                className={cn(
                  "h-8 w-24 text-sm border border-gray-200 bg-white rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200",
                  hasChanges &&
                    "text-amber-700 font-medium border-amber-300 focus:ring-amber-500 focus:border-amber-500"
                )}
              />
              <span className="text-gray-400 text-sm font-medium px-1">→</span>
              <Input
                type="time"
                value={endTime}
                onChange={handleEndTimeChange}
                className={cn(
                  "h-8 w-24 text-sm border border-gray-200 bg-white rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200",
                  hasChanges &&
                    "text-amber-700 font-medium border-amber-300 focus:ring-amber-500 focus:border-amber-500"
                )}
              />
            </>
          ) : (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <span className="font-medium px-2 py-1 bg-gray-50 rounded-md">
                {startTime}
              </span>
              <span className="text-gray-400">→</span>
              <span className="font-medium px-2 py-1 bg-gray-50 rounded-md">
                {endTime}
              </span>
            </div>
          )}
        </div>

        {/* Duration Display - Compact */}
        <div className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded">
          {getDuration()}
        </div>

        {/* Edit/Save Button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleEditToggle}
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200 rounded"
              >
                {isEditing ? <Check size={10} /> : <Edit3 size={10} />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isEditing ? "Save changes" : "Edit time slot"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Cancel Button (only when editing) */}
        {isEditing && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleCancelEdit}
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors duration-200 rounded"
                >
                  <Trash2 size={10} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Cancel editing</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* Changes Indicator */}
        {hasChanges && (
          <div className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded border border-amber-200">
            Changes Pending
          </div>
        )}

        {/* Delete Button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(slot.id)}
                className="h-5 w-5 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors duration-200 opacity-0 group-hover:opacity-100 rounded"
              >
                <Trash2 size={10} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete time slot</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
