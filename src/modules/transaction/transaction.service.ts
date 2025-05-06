import { injectable } from "tsyringe";
import { Prisma, TransactionStatus } from "../../generated/prisma";
import { PrismaService } from "../prisma/prisma.service";
import { GetTransactionsDTO } from "./dto/get-transactions.dto";
import { ApiError } from "../../utils/api-error";
import { MailService } from "../mail/mail.service";

@injectable()
export class TransactionService {
  prisma: PrismaService;
  constructor(PrismaService: PrismaService) {
    this.prisma = PrismaService;
  }
  // Ubah parameter function dari body menjadi query
  getTransactions = async (query: any, authUserId: number) => {
    // Destructure dari query, bukan dari body
    const {
      search,
      take = 10,
      page = 1,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = query;

    const organizer = await this.prisma.organizer.findFirst({
      where: { userId: authUserId },
    });

    // Filter transaksi berdasarkan relasi event.organizerId dan nama event
    const whereClause: Prisma.TransactionsWhereInput = {
      event: {
        organizerId: organizer?.id,
        ...(search && {
          name: { contains: search, mode: "insensitive" },
        }),
      },
    };

    // Ambil transaksi
    const transactions = await this.prisma.transactions.findMany({
      where: whereClause,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * take,
      take: Number(take),
      include: {
        event: {
          select: {
            name: true,
            locationDetail: true,
            startEvent: true,
            endEvent: true,
          },
        },
        voucher: {
          select: { code: true },
        },
        detailTransaction: {
          select: {
            quantity: true,
            seats: { select: { name: true, price: true } },
          },
        },
        points: {
          select: { pointsValue: true },
        },
        payments: {
          select: {
            paymentMethod: true,
            paymentProofUrl: true,
            createdAt: true,
          },
        },
      },
    });

    // console.log("ini transaksi atas :", transactions);

    // Ambil email user berdasarkan userId dari hasil transaksi
    const userIds = [...new Set(transactions.map((t) => t.userId))];
    const users = await this.prisma.users.findMany({
      where: { id: { in: userIds } },
      select: { id: true, email: true },
    });
    console.log("ini userIds", userIds, "dan ini users", users);

    // Gabungkan email ke masing-masing transaksi
    const transactionsWithUserEmail = transactions.map((t) => ({
      ...t,
      userEmail: users.find((u) => u.id === t.userId)?.email || null,
    }));
    console.log("ini transactionswithuseremail", transactionsWithUserEmail);

    // Hitung total transaksi (untuk pagination)
    const count = await this.prisma.transactions.count({
      where: whereClause,
    });

    // console.log("ini transaksi", transactionsWithUserEmail);

    return {
      data: transactionsWithUserEmail,
      meta: { page: Number(page), take: Number(take), total: count },
    };
  };
  //   updateTransaction = async (
  //     authUserId: number,
  //     uuid: string,
  //     action: "accept" | "reject"
  //   ) => {
  //     const transaction = await this.prisma.transactions.findUnique({
  //       where: { uuid },
  //       include: {
  //         detailTransaction: {
  //           include: {
  //             seats: {
  //               include: {
  //                 event: true,
  //               },
  //             },
  //           },
  //         },
  //         user: true, // Assuming there's a relation to user via userId
  //       },
  //     });

  //     if (!transaction) throw new ApiError("Transaction not found", 404);
  //     if (transaction.status !== "WAITING_FOR_ADMIN_CONFIRMATION") {
  //       throw new ApiError("Transaction cannot be updated at this stage", 400);
  //     }

  //     // Check if there's payment proof (need to check in payments table)
  //     const paymentProof = await this.prisma.payments.findFirst({
  //       where: { transactionId: transaction.id },
  //     });

  //     if (!paymentProof) {
  //       throw new ApiError("User has not uploaded payment proof", 400);
  //     }

  //     // Check if the authenticated user is the organizer of any event in the transaction
  //     const isAuthorized = transaction.detailTransaction.some(
  //       (detail) => detail.seats.event.organizerId === authUserId
  //     );

  //     if (!isAuthorized) {
  //       throw new ApiError(
  //         "You are not authorized to update this transaction",
  //         403
  //       );
  //     }

  //     let updateStatus: TransactionStatus;
  //     let templateFile: string;
  //     let emailSubject: string;

  //     if (action === "reject") {
  //       updateStatus = "REJECTED";
  //       templateFile = "rejected-transaction-email";
  //       emailSubject = "❌ Your transaction has been rejected!";
  //     } else {
  //       updateStatus = "DONE";
  //       templateFile = "accepted-transaction-email";
  //       emailSubject = "🎉 Your transaction has been accepted";
  //     }

  //     await this.prisma.$transaction(async (tx) => {
  //       if (action === "reject") {
  //         // Return tickets to inventory by updating reserved count
  //         for (const detail of transaction.detailTransaction) {
  //           await tx.seats.update({
  //             where: { id: detail.seatsId },
  //             data: {
  //               reserved: { decrement: detail.quantity },
  //             },
  //           });
  //         }

  //         // Refund points if points were used
  //         if (transaction.usedPoint && transaction.usedPoint > 0) {
  //           await tx.points.update({
  //             where: { userId: transaction.userId },
  //             data: { pointsValue: { increment: transaction.usedPoint } },
  //           });
  //         }

  //         // Return voucher to be usable again if one was used
  //         if (transaction.voucherId) {
  //           await tx.vouchers.update({
  //             where: { id: transaction.voucherId },
  //             data: { claimed: { decrement: 1 } },
  //           });
  //         }

  //         // Return coupon to be usable again if one was used
  //         if (transaction.couponId) {
  //           await tx.coupons.update({
  //             where: { id: transaction.couponId },
  //             data: { isUsed: false },
  //           });
  //         }

  //         // Cancel any pending jobs if they exist
  //         const expireJob =
  //           await this.transactionQueue.userTransactionQueue.getJob(
  //             `expire-transaction:${uuid}`
  //           );
  //         if (expireJob) {
  //           await expireJob.remove();
  //         }

  //         const organizationJob =
  //           await this.transactionQueue.userTransactionQueue.getJob(
  //             `organization-response:${uuid}`
  //           );
  //         if (organizationJob) {
  //           await organizationJob.remove();
  //         }
  //       }

  //       if (action === "accept") {
  //         // Create tickets for the accepted transaction
  //         for (const detail of transaction.detailTransaction) {
  //           for (let i = 0; i < detail.quantity; i++) {
  //             await tx.tickets.create({
  //               data: {
  //                 userId: transaction.userId,
  //                 seatId: detail.seatsId,
  //                 ticketCode: `TKT-${uuid.substring(0, 8)}-${i + 1}`,
  //                 createdAt: new Date(),
  //                 updatedAt: new Date(),
  //               },
  //             });
  //           }
  //         }

  //         // Schedule follow-up job
  //         await this.transactionQueue.userTransactionQueue.add(
  //           "organizer-followup",
  //           { uuid },
  //           {
  //             jobId: `organizer-followup:${uuid}`,
  //             delay: 5 * 24 * 60 * 60 * 1000, // 5 days
  //             removeOnComplete: true,
  //             attempts: 3,
  //             backoff: { type: "exponential", delay: 1000 },
  //           }
  //         );
  //       }

  //       // Update transaction status
  //       await tx.transactions.update({
  //         where: { uuid },
  //         data: { status: updateStatus },
  //       });
  //     });

  //     // Get user and event information for email
  //     const user = await this.prisma.users.findUnique({
  //       where: { id: transaction.userId },
  //     });

  //     const eventName =
  //       transaction.detailTransaction[0]?.seats.event.name || "Event";

  //     // Send email notification
  //     await this.mailService.sendEmail(user.email, emailSubject, templateFile, {
  //       fullname: user.fullName,
  //       transactionId: uuid,
  //       transactionAmount: transaction.totalPrice,
  //       eventName: eventName,
  //       transactionDate: transaction.createdAt,
  //     });

  //     return {
  //       message: `Transaction ${action}ed successfully`,
  //       data: { uuid, status: updateStatus },
  //     };
  //   };
  // }
}
