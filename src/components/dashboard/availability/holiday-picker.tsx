"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import API from "@/http";
import { Calendar } from "lucide-react";
import { useEffect, useState } from "react";

interface Holiday {
  date: string;
  name: string;
  type: string;
}

interface HolidayPickerProps {
  selectedHolidays: string[];
  onHolidaysChange: (holidays: string[]) => void;
  className?: string;
  filterType?: string;
}

export function HolidayPicker({ selectedHolidays, onHolidaysChange, className }: HolidayPickerProps) {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('🎄 Fetching holidays from API...');
      const response = await API.holidays.getExtendedHolidays();
      console.log('🎄 Holiday API response:', response);
      
      if (response.status) {
        setHolidays(response.holidays || []);
        console.log('✅ Loaded', response.holidays?.length || 0, 'holidays');
      } else {
        throw new Error('Failed to fetch holidays');
      }
    } catch (error) {
      console.error('❌ Error fetching holidays:', error);
      setError('Failed to load holidays. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleHolidayToggle = (holidayDate: string, checked: boolean) => {
    if (checked) {
      onHolidaysChange([...selectedHolidays, holidayDate]);
    } else {
      onHolidaysChange(selectedHolidays.filter(date => date !== holidayDate));
    }
  };

  const handleSelectAll = () => {
    onHolidaysChange(holidays.map(h => h.date));
  };

  const handleSelectNone = () => {
    onHolidaysChange([]);
  };

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Loading Federal Holidays...</Label>
        </div>
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 p-3 border rounded-lg">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-6 ${className}`}>
        <p className="text-red-600 mb-3">{error}</p>
        <Button variant="outline" size="sm" onClick={fetchHolidays}>
          Retry Loading Holidays
        </Button>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Select Federal Holidays to Exclude</Label>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleSelectAll}>
            Select All ({holidays.length})
          </Button>
          <Button variant="outline" size="sm" onClick={handleSelectNone}>
            Clear All
          </Button>
        </div>
      </div>
      
      <div className="text-sm text-muted-foreground">
        Choose which US federal holidays to exclude from interview booking.
      </div>
      
      <ScrollArea className="h-64 border rounded-lg p-4 bg-white">
        <div className="space-y-3">
          {holidays.map((holiday) => {
            const isSelected = selectedHolidays.includes(holiday.date);
            const holidayDate = new Date(holiday.date);
            const formattedDate = holidayDate.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });
            
            return (
              <div key={holiday.date} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <Checkbox
                  id={holiday.date}
                  checked={isSelected}
                  onCheckedChange={(checked) => handleHolidayToggle(holiday.date, checked as boolean)}
                />
                <div className="flex-1">
                  <Label htmlFor={holiday.date} className="text-sm font-medium cursor-pointer">
                    {holiday.name}
                  </Label>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formattedDate}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
      
      <div className="text-xs text-muted-foreground text-center">
        {selectedHolidays.length} of {holidays.length} holidays selected for exclusion
      </div>
    </div>
  );
}
