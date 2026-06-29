import { NotFoundError } from "../errors/index.js";
import { SessionAlreadyStartedError } from "../errors/index.js";
import { WorkoutPlanNotActiveError } from "../errors/index.js";
import { prisma } from "../lib/db.js";
import {
  StartWorkoutSessionInputDto,
  StartWorkoutSessionOutputDto,
} from "../entities/workout-session.js";

export class StartWorkoutSession {
  async execute(dto: StartWorkoutSessionInputDto): Promise<StartWorkoutSessionOutputDto> {
    const workoutPlan = await prisma.workoutPlan.findUnique({
      where: { id: dto.workoutPlanId },
    });

    if (!workoutPlan) {
      throw new NotFoundError("Workout plan not found");
    }

    if (!workoutPlan.isActive) {
      throw new WorkoutPlanNotActiveError("Workout plan is not active");
    }

    if (workoutPlan.userId !== dto.userId) {
      throw new NotFoundError("Workout plan not found");
    }

    const workoutDay = await prisma.workoutDay.findUnique({
      where: { id: dto.workoutDayId },
    });

    if (!workoutDay || workoutDay.workoutPlanId !== dto.workoutPlanId) {
      throw new NotFoundError("Workout day not found");
    }

    const existingSession = await prisma.workoutSession.findFirst({
      where: {
        workoutDayId: dto.workoutDayId,
        completedAt: null,
      },
    });

    if (existingSession) {
      throw new SessionAlreadyStartedError("A session for this day has already been started");
    }

    const session = await prisma.workoutSession.create({
      data: {
        id: crypto.randomUUID(),
        workoutDayId: dto.workoutDayId,
        startedAt: new Date(),
      },
    });

    return { id: session.id };
  }
}
