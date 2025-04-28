import { Router } from "express";
import { SampleController } from "./sample.controller";
import { injectable } from "tsyringe";
import { CreateSampleDTO } from "./dto/create-sample.dto";
import { validateBody } from "../../middlewares/validation.middleware";
import { UpdateSampleDTO } from "./dto/update-sample.dto";

@injectable()
export class SampleRouter {
  private router: Router;
  private sampleController: SampleController;
  constructor(SampleController: SampleController) {
    this.router = Router();
    this.sampleController = SampleController;
    this.initialzeRouter();
  }
  private initialzeRouter() {
    this.router.get("/", this.sampleController.getSamples);
    this.router.get("/:id", this.sampleController.getSample);
    this.router.post(
      "/",
      validateBody(CreateSampleDTO),
      this.sampleController.createSample
    );
    this.router.patch(
      "/:id",
      validateBody(UpdateSampleDTO),
      this.sampleController.updateSample
    );
    this.router.delete("/:id", this.sampleController.deleteSample);
  }

  getRouter() {
    return this.router;
  }
}
