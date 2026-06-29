export type GetStatsInputDto = {
    userId: string,
    from: string,
    to: string
}

export type GetStatsOutputDto = {
    workoutStreak: number,
    consistencyByDay: Record<string, {
        workoutDayCompleted: boolean,
        workoutDayStarted: boolean
    }>,
    completedWorkoutsCount: number,
    conclusionRate: number,
    totalTimeInSeconds: number
}
