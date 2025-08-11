import { v4 as uuidv4 } from "uuid";

// Interface for date-specific settings
export interface DateSpecificSettings {
  date: Date;
  isAvailable: boolean;
  timeSlots: Array<{
    id: string;
    startTime: string;
    endTime: string;
  }>;
}

export interface DateSpecificFormData {
  dates: DateSpecificSettings[];
}

// Generate test data with future dates
export const generateDateSpecificTestData = (): DateSpecificFormData => {
  const today = new Date();

  // Tomorrow
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Next week (7 days from today)
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  // Next month
  const nextMonth = new Date(today);
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  // Weekend dates (next Saturday and Sunday)
  const nextSaturday = new Date(today);
  const daysUntilSaturday = (6 - today.getDay() + 7) % 7;
  nextSaturday.setDate(today.getDate() + daysUntilSaturday);

  const nextSunday = new Date(nextSaturday);
  nextSunday.setDate(nextSaturday.getDate() + 1);

  // Special dates (next month with specific day)
  const nextMonthSpecific = new Date(today);
  nextMonthSpecific.setMonth(today.getMonth() + 1);
  nextMonthSpecific.setDate(15); // 15th of next month

  return {
    dates: [
      {
        date: tomorrow,
        isAvailable: true,
        timeSlots: [
          { id: uuidv4(), startTime: "09:00", endTime: "12:00" },
          { id: uuidv4(), startTime: "14:00", endTime: "17:00" }, // No overlap - properly spaced
        ],
      },
      {
        date: nextWeek,
        isAvailable: true,
        timeSlots: [{ id: uuidv4(), startTime: "10:00", endTime: "16:00" }],
      },
      {
        date: nextMonth,
        isAvailable: true,
        timeSlots: [
          { id: uuidv4(), startTime: "08:00", endTime: "11:00" },
          { id: uuidv4(), startTime: "13:00", endTime: "18:00" }, // No overlap - properly spaced
        ],
      },
      {
        date: nextSaturday,
        isAvailable: true,
        timeSlots: [{ id: uuidv4(), startTime: "10:00", endTime: "14:00" }],
      },
      {
        date: nextSunday,
        isAvailable: false,
        timeSlots: [],
      },
      {
        date: nextMonthSpecific,
        isAvailable: true,
        timeSlots: [
          { id: uuidv4(), startTime: "09:30", endTime: "12:30" },
          { id: uuidv4(), startTime: "14:30", endTime: "16:30" },
        ],
      },
    ],
  };
};

// Default empty form data
export const defaultDateSpecificData: DateSpecificFormData = {
  dates: [],
};

// Sample time slot templates for quick addition
export const timeSlotTemplates = [
  { startTime: "09:00", endTime: "12:00" },
  { startTime: "13:00", endTime: "17:00" },
  { startTime: "10:00", endTime: "16:00" },
  { startTime: "08:00", endTime: "11:00" },
  { startTime: "14:00", endTime: "18:00" },
  { startTime: "09:30", endTime: "12:30" },
  { startTime: "14:30", endTime: "16:30" },
];
