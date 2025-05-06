import { injectable } from "tsyringe";
import { PrismaService } from "../prisma/prisma.service";
import { CreateTransactionDTO } from "./dto/create-transaction.dto";
import { ApiError } from "../../utils/api-error";
import { UsingCodeDTO } from "./dto/using-code.dto";
import { CloudinaryService } from "../cloudinary/cloudinary.service";
import { MailService } from "../mail/mail.service";
import { userTransactionQueue } from "../jobs/queues/transaction.queue";
import {
  DELAYED_JOB_WAIT_PAYMENT,
  DELAYED_JOB_WAIT_PAYMENT_CONFIRMATION,
} from "../../config";
import { adminConfirmationQueue } from "../jobs/queues/admin-confirmation.queue";
import { SearchTransactionUserDTO } from "./dto/search-transaction-user.dto";
import { Prisma } from "../../generated/prisma";

@injectable()
export class TransactionService {
  private prisma: PrismaService;
  private cloudinaryService: CloudinaryService;
  private mailService: MailService;

  constructor(
    PrismaClient: PrismaService,
    CloudinaryService: CloudinaryService,
    MailService: MailService
  ) {
    this.prisma = PrismaClient;
    this.cloudinaryService = CloudinaryService;
    this.mailService = MailService;
  }

