import {
  ListWorkoutPlansInputDto,
  ListWorkoutPlansOutputDto,
} from "../entities/workout-plan.js";
import { prisma } from "../lib/db.js";

export class ListWorkoutPlans {
  async execute(dto: ListWorkoutPlansInputDto): Promise<ListWorkoutPlansOutputDto> {
    const workoutPlans = await prisma.workoutPlan.findMany({
      where: { userId: dto.userId },
      include: {
        workoutDays: {
          include: {
            exercises: true,
          },
        },
      },
    });

    return workoutPlans.map((workoutPlan) => ({
      id: workoutPlan.id,
      name: workoutPlan.name,
      isActive: workoutPlan.isActive,
      workoutDays: workoutPlan.workoutDays.map((day) => ({
        name: day.name,
        weekDay: day.weekDay,
        isRest: day.isRest,
        estimatedDurationInSeconds: day.estimatedDurationInSeconds,
        coverImageUrl: day.coverImageUrl ?? undefined,
        exercises: day.exercises.map((exercise) => ({
          order: exercise.order,
          name: exercise.name,
          sets: exercise.sets,
          reps: exercise.reps,
          restTimeInSeconds: exercise.restTimeInSeconds,
        })),
      })),
    }));
  }
}
