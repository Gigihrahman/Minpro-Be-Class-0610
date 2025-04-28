import { Router } from "express";
import { injectable } from "tsyringe";
import { SampleController } from "./sample.controller";
import { validateBody } from "./../../middlewares/validation.middleware";
import { CreateSampleDTO } from "./dto/create-sample.dto";
import { UpdateSampleDTO } from "./dto/update-sample.dto";
@injectable()
export class SampleRouter {
  private router: Router;
  private SampleController: SampleController;
  constructor(SampleController: SampleController) {
    this.router = Router();
    this.SampleController = SampleController;
    this.initializeRoutes();
  }
  private initializeRoutes = () => {
    this.router.get("/", this.SampleController.getSamples);
    this.router.get("/:id", this.SampleController.getSample);
    this.router.post(
      "/",
      validateBody(CreateSampleDTO),
      this.SampleController.createSample
    );
    this.router.patch(
      "/:id",
      validateBody(UpdateSampleDTO),
      this.SampleController.updateSample
    );
    this.router.delete("/:id", this.SampleController.deleteSample);
  };
  getRouter() {
    return this.router;
  }
}
