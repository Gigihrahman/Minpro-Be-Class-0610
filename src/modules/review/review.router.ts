import { Router } from "express";
import { injectable } from "tsyringe";
import { ReviewController } from "./review.controller";

@injectable()
export class ReviewRouter {
  private router: Router;
  private reviewController: ReviewController;
  constructor(ReviewController: ReviewController) {
    this.router = Router();
    this.reviewController = ReviewController;
    this.initialzeRouter();
  }
  private initialzeRouter() {
    this.router.get("/rating/:id", this.reviewController.getRatingByEventId);
    this.router.get("/:id", this.reviewController.getReviewHistoryByEventId);
    this.router.post("/:uuid", this.reviewController.createReviewById);
  }
  getRouter() {
    return this.router;
  }
}
