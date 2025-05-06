import { Router } from "express";
import { injectable } from "tsyringe";
import { JWT_SECRET_KEY } from "../../config";
import { JwtMiddleware } from "../../middlewares/jwt.middleware";
import { UploaderMiddleware } from "../../middlewares/uploader.middleware";
import { validateBody } from "../../middlewares/validation.middleware";
import { EventController } from "./event.controller";
import { CreateEventDTO } from "./dto/create-event.dto";
import { verifyRole } from "../../middlewares/role.middleware";
import { UpdateEventDTO } from "./dto/update-event.dto";

@injectable()
export class EventRouter {
  private router: Router;
  private eventController: EventController;
  private jwtMiddleware: JwtMiddleware;
  private uploaderMiddleware: UploaderMiddleware;
  constructor(
    EventController: EventController,
    JwtMiddleware: JwtMiddleware,
    UploaderMiddleware: UploaderMiddleware
  ) {
    this.router = Router();
    this.eventController = EventController;
    this.jwtMiddleware = JwtMiddleware;
    this.uploaderMiddleware = UploaderMiddleware;
    this.initializeRoutes();
  }
  private initializeRoutes = () => {
    this.router.get("/", this.eventController.getEvents);
    this.router.get(
      "/byorganizer",
      this.jwtMiddleware.verifyToken(JWT_SECRET_KEY!),
      verifyRole(["ORGANIZER"]),
      this.eventController.getEventsOrganizerId
    );
    this.router.get("/:slug", this.eventController.getEventBySlug);
    this.router.post(
      "/",
      this.jwtMiddleware.verifyToken(JWT_SECRET_KEY!),

      this.uploaderMiddleware
        .upload()
        .fields([{ name: "thumbnail", maxCount: 1 }]),
      this.uploaderMiddleware.fileFilter([
        "image/jpeg",
        "image/avif",
        "image/png",
      ]),
      validateBody(CreateEventDTO),
      this.eventController.createBlog
    );
    this.router.patch(
      "/:id",
      this.jwtMiddleware.verifyToken(JWT_SECRET_KEY!),
      this.uploaderMiddleware
        .upload()
        .fields([{ name: "thumbnail", maxCount: 1 }]),
      this.uploaderMiddleware.fileFilter([
        "image/jpeg",
        "image/avif",
        "image/png",
      ]),

      validateBody(UpdateEventDTO),
      this.eventController.updateEvent
    );
  };
  getRouter() {
    return this.router;
  }
}
