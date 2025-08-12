"use client";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Clock,
  Globe,
  Loader2,
  RefreshCw,
  Users,
} from "lucide-react";

interface AvailabilityOverviewProps {
  title: string;
  description: string;
  totalAvailableDays: number;
  totalTimeSlots: number;
  totalAvailableHours: number;
  totalBookedAppointments: number;
  currentTimezone: string;
  onTimezoneChange: (timezone: string) => void;
  timeZones: string[];
  isLoading?: boolean;
  isUpdatingTimezone?: boolean;
  onRefresh?: () => void;
}

export function AvailabilityOverview({
  title,
  description,
  totalAvailableDays,
  totalTimeSlots,
  totalAvailableHours,
  totalBookedAppointments,
  currentTimezone,
  onTimezoneChange,
  timeZones,
  isLoading = false,
  isUpdatingTimezone = false,
  onRefresh,
}: AvailabilityOverviewProps) {
  return (
    <>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          )}
        </div>
        <p className="text-sm text-gray-500">{description}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-xl border-0 shadow-sm hover:shadow-md transition-all duration-200 p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-600 mb-1">
                Available Days
              </p>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                  <span className="text-sm text-gray-400">Loading...</span>
                </div>
              ) : (
                <p className="text-2xl font-bold text-gray-900">
                  {totalAvailableDays}
                </p>
              )}
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-500">per week</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border-0 shadow-sm hover:shadow-md transition-all duration-200 p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-600 mb-1">
                Time Slots
              </p>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                  <span className="text-sm text-gray-400">Loading...</span>
                </div>
              ) : (
                <p className="text-2xl font-bold text-gray-900">
                  {totalTimeSlots}
                </p>
              )}
            </div>
            <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
              <Clock className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-500">available</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border-0 shadow-sm hover:shadow-md transition-all duration-200 p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-600 mb-1">
                Hours/Week
              </p>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                  <span className="text-sm text-gray-400">Loading...</span>
                </div>
              ) : (
                <p className="text-2xl font-bold text-gray-900">
                  {totalAvailableHours.toFixed(1)}
                </p>
              )}
            </div>
            <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-500">total available</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border-0 shadow-sm hover:shadow-md transition-all duration-200 p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-600 mb-1">
                Booked Appointments
              </p>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                  <span className="text-sm text-gray-400">Loading...</span>
                </div>
              ) : (
                <p className="text-2xl font-bold text-gray-900">
                  {totalBookedAppointments}
                </p>
              )}
            </div>
            <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
              <Users className="h-5 w-5 text-orange-600" />
            </div>
          </div>
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-500">total scheduled</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-blue-50 flex items-center justify-center">
              <Globe className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                Timezone
              </h3>
              <p className="text-xs text-gray-500">
                Set your local timezone for accurate scheduling
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-700">Current:</span>
            <Select
              value={currentTimezone}
              onValueChange={onTimezoneChange}
              disabled={isUpdatingTimezone}
            >
              <SelectTrigger className="w-48 h-8 border-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                {isUpdatingTimezone ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Updating...</span>
                  </div>
                ) : (
                  <SelectValue placeholder="Select timezone" />
                )}
              </SelectTrigger>
              <SelectContent>
                {timeZones.map((timezone) => (
                  <SelectItem key={timezone} value={timezone}>
                    {timezone.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </>
  );
}
