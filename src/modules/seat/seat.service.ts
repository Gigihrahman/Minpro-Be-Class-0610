import { injectable } from "tsyringe";
import { PrismaService } from "../prisma/prisma.service";

import { ApiError } from "../../utils/api-error";
import { CreateSeatDTO } from "./dto/create-seat.dto";
import { UpdateSeatDTO } from "./dto/update-seats";

@injectable()
export class SeatService {
  private prisma: PrismaService;

  constructor(PrismaClient: PrismaService) {
    this.prisma = PrismaClient;
  }

  createTicket = async (
    body: CreateSeatDTO,
    eventId: number,
    authUserId: number
  ) => {
    const { name, description, price, totalSeat } = body;

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

    const seat = await this.prisma.seats.create({
      data: {
        name,
        description,
        eventId,
        price,
        totalSeat,
      },
    });

    return { message: "Ticket created successfully", seat };
  };
  updateTicket = async (
    authUserId: number,
    eventId: number,
    body: UpdateSeatDTO
  ) => {
    const { name, description, price, totalSeat } = body;

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
  };
}
