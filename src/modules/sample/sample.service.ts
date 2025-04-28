import { injectable } from "tsyringe";

import { ApiError } from "../../utils/api-error";
import { PrismaService } from "../prisma/prisma.service";
import type { CreateSampleDTO } from "./dto/create-sample.dto";
import type { UpdateSampleDTO } from "./dto/update-sample.dto";

@injectable()
export class SampleService {
  private prisma: PrismaService;

  constructor(PrismaClient: PrismaService) {
    this.prisma = PrismaClient;
  }
  private async findSampleOrThrow(id: number) {
    const sample = await this.prisma.sample.findFirst({
      where: { id },
    });
    if (!sample) throw new ApiError("Sample not found", 404);
    return sample;
  }
  getSamples = async () => {
    const samples = await this.prisma.sample.findMany();
    return samples;
  };
  getSample = async (id: number) => {
    return this.findSampleOrThrow(id);
  };
  createSample = async (body: CreateSampleDTO) => {
    return await this.prisma.sample.create({
      data: body,
    });
  };
  updateSample = async (id: number, body: UpdateSampleDTO) => {
    this.findSampleOrThrow(id);
    return await this.prisma.sample.update({
      where: { id },
      data: body,
    });
  };

  deleteSample = async (id: number) => {
    this.findSampleOrThrow(id);
    await this.prisma.sample.delete({
      where: { id },
    });
    return { message: "Sample deleted successfully" };
  };
}
