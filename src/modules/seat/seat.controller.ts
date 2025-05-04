import { NextFunction, Request, Response } from "express";
import { injectable } from "tsyringe";
import { SeatService } from "./seat.service";

@injectable()
export class SeatController {
  private seatService: SeatService;
  constructor(SeatService: SeatService) {
    this.seatService = SeatService;
  }
  createSeat = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.seatService.createTicket(
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
