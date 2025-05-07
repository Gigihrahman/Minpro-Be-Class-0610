import { Router } from "express";
import { injectable } from "tsyringe";
import { ProfileController } from "./profile.controller";
import { JwtMiddleware } from "../../middlewares/jwt.middleware";
import { JWT_SECRET_KEY } from "../../config";
import { UploaderMiddleware } from "../../middlewares/uploader.middleware";
import { verifyRole } from "../../middlewares/role.middleware";
import { UpdateEventDTO } from "../event/dto/update-event.dto";
import { validateBody } from "../../middlewares/validation.middleware";

@injectable()
export class ProfileRouter {
  private router: Router;
  private profileController: ProfileController;
  private jwtMiddleware: JwtMiddleware;
  private uploaderMiddleware: UploaderMiddleware;
  constructor(
    ProfileController: ProfileController,
    JwtMiddleware: JwtMiddleware,
    UploaderMiddleware: UploaderMiddleware
  ) {
    this.router = Router();
    this.profileController = ProfileController;
    this.jwtMiddleware = JwtMiddleware;
    this.uploaderMiddleware = UploaderMiddleware;
    this.initialzeRouter();
  }
  private initialzeRouter() {
    this.router.patch(
      "/profilePicture",
      this.jwtMiddleware.verifyToken(JWT_SECRET_KEY!),
      this.uploaderMiddleware
        .upload()
        .fields([{ name: "profilePicture", maxCount: 1 }]),
      this.uploaderMiddleware.fileFilter([
        "image/jpeg",
        "image/avif",
        "image/png",
      ]),
      this.profileController.updateFotoProfile
    );
    this.router.put(
      "/updateorganizer",
      this.jwtMiddleware.verifyToken(JWT_SECRET_KEY!),
      verifyRole(["ORGANIZER"]),
      validateBody(UpdateEventDTO),
      this.profileController.updateProfileOrganizer
    );

    this.router.patch(
      "/update-profile",
      this.jwtMiddleware.verifyToken(JWT_SECRET_KEY!),
      this.profileController.updateProfile
    );
    this.router.get(
      "/",
      this.jwtMiddleware.verifyToken(JWT_SECRET_KEY!),
      this.profileController.getProfile
    );
    this.router.get(
      "/profile-organizer",
      this.jwtMiddleware.verifyToken(JWT_SECRET_KEY!),
      this.profileController.getProfileOrganizer
    );
  }

  getRouter() {
    return this.router;
  }
}
