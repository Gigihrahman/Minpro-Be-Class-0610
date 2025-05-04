import { injectable } from "tsyringe";
import { PrismaService } from "../prisma/prisma.service";

import { CreateVoucherDTO } from "./dto/create-voucher.dto";
import { ApiError } from "../../utils/api-error";
import { nanoid } from "nanoid";

@injectable()
export class VoucherService {
  private prisma: PrismaService;

  constructor(PrismaClient: PrismaService) {
    this.prisma = PrismaClient;
  }

  createVoucher = async (
    body: CreateVoucherDTO,
    eventId: number,
    authUserId: number
  ) => {
    const { description, quota, value, validAt, expiredAt } = body;

    if (validAt >= expiredAt) {
      throw new ApiError("Valid date must be less than expired date", 400);
    }

    const organizer = await this.prisma.organizer.findFirst({
      where: {
        userId: authUserId,
      },
      select: {
        id: true,
      },
    });
    if (!organizer) {
      throw new ApiError("You are not organizer", 404);
    }

    const event = await this.prisma.events.findFirst({
      where: {
        id: eventId,
      },
    });
    if (!event) {
      throw new ApiError("Event not found", 404);
    }
    if (organizer.id !== event.organizerId) {
      throw new ApiError("You are not authorized to create a voucher", 403);
    }
    const code = nanoid(10);

    return await this.prisma.vouchers.create({
      data: {
        organizerId: organizer.id,
        eventId,
        code,
        description,
        quota,
        value,
        validAt,
        expiredAt,
      },
    });
  };
}
