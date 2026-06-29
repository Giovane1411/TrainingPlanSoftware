import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";

import { GetHomeDataInputDto, GetHomeDataOutputDto } from "../entities/home.js";
import { prisma } from "../lib/db.js";
import {
  calculateWorkoutStreak,
  getWeekDayFromDate,
  MAX_STREAK_LOOKBACK_DAYS,
} from "../lib/workout-streak.js";

dayjs.extend(utc);

export class GetHomeData {
  async execute(dto: GetHomeDataInputDto): Promise<GetHomeDataOutputDto> {
    const referenceDate = dayjs.utc(dto.date);
    const weekStart = referenceDate.startOf("week");
    const weekEnd = referenceDate.endOf("week");

    const activeWorkoutPlan = await prisma.workoutPlan.findFirst({
      where: { userId: dto.userId, isActive: true },
      include: { workoutDays: { include: { exercises: true } } },
    });

    const todayWeekDay = getWeekDayFromDate(referenceDate);
    const todayWorkoutDay = activeWorkoutPlan?.workoutDays.find(
      (workoutDay) => workoutDay.weekDay === todayWeekDay,
    );

    const weekSessions = await prisma.workoutSession.findMany({
      where: {
        startedAt: { gte: weekStart.toDate(), lte: weekEnd.toDate() },
        workoutDay: { workoutPlan: { userId: dto.userId } },
      },
    });

    const consistencyByDay: GetHomeDataOutputDto["consistencyByDay"] = {};
    for (let i = 0; i < 7; i++) {
      const day = weekStart.add(i, "day").format("YYYY-MM-DD");
      consistencyByDay[day] = { workoutDayCompleted: false, workoutDayStarted: false };
    }
    weekSessions.forEach((session) => {
      const day = dayjs.utc(session.startedAt).format("YYYY-MM-DD");
      const entry = consistencyByDay[day];
      if (!entry) {
        return;
      }
      entry.workoutDayStarted = true;
      if (session.completedAt) {
        entry.workoutDayCompleted = true;
      }
    });

    const lookbackStart = referenceDate.subtract(MAX_STREAK_LOOKBACK_DAYS, "day");
    const completedSessions = await prisma.workoutSession.findMany({
      where: {
        startedAt: { gte: lookbackStart.toDate(), lte: weekEnd.toDate() },
        completedAt: { not: null },
        workoutDay: { workoutPlan: { userId: dto.userId } },
      },
    });
    const completedDates = new Set(
      completedSessions.map((session) => dayjs.utc(session.startedAt).format("YYYY-MM-DD")),
    );

    const workoutStreak = calculateWorkoutStreak({
      anchorDate: referenceDate,
      activePlanWeekDays: activeWorkoutPlan?.workoutDays.map((workoutDay) => workoutDay.weekDay) ?? [],
      completedDates,
    });

    return {
      activeWorkoutPlanId: activeWorkoutPlan?.id ?? null,
      todayWorkoutDay: todayWorkoutDay
        ? {
            workoutPlanId: todayWorkoutDay.workoutPlanId,
            id: todayWorkoutDay.id,
            name: todayWorkoutDay.name,
            isRest: todayWorkoutDay.isRest,
            weekDay: todayWorkoutDay.weekDay,
            estimatedDurationInSeconds: todayWorkoutDay.estimatedDurationInSeconds,
            coverImageUrl: todayWorkoutDay.coverImageUrl ?? undefined,
            exercisesCount: todayWorkoutDay.exercises.length,
          }
        : null,
      workoutStreak,
      consistencyByDay,
    };
  }
}
