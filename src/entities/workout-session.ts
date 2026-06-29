export type StartWorkoutSessionInputDto = {
    userId: string,
    workoutPlanId: string,
    workoutDayId: string
}

export type StartWorkoutSessionOutputDto = {
    id: string
}

export type CompleteWorkoutSessionInputDto = {
    userId: string,
    workoutPlanId: string,
    workoutDayId: string,
    sessionId: string,
    completedAt: Date
}

export type CompleteWorkoutSessionOutputDto = {
    id: string,
    startedAt: string,
    completedAt: string
}
