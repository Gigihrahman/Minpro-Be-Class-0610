import { Router } from "express";
import { injectable } from "tsyringe";
import { validateBody } from "../../middlewares/validation.middleware";
import { FotoProfileController } from "./fotoprofile.controller";
import { JwtMiddleware } from "../../middlewares/jwt.middleware";
import { UploaderMiddleware } from "../../middlewares/uploader.middleware";
import { JWT_SECRET_KEY } from "../../config";

@injectable()
export class FotoProfileRouter {
  private router: Router;
  private fotoProfileController: FotoProfileController;
  private jwtMiddleware: JwtMiddleware;
  private uploaderMiddleware: UploaderMiddleware;
  constructor(
    FotoProfileController: FotoProfileController,
    JwtMiddleware: JwtMiddleware,
    UploaderMiddleware: UploaderMiddleware
  ) {
    this.router = Router();
    this.fotoProfileController = FotoProfileController;
    this.jwtMiddleware = JwtMiddleware;
    this.uploaderMiddleware = UploaderMiddleware;
    this.initialzeRouter();
  }
  private initialzeRouter() {
    this.router.patch(
      "/uploadfoto",
      this.jwtMiddleware.verifyToken(JWT_SECRET_KEY!),
      this.uploaderMiddleware
        .upload()
        .fields([{ name: "thumbnail", maxCount: 1 }]),
      this.uploaderMiddleware.fileFilter([
        "image/jpeg",
        "image/avif",
        "image/png",
      ]),
      this.fotoProfileController.updateFotoProfile
    );
    this.router.get(
      "/",
      this.jwtMiddleware.verifyToken(JWT_SECRET_KEY!),
      this.fotoProfileController.getFotoProfile
    );
  }

  getRouter() {
    return this.router;
  }
}
