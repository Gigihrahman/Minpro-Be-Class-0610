import { injectable } from "tsyringe";
import { ApiError } from "../../utils/api-error";
import { PrismaService } from "../prisma/prisma.service";

@injectable()
export class DiscountService {
  private prisma: PrismaService;

  constructor(PrismaClient: PrismaService) {
    this.prisma = PrismaClient;
  }

  getCouponUser = async (userId: number) => {
    const coupon = await this.prisma.coupons.findFirst({
      where: { userId: userId },
    });
    if (!coupon) {
      throw new ApiError("Sample not found", 404);
    }
    return coupon;
  };

  getVoucherById = async (eventId: number) => {
    const currentDate = new Date();
    const voucher = await this.prisma.vouchers.findMany({
      where: {
        id: eventId,
        validAt: {
          lte: currentDate,
        },
        expiredAt: {
          gte: currentDate,
        },
      },
    });
    if (!voucher) {
      throw new ApiError("Voucher not found", 404);
    }
    return voucher;
  };
  getPointUser = async (userId: number) => {
    const currentDate = new Date();
    const point = await this.prisma.points.findFirst({
      where: { id: userId, expiredDate: { gte: currentDate } },
      select: { pointsValue: true },
    });
    if (!point) {
      throw new ApiError("Point not found", 404);
    }
    return point;
  };
}
