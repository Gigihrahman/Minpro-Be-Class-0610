import { plainToInstance } from "class-transformer";
import { NextFunction, Request, Response } from "express";
import { injectable } from "tsyringe";
import { ApiError } from "../../utils/api-error";
import { EventService } from "./events.service";
import { CreateEventDTO } from "./dto/create-event.dto";
import { GetEventsDTO } from "./dto/get-events.dto";
import { UpdateEventDTO } from "./dto/update-event.dto";
import { GetEventsByOrganizerIdDTO } from "./dto/get-eventbyorganizerid.dto";
import { validate } from "class-validator";
import { log } from "node:console";

@injectable()
export class EventController {
  private eventService: EventService;
  constructor(EventService: EventService) {
    this.eventService = EventService;
  }
  getEvents = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = plainToInstance(GetEventsDTO, req.query);
      const result = await this.eventService.getEvents(query);
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };
  getEventBySlug = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { slug } = req.params;
      const result = await this.eventService.getEventBySlug(slug);
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };
  getEventsOrganizerId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const query = plainToInstance(GetEventsByOrganizerIdDTO, req.query);
      console.log("Query parameters received:", req.query);
      const errors = await validate(query);

      if (errors.length > 0) {
        res.status(400).send({ errors });
        return;
      }

      const userId = res.locals.user.id;
      console.log("User ID from token:", userId);

      const result = await this.eventService.getEventsByOrganizerId(
        Number(userId),
        query
      );

      res.status(200).send(result); // ✅ jangan pakai `return` di sini
    } catch (error) {
      console.log("iinin erreo", error);

      next(error);
    }
  };

  createEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const thumbnail = files.thumbnail?.[0];
      if (!thumbnail) throw new ApiError("Thumbnail is required", 400);
      const body = plainToInstance(CreateEventDTO, req.body);

      const result = await this.eventService.createEvents(
        body,
        thumbnail,
        res.locals.user.id
      );
      res.status(201).send(result);
    } catch (error) {
      next(error);
    }
  };
  updateEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const thumbnail = files.thumbnail?.[0];
      const body = plainToInstance(UpdateEventDTO, req.body);
      console.log("ini req params :", req.params.id);
      console.log("Request body:", req.body);

      const result = await this.eventService.updateEvent(
        Number(req.params.id),
        body,
        res.locals.user.id,
        thumbnail
      );
      console.log(result);

      res.status(201).send(result);
    } catch (error) {
      next(error);
    }
  };
}
