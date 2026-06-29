import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";

import { GetStatsInputDto, GetStatsOutputDto } from "../entities/stats.js";
import { prisma } from "../lib/db.js";
import { calculateWorkoutStreak, MAX_STREAK_LOOKBACK_DAYS } from "../lib/workout-streak.js";

dayjs.extend(utc);

export class GetStats {
  async execute(dto: GetStatsInputDto): Promise<GetStatsOutputDto> {
    const rangeStart = dayjs.utc(dto.from).startOf("day");
    const rangeEnd = dayjs.utc(dto.to).endOf("day");

    const sessionsInRange = await prisma.workoutSession.findMany({
      where: {
        startedAt: { gte: rangeStart.toDate(), lte: rangeEnd.toDate() },
        workoutDay: { workoutPlan: { userId: dto.userId } },
      },
    });

    const consistencyByDay: GetStatsOutputDto["consistencyByDay"] = {};
    sessionsInRange.forEach((session) => {
      const day = dayjs.utc(session.startedAt).format("YYYY-MM-DD");
      const entry = consistencyByDay[day] ?? {
        workoutDayCompleted: false,
        workoutDayStarted: false,
      };
      entry.workoutDayStarted = true;
      if (session.completedAt) {
        entry.workoutDayCompleted = true;
      }
      consistencyByDay[day] = entry;
    });

    const completedSessionsInRange = sessionsInRange.filter((session) => session.completedAt);
    const completedWorkoutsCount = completedSessionsInRange.length;
    const conclusionRate =
      sessionsInRange.length > 0 ? completedWorkoutsCount / sessionsInRange.length : 0;
    const totalTimeInSeconds = completedSessionsInRange.reduce((total, session) => {
      const seconds = dayjs(session.completedAt).diff(dayjs(session.startedAt), "second");
      return total + seconds;
    }, 0);

    const activeWorkoutPlan = await prisma.workoutPlan.findFirst({
      where: { userId: dto.userId, isActive: true },
      include: { workoutDays: true },
    });

    const lookbackStart = rangeEnd.subtract(MAX_STREAK_LOOKBACK_DAYS, "day");
    const completedSessionsForStreak = await prisma.workoutSession.findMany({
      where: {
        startedAt: { gte: lookbackStart.toDate(), lte: rangeEnd.toDate() },
        completedAt: { not: null },
        workoutDay: { workoutPlan: { userId: dto.userId } },
      },
    });
    const completedDates = new Set(
      completedSessionsForStreak.map((session) => dayjs.utc(session.startedAt).format("YYYY-MM-DD")),
    );

    const workoutStreak = calculateWorkoutStreak({
      anchorDate: rangeEnd,
      activePlanWeekDays: activeWorkoutPlan?.workoutDays.map((workoutDay) => workoutDay.weekDay) ?? [],
      completedDates,
    });

    return {
      workoutStreak,
      consistencyByDay,
      completedWorkoutsCount,
      conclusionRate,
      totalTimeInSeconds,
    };
  }
}
