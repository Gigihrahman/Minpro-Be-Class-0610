import { Router } from "express";
import { injectable } from "tsyringe";
import { ReviewController } from "./review.controller";
import { JwtMiddleware } from "../../middlewares/jwt.middleware";
import { JWT_SECRET_KEY } from "../../config";

@injectable()
export class ReviewRouter {
  private router: Router;
  private reviewController: ReviewController;
  private jwtMiddleware: JwtMiddleware;
  constructor(
    ReviewController: ReviewController,
    JwtMiddleware: JwtMiddleware
  ) {
    this.router = Router();
    this.reviewController = ReviewController;
    this.jwtMiddleware = JwtMiddleware;
    this.initialzeRouter();
  }
  private initialzeRouter() {
    this.router.get("/rating/:id", this.reviewController.getRatingByEventId);
    this.router.get("/:id", this.reviewController.getReviewHistoryByEventId);
    this.router.post(
      "/:uuid",
      this.jwtMiddleware.verifyToken(JWT_SECRET_KEY!),
      this.reviewController.createReviewById
    );
  }
  getRouter() {
    return this.router;
  }
}
