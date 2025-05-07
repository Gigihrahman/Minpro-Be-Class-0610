import { Router } from "express";
import { injectable } from "tsyringe";

import { JWT_SECRET_KEY } from "../../config";
import { verifyRole } from "../../middlewares/role.middleware";
import { DashboardController } from "./dashboard.controller";
import { JwtMiddleware } from "../../middlewares/jwt.middleware";

@injectable()
export class DashboardRouter {
  private router: Router;

  constructor(
    private dashboardController: DashboardController,
    private jwtMiddleware: JwtMiddleware
  ) {
    this.router = Router();
    this.initializeRouter();
  }

  private initializeRouter() {
    this.router.get(
      "/revenue",
      this.jwtMiddleware.verifyToken(JWT_SECRET_KEY!),
      verifyRole(["ORGANIZER"]),
      this.dashboardController.getRevenueData
    );

    this.router.get(
      "/summary",
      this.jwtMiddleware.verifyToken(JWT_SECRET_KEY!),
      verifyRole(["ORGANIZER"]),
      this.dashboardController.getRevenueSummary
    );
  }

  getRouter() {
    return this.router;
  }
}
