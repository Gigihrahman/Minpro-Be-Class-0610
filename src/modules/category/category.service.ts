import { injectable } from "tsyringe";
import { PrismaService } from "../prisma/prisma.service";

@injectable()
export class CategoryService {
  private prisma: PrismaService;

  constructor(PrismaClient: PrismaService) {
    this.prisma = PrismaClient;
  }

  getCategories = async () => {
    const categories = await this.prisma.categories.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });
    return categories;
  };
}
