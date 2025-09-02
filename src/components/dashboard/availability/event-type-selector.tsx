"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { EventType, TimeSlot } from "@/interfaces";
import { Clock, Plus, X } from "lucide-react";
import { useState } from "react";

interface EventTypeSelectorProps {
  eventTypes: EventType[];
  selectedEventType: EventType | null;
  onEventTypeSelect: (eventType: EventType | null) => void;
  onTimeSlotAdd: (timeSlot: TimeSlot) => void;
  existingTimeSlots: TimeSlot[];
  className?: string;
}

export function EventTypeSelector({
  eventTypes,
  selectedEventType,
  onEventTypeSelect,
  onTimeSlotAdd,
  existingTimeSlots,
  className,
}: EventTypeSelectorProps) {
  const [showTimeSlotForm, setShowTimeSlotForm] = useState(false);
  const [newTimeSlot, setNewTimeSlot] = useState({
    startTime: "09:00",
    endTime: "09:30",
  });

  const handleEventTypeSelect = (eventType: EventType) => {
    if (selectedEventType?.id === eventType.id) {
      onEventTypeSelect(null);
    } else {
      onEventTypeSelect(eventType);
    }
  };

  const handleAddTimeSlot = () => {
    if (!selectedEventType) return;

    const timeSlot: TimeSlot = {
      id: crypto.randomUUID(),
      startTime: newTimeSlot.startTime,
      endTime: newTimeSlot.endTime,
      eventTypeId: selectedEventType.id,
      eventType: selectedEventType,
    };

    onTimeSlotAdd(timeSlot);
    setNewTimeSlot({ startTime: "09:00", endTime: "09:30" });
    setShowTimeSlotForm(false);
  };

  const calculateEndTime = (startTime: string, durationMinutes: number) => {
    const [hours, minutes] = startTime.split(":").map(Number);
    const startDate = new Date(2000, 0, 1, hours, minutes);
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
    return endDate.toTimeString().slice(0, 5);
  };

  const updateEndTime = (startTime: string) => {
    if (selectedEventType) {
      const endTime = calculateEndTime(startTime, selectedEventType.duration);
      setNewTimeSlot({ startTime, endTime });
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
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
      {/* Event Type Selection */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">
          Select Event Type for Time Slots
        </h4>
        <div className="flex flex-wrap gap-2">
          {eventTypes.map((eventType) => (
            <button
              key={eventType.id}
              onClick={() => handleEventTypeSelect(eventType)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all duration-200 ${
                selectedEventType?.id === eventType.id
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: eventType.color }}
              />
              <span className="text-sm font-medium">{eventType.name}</span>
              <Badge variant="secondary" className="text-xs">
                {formatDuration(eventType.duration)}
              </Badge>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Event Type Info */}
      {selectedEventType && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: selectedEventType.color }}
              />
              <span className="font-medium text-blue-900">
                {selectedEventType.name}
              </span>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                {formatDuration(selectedEventType.duration)}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEventTypeSelect(null)}
              className="text-blue-600 hover:text-blue-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          {selectedEventType.description && (
            <p className="text-sm text-blue-700 mt-1">
              {selectedEventType.description}
            </p>
          )}
        </div>
      )}

      {/* Time Slot Creation */}
      {selectedEventType && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-900">
              Add {formatDuration(selectedEventType.duration)} Time Slots
            </h4>
            <Button
              size="sm"
              onClick={() => setShowTimeSlotForm(!showTimeSlotForm)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Slot
            </Button>
          </div>

          {showTimeSlotForm && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={newTimeSlot.startTime}
                    onChange={(e) => {
                      const startTime = e.target.value;
                      setNewTimeSlot((prev) => ({ ...prev, startTime }));
                      updateEndTime(startTime);
                    }}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={newTimeSlot.endTime}
                    onChange={(e) =>
                      setNewTimeSlot((prev) => ({
                        ...prev,
                        endTime: e.target.value,
                      }))
                    }
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    readOnly
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Auto-calculated based on{" "}
                    {formatDuration(selectedEventType.duration)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleAddTimeSlot}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Time Slot
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowTimeSlotForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Existing Time Slots Display */}
      {existingTimeSlots.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Current Time Slots
          </h4>
          <div className="space-y-2">
            {existingTimeSlots.map((slot) => {
              const eventType = eventTypes.find(
                (et) => et.id === slot.eventTypeId
              );
              return (
                <div
                  key={slot.id}
                  className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium">
                      {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                    </span>
                    {eventType && (
                      <Badge
                        variant="secondary"
                        className="text-xs"
                        style={{
                          backgroundColor: `${eventType.color}20`,
                          color: eventType.color,
                          borderColor: eventType.color,
                        }}
                      >
                        {eventType.name}
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
