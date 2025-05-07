import { injectable } from "tsyringe";
import { NextFunction, Request, Response } from "express";
import { ApiError } from "../../utils/api-error";
import { ProfileService } from "./profile.service";
import { UpdateOrganizerProfileDTO } from "./dto/update-profile-organizer.dto";

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
  updateProfileOrganizer = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Get the user ID from the JWT token/session
      const userId = res.locals.user.id;

      // Validate input using class-validator (this should be done in middleware)
      const updateData: UpdateOrganizerProfileDTO = req.body;

      // Call the service to update the profile
      const result = await this.profileService.updateProfileOrganizer(
        userId,
        updateData
      );

      // Return success response
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };
  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = res.locals.user.id;
      const result = await this.profileService.updateProfile(
        Number(id),
        req.body
      );
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
  getProfileOrganizer = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const id = res.locals.user.id;
      const result = await this.profileService.getProfileOrganizer(Number(id));
      res.status(200).send({
        status: "Success",
        message: "Successfully retrieved organizer profile",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}
