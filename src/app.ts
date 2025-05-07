import cors from "cors";
import express, { Express, json } from "express";
import "reflect-metadata";
import { container } from "tsyringe";
import { PORT } from "./config";
import { errorMiddleware } from "./middlewares/error.middleware";
import loggerMiddleware from "./middlewares/logger.middleware";
import { AuthRouter } from "./modules/auth/auth.router";
import { CategoryRouter } from "./modules/category/category.router";
import { CityRouter } from "./modules/city/city.router";
import { EventRouter } from "./modules/event/event.router";
import "./modules/jobs";
import { ProfileRouter } from "./modules/profile/profile.router";
import { ReviewRouter } from "./modules/review/review.router";
import { SampleRouter } from "./modules/sample/sample.router";
import { SeatRouter } from "./modules/seat/seat.router";
import { TransactionRouter } from "./modules/transaction/transaction.router";
import { VoucherRouter } from "./modules/voucher/voucher.router";
import { DashboardRouter } from "./modules/statistics/dashboard.router";
import { FotoProfileRouter } from "./modules/fotoprofile/fotoprofile.router";
import { DiscountRouter } from "./modules/discount/discount.router";

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
    this.app.use(loggerMiddleware);
  }

  private routes() {
    const sampleRouter = container.resolve(SampleRouter);
    const authRouter = container.resolve(AuthRouter);
    const profileRouter = container.resolve(ProfileRouter);
    const eventRouter = container.resolve(EventRouter);
    const categoryRouter = container.resolve(CategoryRouter);
    const cityRouter = container.resolve(CityRouter);
    const seatRouter = container.resolve(SeatRouter);
    const voucherRouter = container.resolve(VoucherRouter);
    const transactionRouter = container.resolve(TransactionRouter);
    const dashboardRouter = container.resolve(DashboardRouter);
    const fotoProfileRouter = container.resolve(FotoProfileRouter);
    const discountRouter = container.resolve(DiscountRouter);
    const reviewRouter = container.resolve(ReviewRouter);

    this.app.use("/samples", sampleRouter.getRouter());
    this.app.use("/auth", authRouter.getRouter());
    this.app.use("/profile", profileRouter.getRouter());
    this.app.use("/events", eventRouter.getRouter());
    this.app.use("/category", categoryRouter.getRouter());
    this.app.use("/city", cityRouter.getRouter());
    this.app.use("/seats", seatRouter.getRouter());
    this.app.use("/vouchers", voucherRouter.getRouter());
    this.app.use("/transactions", transactionRouter.getRouter());
    this.app.use("/dashboard", dashboardRouter.getRouter());
    this.app.use("/fotoprofile", fotoProfileRouter.getRouter());
    this.app.use("/reviews", reviewRouter.getRouter());

    this.app.use("/discount", discountRouter.getRouter());
  }

  private handleError() {
    this.app.use(errorMiddleware);
  }

  public start() {
    this.app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  }
}
