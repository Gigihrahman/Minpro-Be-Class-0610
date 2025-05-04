import { Router } from "express";

import { injectable } from "tsyringe";
import { CityController } from "./city.controller";

@injectable()
export class CityRouter {
  private router: Router;
  private cityController: CityController;
  constructor(CityController: CityController) {
    this.router = Router();
    this.cityController = CityController;
    this.initialzeRouter();
  }
  private initialzeRouter() {
    this.router.get("/", this.cityController.getCities);
  }

  getRouter() {
    return this.router;
  }
}
