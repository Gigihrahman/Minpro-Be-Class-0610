import { Worker } from "bullmq";
import { redisConnection } from "../../../lib/redis";

import { ApiError } from "../../../utils/api-error";
import { PrismaService } from "../../prisma/prisma.service";
import { MailService } from "../../mail/mail.service";

const prisma = new PrismaService();
const mail = new MailService();
export const userTransactionWorker = new Worker(
  "user-transaction-queue",
  async (job) => {
    const uuid = job.data.uuid;
    const transaction = await prisma.transactions.findFirst({
      where: { uuid },
    });
    if (!transaction) throw new ApiError("invalid transaction uuid", 400);
    if (
      transaction.status === "WAITING_FOR_PAYMENT" ||
      transaction.status === "CREATED"
    ) {
      await prisma.$transaction(async (tx) => {
        await tx.transactions.update({
          where: { uuid },
          data: {
            status: "EXPIRED",
          },
        });
        const transactionItems = await tx.detailTransaction.findMany({
          where: { transactionId: transaction.id },
          select: { seatsId: true, quantity: true },
        });

        for (const item of transactionItems) {
          await tx.seats.update({
            where: { id: item.seatsId },
            data: {
              reserved: { decrement: item.quantity },
            },
          });
        }
      });

      const user = await prisma.users.findFirst({
        where: { id: transaction.userId },
        select: { email: true, fullName: true },
      });
      if (!user) throw new ApiError("invalid user", 400);
      await mail.sendEmail(
        user.email,
        "Transaction Expired",
        "expired-transaction",
        {
          name: user?.fullName,
          transactionId: transaction.uuid,
          amount: transaction.totalPrice,
          date: transaction.createdAt,
          year: new Date().getFullYear(),
        }
      );
    }
  },
  {
    connection: redisConnection,
  }
);
