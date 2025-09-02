"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { EventType } from "@/interfaces";
import { Clock, Edit, Trash2 } from "lucide-react";
import { useState } from "react";

interface EventTypeManagerProps {
  eventTypes: EventType[];
  onEventTypesChange: (eventTypes: EventType[]) => void;
  selectedEventTypeId?: string; // ID of the currently selected event type
  onEventTypeSelect: (eventTypeId: string) => void; // Callback when event type is selected
  usedEventTypeIds?: string[]; // IDs of event types currently being used
  className?: string;
}

const colorOptions = [
  { name: "Blue", value: "#3B82F6" },
  { name: "Green", value: "#10B981" },
  { name: "Yellow", value: "#F59E0B" },
  { name: "Red", value: "#EF4444" },
  { name: "Purple", value: "#8B5CF6" },
  { name: "Pink", value: "#EC4899" },
  { name: "Indigo", value: "#6366F1" },
  { name: "Teal", value: "#14B8A6" },
];

export function EventTypeManager({
  eventTypes,
  onEventTypesChange,
  selectedEventTypeId,
  onEventTypeSelect,
  usedEventTypeIds = [],
  className,
}: EventTypeManagerProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingEventType, setEditingEventType] = useState<EventType | null>(
    null
  );

  const handleEditEventType = (eventType: EventType) => {
    setEditingEventType(eventType);
    setIsEditDialogOpen(true);
  };

  const handleUpdateEventType = () => {
    if (!editingEventType) return;

    const updatedEventTypes = eventTypes.map((et) =>
      et.id === editingEventType.id ? editingEventType : et
    );
    onEventTypesChange(updatedEventTypes);
    setIsEditDialogOpen(false);
    setEditingEventType(null);
  };

  const handleDeleteEventType = (eventTypeId: string) => {
    const eventType = eventTypes.find((et) => et.id === eventTypeId);
    if (eventType?.isDefault) return;

    // Can't delete if it's the last event type
    if (eventTypes.length <= 1) {
      alert(
        "Cannot delete the last event type. At least one event type must remain."
      );
      return;
    }

    // Check if event type is currently being used
    if (usedEventTypeIds.includes(eventTypeId)) {
      if (
        !confirm(
          `This event type is currently being used in ${usedEventTypeIds.length} time slot(s). Deleting it will remove the association from those slots. Are you sure you want to continue?`
        )
      ) {
        return;
      }
    }

    // If we're deleting the selected event type, select another one
    if (selectedEventTypeId === eventTypeId) {
      const remainingEventTypes = eventTypes.filter(
        (et) => et.id !== eventTypeId
      );
      if (remainingEventTypes.length > 0) {
        onEventTypeSelect(remainingEventTypes[0].id);
      }
    }

    onEventTypesChange(eventTypes.filter((et) => et.id !== eventTypeId));
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) return `${hours}h`;
    return `${hours}h ${remainingMinutes}min`;
  };

  return (
    <div className={className}>
      {/* Event Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {eventTypes.map((eventType) => (
          <div
            key={eventType.id}
            className={`group hover:shadow-md transition-all duration-200 cursor-pointer bg-white border rounded-lg p-3 hover:border-gray-300 ${
              selectedEventTypeId === eventType.id
                ? "border-blue-500 bg-blue-50 shadow-md"
                : "border-gray-200"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: eventType.color }}
                  />
                  <h4 className="font-medium text-gray-900 text-sm">
                    {eventType.name}
                  </h4>
                  {eventType.isDefault && (
                    <Badge variant="secondary" className="text-xs px-1 py-0">
                      Default
                    </Badge>
                  )}
                  {selectedEventTypeId === eventType.id && (
                    <Badge
                      variant="secondary"
                      className="text-xs px-1 py-0 bg-blue-100 text-blue-700 border-blue-200"
                    >
                      Selected
                    </Badge>
                  )}
                  {usedEventTypeIds.includes(eventType.id) && (
                    <Badge
                      variant="secondary"
                      className="text-xs px-1 py-0 bg-green-100 text-green-700 border-green-200"
                    >
                      Currently Using
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatDuration(eventType.duration)}</span>
                </div>

                {eventType.description && (
                  <p className="text-xs text-gray-500">
                    {eventType.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Selection Indicator */}
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${
                    selectedEventTypeId === eventType.id
                      ? "border-blue-500 bg-blue-500 text-white"
                      : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                  }`}
                  onClick={() => onEventTypeSelect(eventType.id)}
                  title={
                    selectedEventTypeId === eventType.id
                      ? "Selected"
                      : "Click to select"
                  }
                >
                  {selectedEventTypeId === eventType.id ? (
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-3 h-3 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>

                {/* Edit Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditEventType(eventType);
                  }}
                >
                  <Edit className="w-3 h-3" />
                </Button>

                {/* Delete Button */}
                {!eventType.isDefault && eventTypes.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteEventType(eventType.id);
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Event Type Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Event Type</DialogTitle>
            <DialogDescription>Modify event type settings</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-event-name">Event Name</Label>
              <Input
                id="edit-event-name"
                value={editingEventType?.name || ""}
                onChange={(e) =>
                  setEditingEventType((prev) =>
                    prev ? { ...prev, name: e.target.value } : null
                  )
                }
                placeholder="Event name"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="edit-event-duration">Duration</Label>
              <Select
                value={editingEventType?.duration.toString() || "30"}
                onValueChange={(value) =>
                  setEditingEventType((prev) =>
                    prev ? { ...prev, duration: parseInt(value) } : null
                  )
                }
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="edit-event-color">Color</Label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      editingEventType?.color === color.value
                        ? "border-gray-900 scale-110"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    style={{ backgroundColor: color.value }}
                    onClick={() =>
                      setEditingEventType((prev) =>
                        prev ? { ...prev, color: color.value } : null
                      )
                    }
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="edit-event-description">
                Description (Optional)
              </Label>
              <Textarea
                id="edit-event-description"
                value={editingEventType?.description || ""}
                onChange={(e) =>
                  setEditingEventType((prev) =>
                    prev ? { ...prev, description: e.target.value } : null
                  )
                }
                placeholder="Brief description"
                className="mt-2"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateEventType}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
