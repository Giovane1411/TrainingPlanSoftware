export type UpsertUserTrainDataInputDto = {
    userId: string,
    weightInGrams: number,
    heightInCentimeters: number,
    age: number,
    bodyFatPercentage: number
}

export type UpsertUserTrainDataOutputDto = {
    userId: string,
    weightInGrams: number,
    heightInCentimeters: number,
    age: number,
    bodyFatPercentage: number
}

export type GetUserTrainDataInputDto = {
    userId: string
}

export type GetUserTrainDataOutputDto = {
    userId: string,
    userName: string,
    weightInGrams: number,
    heightInCentimeters: number,
    age: number,
    bodyFatPercentage: number
}
