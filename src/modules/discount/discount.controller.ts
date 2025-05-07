import { NextFunction, Request, Response } from "express";
import { injectable } from "tsyringe";
import { DiscountService } from "./discount.service";

@injectable()
export class DiscountController {
  private discountService: DiscountService;
  constructor(DiscountService: DiscountService) {
    this.discountService = DiscountService;
  }
  getCouponUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.discountService.getCouponUser(
        res.locals.user.id
      );
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };

  getPointUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.discountService.getPointUser(
        res.locals.user.id
      );
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };
  getVoucherById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.discountService.getVoucherById(
        parseInt(req.params.id)
      );
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };
}
