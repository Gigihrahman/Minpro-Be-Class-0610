import { Router } from "express";
import { injectable } from "tsyringe";
import { validateBody } from "../../middlewares/validation.middleware";
import { SeatController } from "./seat.controller";
import { CreateSeatDTO } from "./dto/create-seat.dto";
import { JWT_SECRET_KEY } from "../../config";
import { JwtMiddleware } from "../../middlewares/jwt.middleware";

@injectable()
export class SeatRouter {
  private router: Router;
  private seatController: SeatController;
  private jwtMiddleware: JwtMiddleware;
  constructor(SeatController: SeatController, JwtMiddleware: JwtMiddleware) {
    this.router = Router();
    this.seatController = SeatController;
    this.jwtMiddleware = JwtMiddleware;
    this.initialzeRouter();
  }
  private initialzeRouter() {
    this.router.post(
      "/",
      this.jwtMiddleware.verifyToken(JWT_SECRET_KEY!),
      validateBody(CreateSeatDTO),
      this.seatController.createSeat
    );
  }
  getRouter() {
    return this.router;
  }
}
