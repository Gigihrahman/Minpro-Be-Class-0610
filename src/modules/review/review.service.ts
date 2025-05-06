import { ApiError } from "../../utils/api-error";
import { injectable } from "tsyringe";
import { PrismaService } from "../prisma/prisma.service";
import { CreateReviewDTO } from "./dto/create-review.dto";
import { Prisma } from "../../generated/prisma";
import { PaginationQueryParams } from "../pagination/dto/pagination.dto";

@injectable()
export class ReviewService {
  private prisma: PrismaService;

  constructor(PrismaClient: PrismaService) {
    this.prisma = PrismaClient;
  }

  getReviewByeventId = async (id: number) => {
    const samples = await this.prisma.reviews.findMany({
      where: { eventId: id },
    });
    if (!samples) {
      throw new ApiError("Sample not found", 404);
    }
    return samples;
  };

  createReview = async (
    uuid: string,
    authUserId: number,
    body: CreateReviewDTO
  ) => {
    const transaction = await this.prisma.transactions.findFirst({
      where: { uuid, userId: authUserId },
      include: {
        event: true,
      },
    });

    if (!transaction) throw new ApiError("Event not found", 404);
    if (transaction.status !== "DONE") {
      throw new ApiError("Your transaction not done", 400);
    }
    const user = await this.prisma.users.findFirst({
      where: { id: transaction.userId },
      select: { role: true },
    });
    if (user?.role !== "USER") {
      throw new ApiError(
        "You are not user and not allowed to create review",
        403
      );
    }
    if (transaction.event.endEvent >= new Date())
      throw new ApiError("Event not started yet", 400);

    const review = await this.prisma.reviews.create({
      data: {
        comment: body.comment,
        rating: body.rating,
        eventId: transaction.event.id,
        userId: transaction.userId,
        transactionsId: transaction.id,
      },
    });

    return review;
  };

  getRatingByEventId = async (id: number) => {
    const rating = await this.prisma.reviews.aggregate({
      where: { eventId: id },
      _avg: {
        rating: true,
      },
    });

    if (!rating) {
      throw new ApiError("Rating not found", 404);
    }

    return { rating: rating._avg.rating };
  };

  getReviewHistoryByEventIdPagination = async (
    eventId: number,
    query: PaginationQueryParams
  ) => {
    const { take, page, sortBy, sortOrder } = query;

    const whereClause: Prisma.ReviewsWhereInput = {
      eventId: eventId,
    };

    const reviews = await this.prisma.reviews.findMany({
      where: whereClause,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * take,
      take: take,
      include: {
        user: true,
      },
    });

    const totalReviews = await this.prisma.reviews.count({
      where: whereClause,
    });

    if (!reviews || reviews.length === 0) {
      throw new ApiError("Reviews not found", 404);
    }

    return {
      data: reviews.map((review) => ({
        id: review.id,
        user: {
          fullname: review.user.fullName,
          profilePicture: review.user.profilePicture || null,
        },
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt.toISOString(),
      })),
      meta: {
        total: totalReviews,
        page,
        take,
      },
    };
  };
}
