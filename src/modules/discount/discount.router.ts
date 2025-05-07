import { Router } from "express";
import { injectable } from "tsyringe";
import { JWT_SECRET_KEY } from "../../config";
import { JwtMiddleware } from "../../middlewares/jwt.middleware";
import { DiscountController } from "./discount.controller";

@injectable()
export class DiscountRouter {
  private router: Router;
  private discountController: DiscountController;
  private jwtMiddleware: JwtMiddleware;
  constructor(
    DiscountController: DiscountController,
    JwtMiddleware: JwtMiddleware
  ) {
    this.router = Router();
    this.discountController = DiscountController;
    this.jwtMiddleware = JwtMiddleware;
    this.initialzeRouter();
  }
  private initialzeRouter() {
    this.router.get(
      "/",
      this.jwtMiddleware.verifyToken(JWT_SECRET_KEY!),
      this.discountController.getCouponUser
    );
    this.router.get(
      "/:id",

      this.discountController.getVoucherById
    );
    this.router.get(
      "/points",
      this.jwtMiddleware.verifyToken(JWT_SECRET_KEY!),
      this.discountController.getPointUser
    );
  }
  getRouter() {
    return this.router;
  }
}
