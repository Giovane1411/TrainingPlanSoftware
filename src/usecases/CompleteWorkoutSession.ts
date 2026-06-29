import {
  CompleteWorkoutSessionInputDto,
  CompleteWorkoutSessionOutputDto,
} from "../entities/workout-session.js";
import { NotFoundError } from "../errors/index.js";
import { prisma } from "../lib/db.js";

export class CompleteWorkoutSession {
  async execute(dto: CompleteWorkoutSessionInputDto): Promise<CompleteWorkoutSessionOutputDto> {
    const workoutPlan = await prisma.workoutPlan.findUnique({
      where: { id: dto.workoutPlanId },
    });

    if (!workoutPlan || workoutPlan.userId !== dto.userId) {
      throw new NotFoundError("Workout plan not found");
    }

    const workoutDay = await prisma.workoutDay.findUnique({
      where: { id: dto.workoutDayId },
    });

    if (!workoutDay || workoutDay.workoutPlanId !== dto.workoutPlanId) {
      throw new NotFoundError("Workout day not found");
    }

    const workoutSession = await prisma.workoutSession.findUnique({
      where: { id: dto.sessionId },
    });

    if (!workoutSession || workoutSession.workoutDayId !== dto.workoutDayId) {
      throw new NotFoundError("Workout session not found");
    }

    const updatedSession = await prisma.workoutSession.update({
      where: { id: dto.sessionId },
      data: { completedAt: dto.completedAt },
    });

    return {
      id: updatedSession.id,
      startedAt: updatedSession.startedAt.toISOString(),
      completedAt: updatedSession.completedAt!.toISOString(),
    };
  }
}
