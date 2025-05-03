import { injectable } from "tsyringe";
import { PrismaService } from "../prisma/prisma.service";

import { ApiError } from "../../utils/api-error";
import { CreateSeatDTO } from "./dto/create-seat.dto";

@injectable()
export class SeatService {
  private prisma: PrismaService;

  constructor(PrismaClient: PrismaService) {
    this.prisma = PrismaClient;
  }

  createTicket = async (body: CreateSeatDTO, authUserId: number) => {
    const { name, description, eventId, price, totalSeat } = body;

    const event = await this.prisma.events.findFirst({
      where: {
        id: eventId,
      },
      include: {
        organizer: {
          select: { userId: true },
        },
      },
    });
    if (!event) {
      throw new ApiError("Event not found", 404);
    }
    if (event.organizer.userId !== authUserId) {
      throw new ApiError("You are not authorized to create a ticket", 403);
    }
    const existingTicket = await this.prisma.seats.findFirst({
      where: {
        name: name,
        eventId,
      },
    });
    if (existingTicket) {
      throw new ApiError(
        `Ticket with name :${name} already exists in your event`,
        404
      );
    }
    console.log("cek");
    const seat = await this.prisma.seats.create({
      data: {
        name,
        description,
        eventId,
        price,
        totalSeat,
      },
    });
    console.log("cek2", seat);
    return { message: "Ticket created successfully", seat };
  };
}
