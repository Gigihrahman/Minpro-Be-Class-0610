import { injectable } from "tsyringe";
import { PrismaService } from "../prisma/prisma.service";

@injectable()
export class CityService {
  private prisma: PrismaService;

  constructor(PrismaClient: PrismaService) {
    this.prisma = PrismaClient;
  }

  getCities = async () => {
    const city = await this.prisma.city.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    return city;
  };
}
