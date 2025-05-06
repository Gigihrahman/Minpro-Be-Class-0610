import { plainToInstance } from "class-transformer";
import { NextFunction, Request, Response } from "express";
import { injectable } from "tsyringe";
import { ApiError } from "../../utils/api-error";
import { EventService } from "./events.service";
import { CreateEventDTO } from "./dto/create-event.dto";
import { GetEventsDTO } from "./dto/get-events.dto";

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
  ) => {
    try {
      const { organizerId } = req.params;
      const result = await this.eventService.getEventsByOrganizerId(
        Number(organizerId)
      );
      res.status(200).send(result);
    } catch (error) {
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
}
