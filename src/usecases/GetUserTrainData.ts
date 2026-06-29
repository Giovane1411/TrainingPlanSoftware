import {
  GetUserTrainDataInputDto,
  GetUserTrainDataOutputDto,
} from "../entities/user-train-data.js";
import { prisma } from "../lib/db.js";

export class GetUserTrainData {
  async execute(dto: GetUserTrainDataInputDto): Promise<GetUserTrainDataOutputDto | null> {
    const userTrainData = await prisma.userTrainData.findUnique({
      where: { userId: dto.userId },
      include: { user: true },
    });

    if (!userTrainData) {
      return null;
    }

    return {
      userId: userTrainData.userId,
      userName: userTrainData.user.name,
      weightInGrams: userTrainData.weightInGrams,
      heightInCentimeters: userTrainData.heightInCentimeters,
      age: userTrainData.age,
      bodyFatPercentage: userTrainData.bodyFatPercentage,
    };
  }
}
