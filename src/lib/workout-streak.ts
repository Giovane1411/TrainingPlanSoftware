import { Dayjs } from "dayjs";

import { WeekDay } from "../generated/prisma/enums.js";

const WEEKDAY_BY_INDEX: WeekDay[] = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

export const MAX_STREAK_LOOKBACK_DAYS = 400;

export const getWeekDayFromDate = (date: Dayjs): WeekDay => WEEKDAY_BY_INDEX[date.day()];

export const calculateWorkoutStreak = ({
  anchorDate,
  activePlanWeekDays,
  completedDates,
}: {
  anchorDate: Dayjs;
  activePlanWeekDays: WeekDay[];
  completedDates: Set<string>;
}): number => {
  let workoutStreak = 0;
  let cursor = anchorDate;

  for (let i = 0; i < MAX_STREAK_LOOKBACK_DAYS; i++) {
    if (!activePlanWeekDays.includes(getWeekDayFromDate(cursor))) {
      cursor = cursor.subtract(1, "day");
      continue;
    }
    if (!completedDates.has(cursor.format("YYYY-MM-DD"))) {
      break;
    }
    workoutStreak += 1;
    cursor = cursor.subtract(1, "day");
  }

  return workoutStreak;
};
