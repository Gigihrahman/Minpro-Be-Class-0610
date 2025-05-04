import { Router } from "express";
import { injectable } from "tsyringe";
import { JWT_SECRET_KEY } from "../../config";
import { JwtMiddleware } from "../../middlewares/jwt.middleware";
import { validateBody } from "../../middlewares/validation.middleware";
import { CreateVoucherDTO } from "./dto/create-voucher.dto";
import { VoucherController } from "./voucher.controller";

@injectable()
export class VoucherRouter {
  private router: Router;
  private voucherController: VoucherController;
  private jwtMiddleware: JwtMiddleware;
  constructor(
    VoucherController: VoucherController,
    JwtMiddleware: JwtMiddleware
  ) {
    this.router = Router();
    this.voucherController = VoucherController;
    this.jwtMiddleware = JwtMiddleware;
    this.initialzeRouter();
  }
  private initialzeRouter() {
    this.router.post(
      "/:id",
      this.jwtMiddleware.verifyToken(JWT_SECRET_KEY!),
      validateBody(CreateVoucherDTO),
      this.voucherController.createVoucher
    );
  }
  getRouter() {
    return this.router;
  }
}
