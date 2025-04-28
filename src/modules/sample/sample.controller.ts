import { NextFunction, Request, Response } from "express";
import { SampleService } from "./sample.service";
import { injectable } from "tsyringe";

@injectable()
export class SampleController {
  private sampleService: SampleService;
  constructor(SampleService: SampleService) {
    this.sampleService = SampleService;
  }
  getSamples = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.sampleService.getSamples();
      res.send(result);
    } catch (error) {
      next(error);
    }
  };
  getSample = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.sampleService.getSample(Number(req.params.id));
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };
  createSample = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.sampleService.createSample(req.body);
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };
  updateSample = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const result = await this.sampleService.updateSample(id, req.body);
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };
  deleteSample = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const result = await this.sampleService.deleteSample(id);
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };
}
