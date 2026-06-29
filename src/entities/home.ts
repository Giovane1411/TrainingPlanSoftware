import { WeekDay } from "../generated/prisma/enums.js"

export type GetHomeDataInputDto = {
    userId: string,
    date: string
}

export type GetHomeDataOutputDto = {
    activeWorkoutPlanId: string | null,
    todayWorkoutDay: {
        workoutPlanId: string,
        id: string,
        name: string,
        isRest: boolean,
        weekDay: WeekDay,
        estimatedDurationInSeconds: number,
        coverImageUrl?: string,
        exercisesCount: number
    } | null,
    workoutStreak: number,
    consistencyByDay: Record<string, {
        workoutDayCompleted: boolean,
        workoutDayStarted: boolean
    }>
}
