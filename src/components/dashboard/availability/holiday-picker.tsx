"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import API from "@/http";
import { Calendar } from "lucide-react";
import { useEffect, useState } from "react";

interface Holiday {
  date: string;
  name: string;
  type: string;
  category?: 'federal' | 'religious' | 'cultural';
  religion?: 'christian' | 'jewish' | 'muslim' | 'hindu' | 'buddhist' | 'other';
}

interface HolidayPickerProps {
  selectedHolidays: string[];
  onHolidaysChange: (holidays: string[]) => void;
  className?: string;
  filterType?: 'federal' | 'religious' | 'all';
}

export function HolidayPicker({ selectedHolidays, onHolidaysChange, className, filterType = 'all' }: HolidayPickerProps) {
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
      const response = await API.holidays.getExtendedHolidays();
      if (response.status) {
        setHolidays(response.holidays);
      } else {
        throw new Error('Failed to fetch holidays');
      }
    } catch (error) {
      console.error('Error fetching holidays:', error);
      setError('Failed to load holidays');
    } finally {
      setIsLoading(false);
    }
  };

  const handleHolidayToggle = (holidayDate: string, checked: boolean) => {
    if (checked) {
      // Add holiday to exclusion list
      onHolidaysChange([...selectedHolidays, holidayDate]);
    } else {
      // Remove holiday from exclusion list
      onHolidaysChange(selectedHolidays.filter(date => date !== holidayDate));
    }
  };

  const handleSelectAll = () => {
    onHolidaysChange(holidays.map(h => h.date));
  };

  const handleSelectNone = () => {
    onHolidaysChange([]);
  };

  const handleSelectByReligion = (religion: string) => {
    const religionHolidays = holidays
      .filter(h => h.religion === religion)
      .map(h => h.date);
    
    // Add religion holidays to current selection (don't replace)
    const newSelection = [...new Set([...selectedHolidays, ...religionHolidays])];
    onHolidaysChange(newSelection);
  };

  const handleSelectAllFederal = () => {
    const federalHolidayDates = federalHolidays.map(h => h.date);
    const newSelection = [...new Set([...selectedHolidays, ...federalHolidayDates])];
    onHolidaysChange(newSelection);
  };

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Select Holidays to Exclude</Label>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center space-x-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-4 ${className}`}>
        <p className="text-red-600 mb-2">{error}</p>
        <Button variant="outline" size="sm" onClick={fetchHolidays}>
          Retry
        </Button>
      </div>
    );
  }

  // Filter holidays based on the filterType prop
  const filteredHolidays = holidays.filter(h => {
    if (filterType === 'federal') return h.category === 'federal';
    if (filterType === 'religious') return h.category === 'religious';
    return true; // 'all' case
  });

  const federalHolidays = holidays.filter(h => h.category === 'federal');
  const religiousHolidays = holidays.filter(h => h.category === 'religious');

  const getReligionBadge = (religion?: string) => {
    const colors = {
      jewish: 'bg-blue-100 text-blue-800',
      muslim: 'bg-green-100 text-green-800', 
      hindu: 'bg-orange-100 text-orange-800',
      christian: 'bg-purple-100 text-purple-800',
      buddhist: 'bg-yellow-100 text-yellow-800',
    };
    
    if (!religion) return null;
    
    return (
      <Badge variant="outline" className={`text-xs ${colors[religion as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {religion.charAt(0).toUpperCase() + religion.slice(1)}
      </Badge>
    );
  };

  const renderHolidayList = (holidayList: Holiday[]) => (
    <div className="space-y-3">
      {holidayList.map((holiday) => {
        const isSelected = selectedHolidays.includes(holiday.date);
        const holidayDate = new Date(holiday.date);
        const formattedDate = holidayDate.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
        
        return (
          <div key={holiday.date} className="flex items-center space-x-3">
            <Checkbox
              id={holiday.date}
              checked={isSelected}
              onCheckedChange={(checked) => handleHolidayToggle(holiday.date, checked as boolean)}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Label htmlFor={holiday.date} className="text-sm font-medium cursor-pointer">
                  {holiday.name}
                </Label>
                {getReligionBadge(holiday.religion)}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{formattedDate}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const religions = ['jewish', 'christian', 'muslim', 'hindu', 'buddhist'];
  const religionCounts = religions.reduce((acc, religion) => {
    acc[religion] = holidays.filter(h => h.religion === religion).length;
    return acc;
  }, {} as Record<string, number>);

  // If filtering by specific type, show simplified interface
  if (filterType !== 'all') {
    const holidayTypeLabel = filterType === 'federal' ? 'Federal' : 'Religious';
    
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">{holidayTypeLabel} Holiday Exclusion</Label>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onHolidaysChange(filteredHolidays.map(h => h.date))}>
              Select All
            </Button>
            <Button variant="outline" size="sm" onClick={handleSelectNone}>
              Clear All
            </Button>
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground">
          Choose which {filterType} holidays to exclude from interview booking.
        </div>
        
        {filterType === 'religious' && (
          <div className="flex flex-wrap gap-2">
            {religions.map(religion => (
              religionCounts[religion] > 0 && (
                <Button 
                  key={religion}
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleSelectByReligion(religion)}
                  className="flex items-center gap-1"
                >
                  {religion === 'jewish' && '🕎'}
                  {religion === 'christian' && '✝️'}
                  {religion === 'muslim' && '☪️'}
                  {religion === 'hindu' && '🕉️'}
                  {religion === 'buddhist' && '☸️'}
                  <span>All {religion.charAt(0).toUpperCase() + religion.slice(1)} ({religionCounts[religion]})</span>
                </Button>
              )
            ))}
          </div>
        )}
        
        <ScrollArea className="h-64 border rounded-lg p-4 bg-white">
          {renderHolidayList(filteredHolidays)}
        </ScrollArea>
        
        <div className="text-xs text-muted-foreground">
          Selected {selectedHolidays.length} of {filteredHolidays.length} {filterType} holidays to exclude
        </div>
      </div>
    );
  }

  // Original tabbed interface for 'all' case
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Holiday Exclusion Settings</Label>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleSelectAll}>
              Select All
            </Button>
            <Button variant="outline" size="sm" onClick={handleSelectNone}>
              Clear All
            </Button>
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground">
          Choose which holidays to exclude from interview booking. Selected holidays will not be available for scheduling.
        </div>
      </div>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all" className="text-sm">All Holidays ({holidays.length})</TabsTrigger>
          <TabsTrigger value="federal" className="text-sm">Federal ({federalHolidays.length})</TabsTrigger>
          <TabsTrigger value="religious" className="text-sm">Religious ({religiousHolidays.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <ScrollArea className="h-64 border rounded-lg p-4 bg-white">
            {renderHolidayList(holidays)}
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="federal" className="mt-6">
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={handleSelectAllFederal}>
                Select All Federal
              </Button>
            </div>
            <ScrollArea className="h-64 border rounded-lg p-4 bg-white">
              {renderHolidayList(federalHolidays)}
            </ScrollArea>
          </div>
        </TabsContent>
        
        <TabsContent value="religious" className="mt-6">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 justify-center">
              {religions.map(religion => (
                religionCounts[religion] > 0 && (
                  <Button 
                    key={religion}
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleSelectByReligion(religion)}
                    className="flex items-center gap-1"
                  >
                    {religion === 'jewish' && '🕎'}
                    {religion === 'christian' && '✝️'}
                    {religion === 'muslim' && '☪️'}
                    {religion === 'hindu' && '🕉️'}
                    {religion === 'buddhist' && '☸️'}
                    <span>All {religion.charAt(0).toUpperCase() + religion.slice(1)} ({religionCounts[religion]})</span>
                  </Button>
                )
              ))}
            </div>
            <ScrollArea className="h-64 border rounded-lg p-4 bg-white">
              {renderHolidayList(religiousHolidays)}
            </ScrollArea>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="text-xs text-muted-foreground">
        Selected {selectedHolidays.length} of {holidays.length} holidays to exclude
      </div>
    </div>
  );
}
