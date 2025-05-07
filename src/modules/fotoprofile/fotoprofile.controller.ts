import { NextFunction, Request, Response } from "express";
import { FotoProfileService } from "./fotoprofile.service";
import { injectable } from "tsyringe";

@injectable()
export class FotoProfileController {
  private fotoProfileService: FotoProfileService;
  constructor(FotoProfileService: FotoProfileService) {
    this.fotoProfileService = FotoProfileService;
  }

  getFotoProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;
      const result = await this.fotoProfileService.getFotoProfile(Number(id));
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };
  updateFotoProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const id = Number(res.locals.user.id);
      
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const thumbnail = files.thumbnail?.[0];

      if (!thumbnail) {
        throw new Error("No file uploaded");
      }

      const result = await this.fotoProfileService.updateFotoProfile(id, thumbnail);

      res.status(200).json({
        message: "Profile picture updated successfully",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };
}
