import express, { Express, json } from "express";
import cors from "cors";
import "reflect-metadata";
import { container } from "tsyringe";
import { errorMiddleware } from "./middlewares/error.middleware";
import { PORT } from "./config";
import { SampleRouter } from "./modules/sample/sample.router";
export class App {
  public app: Express;
  constructor() {
    this.app = express();
    this.configure();
    this.routes();
    this.handleError();
  }
  private configure() {
    this.app.use(cors());
    this.app.use(json());
  }
  private routes() {
    const sampleRouter = container.resolve(SampleRouter);
    this.app.use("/samples", sampleRouter.getRouter());
  }
  private handleError() {
    this.app.use(errorMiddleware);
  }
  public start() {
    this.app.listen(PORT, () => {
      console.log(`Server is running on port :${PORT}`);
    });
  }
}
