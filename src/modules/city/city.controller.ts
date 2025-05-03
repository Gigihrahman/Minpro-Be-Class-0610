import { injectable } from "tsyringe";

import { NextFunction, Request, Response } from "express";
import { CityService } from "./city.service";

@injectable()
export class CityController {
  private cityService: CityService;
  constructor(CityService: CityService) {
    this.cityService = CityService;
  }

  getCities = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.cityService.getCities();

      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };
}
