import { injectable } from "tsyringe";
import { NextFunction, Request, Response } from "express";
import { ApiError } from "../../utils/api-error";
import { ProfileService } from "./profile.service";

@injectable()
export class ProfileController {
  private profileService: ProfileService;

  constructor(ProfileService: ProfileService) {
    this.profileService = ProfileService;
  }
  updateFotoProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const files = req.files as { [fieldName: string]: Express.Multer.File[] };
      const profilePicture = files.profilePicture?.[0];
      if (!profilePicture) {
        throw new ApiError("Foto is required", 400);
      }
      const result = await this.profileService.UpdateFotoProfile(
        profilePicture,
        res.locals.user.id
      );
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };
  updateProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const id = res.locals.user.id;
      const result = await this.profileService.updateProfile(Number(id), req.body);
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };

  getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = res.locals.user.id;
      const result = await this.profileService.getProfile(Number(id));
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };
}