  getTransactionHistoryUser = async (
    userId: number,
    query: SearchTransactionUserDTO
  ) => {
    const { take, page, sortBy, sortOrder, status } = query;

    const whereClause: Prisma.TransactionsWhereInput = {
      userId: userId,
    };
    if (status) {
      whereClause.status = status as any;
    }

    const transactionHistory = await this.prisma.transactions.findMany({
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * take,
      take,
      where: whereClause,
      include: {
        event: {
          select: {
            name: true,
            thumbnail: true,
            startEvent: true,
            endEvent: true,
            city: {
              select: {
                name: true,
              },
            },
            category: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
    if (!transactionHistory) {
      throw new ApiError("You dont have a transaction", 404);
    }
    const count = await this.prisma.transactions.count({ where: whereClause });
    return {
      data: transactionHistory,
      meta: { page, take, total: count },
    };
  };

  getDetailTransactionUser = async (
    userId: number,
    transactionUuid: string
  ) => {
    const transaction = await this.prisma.transactions.findFirst({
      where: { uuid: transactionUuid },
      include: {
        detailTransaction: { include: { seats: true } },
        event: { include: { city: true } },
      },
    });
    if (!transaction) {
      throw new ApiError("Transaction not found", 404);
    }
    if (transaction.userId !== userId) {
      throw new ApiError("You dont have access to this transaction", 403);
    }
    return transaction;
  };

  applyCode = async (
    transactionUuid: string,
    authUserId: number,
    body: UsingCodeDTO
  ) => {
    const { couponCode, voucherCode, isUsedPoints } = body;

    const result = await this.prisma.$transaction(async (prisma) => {
      const transaction = await prisma.transactions.findFirst({
        where: { uuid: transactionUuid },
        select: {
          id: true,
          userId: true,
          totalPrice: true,
          couponId: true,
          voucherId: true,
          pointsId: true,
          eventsId: true,
          status: true,
        },
      });

      if (!transaction) {
        throw new ApiError("Transaction not found", 404);
      }

      if (transaction.status !== "CREATED") {
        throw new ApiError(
          "Transaction already created, you cannot use coupon and points.",
          400
        );
      }
      if (
        transaction.pointsId ||
        transaction.couponId ||
        transaction.voucherId
      ) {
        throw new ApiError("You already used coupon or points", 400);
      }

      // Get total price from the transaction
      const totalPrice = transaction.totalPrice;
      let couponId = null;
      let voucherId = null;
      let pointsId = null;
      let amountCoupon = 0;
      let amountVoucher = 0;
      let amountPoint = 0;

      // Handle Coupon
      if (couponCode) {
        const coupon = await prisma.coupons.findFirst({
          where: { couponCode, userId: authUserId },
        });
        if (!coupon) {
          throw new ApiError("Coupon not found", 404);
        }
        if (coupon.isUsed) {
          throw new ApiError("Coupon already used", 400);
        }
        if (coupon.isExpired) {
          throw new ApiError("Coupon expired", 400);
        }

        if (coupon.userId !== authUserId) {
          throw new ApiError("You don't have access to this coupon", 403);
        }
        amountCoupon = coupon.discount;
        couponId = coupon.id;
        await prisma.coupons.update({
          where: { id: coupon.id },
          data: { isUsed: true },
        });
      }

      // Handle Voucher
      if (voucherCode) {
        const voucher = await prisma.vouchers.findFirst({
          where: { code: voucherCode },
        });
        if (!voucher) {
          throw new ApiError("Voucher not found", 404);
        }
        if (voucher.validAt > new Date()) {
          throw new ApiError("Voucher is not yet valid", 404);
        }
        if (voucher.expiredAt < new Date()) {
          throw new ApiError("Voucher expired", 404);
        }
        if (voucher.claimed >= voucher.quota) {
          throw new ApiError("Voucher limit reached", 404);
        }
        if (voucher.eventId !== transaction.eventsId) {
          throw new ApiError("Voucher not valid for this event", 404);
        }

        amountVoucher = voucher.value;
        voucherId = voucher.id;
        await prisma.vouchers.update({
          where: { id: voucher.id },
          data: { claimed: { increment: 1 } },
        });
      }

      const totalDiscount = amountCoupon + amountVoucher;
      if (totalDiscount >= totalPrice && isUsedPoints) {
        throw new ApiError(
          "Coupon and Voucher amount exceeds total price. Points cannot be used.",
          400
        );
      }

      if (isUsedPoints) {
        const foundPoints = await prisma.points.findFirst({
          where: { userId: authUserId },
        });
        if (!foundPoints) {
          throw new ApiError("You don't have points", 404);
        }
        if (foundPoints.pointsValue === 0) {
          throw new ApiError("Your points are 0", 404);
        }

        let pointsToUse = 0;
        if (foundPoints.pointsValue > totalPrice - totalDiscount) {
          pointsToUse = totalPrice - totalDiscount;
        } else {
          pointsToUse = foundPoints.pointsValue;
        }

        amountPoint = pointsToUse;
        pointsId = foundPoints.id;

        await prisma.points.update({
          where: { userId: authUserId },
          data: { pointsValue: foundPoints.pointsValue - amountPoint },
        });
      }

      const transactions = await prisma.transactions.update({
        where: { id: transaction.id },
        data: {
          couponId: couponId,
          voucherId: voucherId,
          pointsId: isUsedPoints ? pointsId : null,
          coupoun_amount: amountCoupon,
          voucher_amount: amountVoucher,
          usedPoint: amountPoint,
          status: "WAITING_FOR_PAYMENT",
        },
      });

      return transactions;
    });

    return { message: "success apply code", result };
  };

  createTransaction = async (userId: number, body: CreateTransactionDTO) => {
    const { eventId, detailsEvent } = body;
    const event = await this.prisma.events.findFirst({
      where: { id: eventId },
    });
    if (!event) {
      throw new ApiError("Event not found", 404);
    }
    if (event.startEvent < new Date()) {
      throw new ApiError("Event already started", 400);
    }
    if (event.endEvent < new Date()) {
      throw new ApiError("Event already ended", 400);
    }
    const user = await this.prisma.users.findFirst({
      where: { id: userId },
    });
    if (!user) {
      throw new ApiError("User not found", 404);
    }
    let totalPrice = 0;
    const transaction = await this.prisma.$transaction(async (tx) => {
      const createdTransaction = await tx.transactions.create({
        data: {
          userId,
          eventsId: eventId,
          status: "CREATED",
          totalPrice: 0,
        },
      });

      await Promise.all(
        detailsEvent.map(async (detail) => {
          const { seatsId, quantity } = detail;
          const seat = await tx.seats.findFirst({
            where: { id: seatsId },
          });
          if (!seat) {
            throw new ApiError("Seat not found", 404);
          }
          if (seat.eventId !== eventId) {
            throw new ApiError("Seat not for this event", 404);
          }
          if (quantity + seat.reserved > seat.totalSeat) {
            throw new ApiError("Quantity exceeds section capacity", 400);
          }

          await tx.seats.update({
            where: { id: seatsId },
            data: { reserved: { increment: quantity } },
          });

          totalPrice += seat.price * quantity;

          await tx.detailTransaction.create({
            data: {
              seatsId,
              transactionId: createdTransaction.id,
              quantity,
              priceAtPurchase: seat.price,
            },
          });
        })
      );
      await tx.transactions.update({
        where: { id: createdTransaction.id },
        data: { totalPrice },
      });

      return createdTransaction;
    });

    await this.mailService.sendEmail(
      user?.email,
      "Transaksi Dibuat",
      "create-transaction",
      {
        name: user?.fullName,
        transactionId: transaction.uuid,
        amount: transaction.totalPrice,
        date: transaction.createdAt,
        transactionLink: "https://appmu.com/tx/TRX123456789",
        year: new Date().getFullYear(),
      }
    );

    await userTransactionQueue.add(
      "new-transaction",
      { uuid: transaction.uuid },
      {
        jobId: transaction.uuid,
        delay: DELAYED_JOB_WAIT_PAYMENT * 60000, // 2 menit
        removeOnComplete: true,
        attempts: 5,
        backoff: {
          type: "exponential",
          delay: 1000,
        },
      }
    );

    return transaction;
  };

  uploadProofment = async (
    thumbnail: Express.Multer.File,
    userId: number,
    uuid: string
  ) => {
    const result = await this.prisma.$transaction(async (tx) => {
      const transactions = await tx.transactions.findFirst({
        where: {
          uuid,
        },
      });

      if (transactions === null) {
        throw new ApiError("Transaction not found", 404);
      }
      if (transactions.userId !== userId) {
        throw new ApiError(
          "You are not authorized to upload proof for this transaction",
          403
        );
      }
      const { secure_url } = await this.cloudinaryService.upload(thumbnail);
      if (!secure_url) {
        throw new ApiError("Failed to upload proof payment", 500);
      }
      await tx.transactions.update({
        where: {
          uuid: transactions.uuid,
        },
        data: {
          status: "WAITING_FOR_ADMIN_CONFIRMATION",
        },
      });
      console.log("secure_url", secure_url);

      await tx.payments.create({
        data: {
          transactionId: transactions.id,
          paymentMethod: "TRANSFER",
          paymentProofUrl: secure_url,
        },
      });
      await userTransactionQueue.remove(transactions.uuid);
      await adminConfirmationQueue.add(
        "new-admin-confirmation",
        { uuid: transactions.uuid },
        {
          jobId: transactions.uuid,
          delay: DELAYED_JOB_WAIT_PAYMENT_CONFIRMATION * 60000,
          removeOnComplete: true,
          attempts: 5,
          backoff: {
            type: "exponential",
            delay: 1000,
          },
        }
      );
    });

    return { message: "created upload proofment", result };
  };
}
