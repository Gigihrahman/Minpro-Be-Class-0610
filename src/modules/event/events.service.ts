import { injectable } from "tsyringe";

import { ApiError } from "../../utils/api-error";

import { CloudinaryService } from "../cloudinary/cloudinary.service";
import { PrismaService } from "../prisma/prisma.service";
import { CreateEventDTO } from "./dto/create-event.dto";
import { GetEventsDTO } from "./dto/get-events.dto";
import { generateSlug } from "../../utils/generateSlug";
import { Prisma } from "../../generated/prisma";
import { UpdateEventDTO } from "./dto/update-event.dto";
import { GetEventsByOrganizerIdDTO } from "./dto/get-eventbyorganizerid.dto";

@injectable()
export class EventService {
  private prisma: PrismaService;
  private cloudinaryService: CloudinaryService;

  constructor(
    PrismaClient: PrismaService,
    CloudinaryService: CloudinaryService
  ) {
    this.prisma = PrismaClient;
    this.cloudinaryService = CloudinaryService;
  }

  getEvents = async (query: GetEventsDTO) => {
    const { search, take, page, sortBy, sortOrder, city, category } = query;
    const whereClause: Prisma.EventsWhereInput = {
      deletedAt: null,
    };

    if (search) {
      whereClause.name = { contains: search, mode: "insensitive" };
    }
    if (city) {
      whereClause.city = { slug: city };
    }

    if (category) {
      whereClause.category = { slug: category };
    }
    const events = await this.prisma.events.findMany({
      where: whereClause,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * take,
      take,
      omit: {
        description: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      },
      include: {
        organizer: { select: { name: true, profilePicture: true } },
        city: { select: { name: true } },
        category: { select: { name: true, slug: true } },
      },
    });

    const count = await this.prisma.events.count({ where: whereClause });
    return {
      data: events,
      meta: { page, take, total: count },
    };
  };

  getEventBySlug = async (slug: string) => {
    const event = await this.prisma.events.findFirst({
      where: { slug, deletedAt: null },

      include: {
        organizer: { select: { name: true } },
        city: { select: { name: true } },
        category: { select: { name: true, slug: true } },
        seats: {
          select: {
            id: true,
            name: true,
            price: true,
            totalSeat: true,
            reserved: true,
            description: true,
          },
        },
      },
    });
    if (!event) throw new ApiError("Event not found", 404);
    return event;
  };

  getEventsByOrganizerId = async (
    userId: number,
    query: GetEventsByOrganizerIdDTO
  ) => {
    const {
      search = "",
      take = 10,
      page = 1,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = query;

    const whereClause: Prisma.EventsWhereInput = {
      deletedAt: null,
    };

    if (search) {
      whereClause.name = { contains: search, mode: "insensitive" };
    }

    const organizer = await this.prisma.organizer.findFirst({
      where: { userId },
      select: { id: true },
    });

    console.log("Organizer found:", organizer);

    if (!organizer) throw new ApiError("You are not an organizer", 404);

    const events = await this.prisma.events.findMany({
      where: {
        organizerId: organizer.id,
        deletedAt: null,
        ...whereClause,
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * take,
      take,
      include: {
        organizer: { select: { name: true } },
        city: { select: { name: true } },
        category: { select: { name: true } },
      },
    });

    const count = await this.prisma.events.count({
      where: {
        organizerId: organizer.id,
        deletedAt: null,
        ...whereClause,
      },
    });

    return {
      data: events,
      meta: { page, take, total: count },
    };
  };

  createEvents = async (
    body: CreateEventDTO,
    thumbnail: Express.Multer.File,
    authUserId: number
  ) => {
    const {
      name,
      categoryId,
      cityId,
      description,
      endEvent,
      locationDetail,
      startEvent,
      content,
    } = body;

    // Check if the event already exists by name
    const event = await this.prisma.events.findFirst({
      where: { name },
    });
    if (event) {
      throw new ApiError("This event already exists", 400);
    }

    // Check if the organizer exists
    const existingOrganizer = await this.prisma.organizer.findFirst({
      where: { userId: authUserId },
    });
    if (!existingOrganizer) throw new ApiError("Organizer not found", 404);

    // Generate a slug and check for duplicates
    const slug = generateSlug(name);
    const existingSlug = await this.prisma.events.findFirst({
      where: { slug },
    });
    if (existingSlug) {
      throw new ApiError("Event with this slug already exists", 400);
    }

    // Upload the thumbnail image to Cloudinary
    const { secure_url } = await this.cloudinaryService.upload(thumbnail);

    // Create the event in the database
    const result = await this.prisma.events.create({
      data: {
        name,
        categoryId,
        cityId,
        description,
        endEvent,
        locationDetail,
        startEvent,
        content,
        thumbnail: secure_url,
        organizerId: existingOrganizer.id,
        slug,
      },
    });

    return { message: "created" };
  };
  updateEvent = async (
    id: number,
    body: UpdateEventDTO,
    authUserId: number,
    thumbnail?: Express.Multer.File
  ) => {
    const event = await this.prisma.events.findFirst({
      where: { id },
      include: { organizer: true },
    });
    if (!event) {
      throw new ApiError("This event is invalid", 400);
    }
    console.log("ini event: ", event);

    if (event.organizer.userId !== authUserId) {
      throw new ApiError("Forbidden", 403);
    }

    if (body.name) {
      const eventName = await this.prisma.events.findFirst({
        where: { name: body.name },
      });

      let newSlug = event.slug;

      if (eventName) {
        throw new ApiError("Event already exist", 400);
      }
      newSlug = generateSlug(body.name);

      let newThumbnail = event.thumbnail;

      if (thumbnail) {
        await this.cloudinaryService.remove(event.slug);
        const { secure_url } = await this.cloudinaryService.upload(thumbnail);
        newThumbnail = secure_url;
      }
      console.log("ini eventName: ", eventName);

      return await this.prisma.events.update({
        where: { id },
        data: { ...body, slug: newSlug, thumbnail: newThumbnail },
      });
    }
  };
}
