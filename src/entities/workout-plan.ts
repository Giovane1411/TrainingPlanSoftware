import { WeekDay } from "../generated/prisma/enums.js"

export type CreateWorkoutPlanInputDto = {
    userId: string,
    name: string,
    workoutDays: WorkoutDayInputDto[]
}

export type CreateWorkoutPlanOutputDto = {
    id: string,
    name: string,
    workoutDays: WorkoutDayInputDto[]
}

export type ListWorkoutPlansInputDto = {
    userId: string
}

export type ListWorkoutPlansOutputDto = Array<{
    id: string,
    name: string,
    isActive: boolean,
    workoutDays: WorkoutDayInputDto[]
}>

export type GetWorkoutPlanInputDto = {
    userId: string,
    workoutPlanId: string
}

export type GetWorkoutPlanOutputDto = {
    id: string,
    name: string,
    workoutDays: Array<{
        id: string,
        weekDay: WeekDay,
        name: string,
        isRest: boolean,
        coverImageUrl?: string,
        estimatedDurationInSeconds: number,
        exercisesCount: number
    }>
}

export type GetWorkoutDayInputDto = {
    userId: string,
    workoutPlanId: string,
    workoutDayId: string
}

export type GetWorkoutDayOutputDto = {
    id: string,
    name: string,
    isRest: boolean,
    coverImageUrl?: string,
    estimatedDurationInSeconds: number,
    weekDay: WeekDay,
    exercises: Array<{
        id: string,
        name: string,
        order: number,
        workoutDayId: string,
        sets: number,
        reps: number,
        restTimeInSeconds: number
    }>,
    sessions: Array<{
        id: string,
        workoutDayId: string,
        startedAt: string,
        completedAt?: string
    }>
}

export type WorkoutDayInputDto = {
    name: string,
    isRest: boolean,
    weekDay: WeekDay,
    estimatedDurationInSeconds: number,
    coverImageUrl?: string,
    exercises: WorkoutExerciseInputDto[]
}

export type WorkoutExerciseInputDto = {
    name: string,
    order: number,
    sets: number, 
    reps: number,
    restTimeInSeconds: number
}