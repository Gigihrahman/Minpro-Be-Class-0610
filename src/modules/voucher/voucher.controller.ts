import { NextFunction, Request, Response } from "express";
import { injectable } from "tsyringe";
import { VoucherService } from "./voucher.service";

@injectable()
export class VoucherController {
  private voucherService: VoucherService;
  constructor(VoucherService: VoucherService) {
    this.voucherService = VoucherService;
  }
  createVoucher = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.voucherService.createVoucher(
        req.body,
        Number(req.params.id),
        res.locals.user.id
      );
      res.send(result);
    } catch (error) {
      next(error);
    }
  };
}
