import z from "zod/v4";

import { WeekDay } from "../generated/prisma/enums.js";

export const ErrorSchema = z.object({
    error: z.string(),
    code: z.string(),
});

export const WorkoutExerciseSchema = z.object({
  name: z.string().trim().min(1),
  order: z.number().min(0),
  sets: z.number().min(1),
  reps: z.number().min(1),
  restTimeInSeconds: z.number().min(1),
});

export const WorkoutDaySchema = z.object({
  name: z.string().trim().min(1),
  weekDay: z.enum(WeekDay),
  isRest: z.boolean().default(false),
  estimatedDurationInSeconds: z.number().min(1),
  coverImageUrl: z.string().url().optional(),
  exercises: z.array(WorkoutExerciseSchema),
});

export const WorkoutPlanSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1),
  workoutDays: z.array(WorkoutDaySchema),
});

export const WorkoutSessionParamsSchema = z.object({
  workoutPlanId: z.string().uuid(),
  workoutDayId: z.string().uuid(),
});

export const WorkoutSessionResponseSchema = z.object({
  id: z.string().uuid(),
});

export const CompleteWorkoutSessionParamsSchema = z.object({
  workoutPlanId: z.string().uuid(),
  workoutDayId: z.string().uuid(),
  sessionId: z.string().uuid(),
});

export const CompleteWorkoutSessionBodySchema = z.object({
  completedAt: z.iso.datetime(),
});

export const CompleteWorkoutSessionResponseSchema = z.object({
  id: z.string().uuid(),
  startedAt: z.iso.datetime(),
  completedAt: z.iso.datetime(),
});

export const UserTrainDataSchema = z.object({
  userId: z.string(),
  userName: z.string(),
  weightInGrams: z.number(),
  heightInCentimeters: z.number(),
  age: z.number(),
  bodyFatPercentage: z.number(),
});

export const GetWorkoutPlanParamsSchema = z.object({
  id: z.string().uuid(),
});

export const GetWorkoutPlanResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  workoutDays: z.array(
    z.object({
      id: z.string().uuid(),
      weekDay: z.enum(WeekDay),
      name: z.string(),
      isRest: z.boolean(),
      coverImageUrl: z.string().url().optional(),
      estimatedDurationInSeconds: z.number(),
      exercisesCount: z.number(),
    }),
  ),
});

export const GetWorkoutDayParamsSchema = z.object({
  workoutPlanId: z.string().uuid(),
  workoutDayId: z.string().uuid(),
});

export const GetWorkoutDayResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  isRest: z.boolean(),
  coverImageUrl: z.string().url().optional(),
  estimatedDurationInSeconds: z.number(),
  weekDay: z.enum(WeekDay),
  exercises: z.array(
    z.object({
      id: z.string().uuid(),
      name: z.string(),
      order: z.number(),
      workoutDayId: z.string().uuid(),
      sets: z.number(),
      reps: z.number(),
      restTimeInSeconds: z.number(),
    }),
  ),
  sessions: z.array(
    z.object({
      id: z.string().uuid(),
      workoutDayId: z.string().uuid(),
      startedAt: z.iso.date(),
      completedAt: z.iso.date().optional(),
    }),
  ),
});

export const GetStatsQuerySchema = z.object({
  from: z.iso.date(),
  to: z.iso.date(),
});

export const GetStatsResponseSchema = z.object({
  workoutStreak: z.number(),
  consistencyByDay: z.record(
    z.string(),
    z.object({
      workoutDayCompleted: z.boolean(),
      workoutDayStarted: z.boolean(),
    }),
  ),
  completedWorkoutsCount: z.number(),
  conclusionRate: z.number(),
  totalTimeInSeconds: z.number(),
});

export const GetHomeDataParamsSchema = z.object({
  date: z.iso.date(),
});

export const GetHomeDataResponseSchema = z.object({
  activeWorkoutPlanId: z.string().uuid().nullable(),
  todayWorkoutDay: z
    .object({
      workoutPlanId: z.string().uuid(),
      id: z.string().uuid(),
      name: z.string(),
      isRest: z.boolean(),
      weekDay: z.enum(WeekDay),
      estimatedDurationInSeconds: z.number(),
      coverImageUrl: z.string().url().optional(),
      exercisesCount: z.number(),
    })
    .nullable(),
  workoutStreak: z.number(),
  consistencyByDay: z.record(
    z.string(),
    z.object({
      workoutDayCompleted: z.boolean(),
      workoutDayStarted: z.boolean(),
    }),
  ),
});
