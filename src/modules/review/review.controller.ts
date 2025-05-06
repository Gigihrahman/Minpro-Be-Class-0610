import { plainToInstance } from "class-transformer";
import { NextFunction, Request, Response } from "express";
import { injectable } from "tsyringe";
import { PaginationQueryParams } from "../pagination/dto/pagination.dto";
import { ReviewService } from "./review.service";

@injectable()
export class ReviewController {
  private reviewService: ReviewService;
  constructor(ReviewService: ReviewService) {
    this.reviewService = ReviewService;
  }
  getReviewHistoryByEventId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const query = plainToInstance(PaginationQueryParams, req.query);
      const result =
        await this.reviewService.getReviewHistoryByEventIdPagination(
          parseInt(req.params.id),
          query
        );
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };

  getRatingByEventId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this.reviewService.getRatingByEventId(
        parseInt(req.params.id)
      );
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };

  createReviewById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this.reviewService.createReview(
        req.params.uuid,
        res.locals.user.id,
        req.body
      );
      res.status(201).send(result);
    } catch (error) {
      next(error);
    }
  };
}
