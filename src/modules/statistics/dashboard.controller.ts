// dashboard.controller.ts
import { Request, Response } from "express";
import { injectable } from "tsyringe";
import { DashboardService } from "./dashboard.service";

@injectable()
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  getRevenueData = async (req: Request, res: Response) => {
    try {
      // Make sure to parse the year parameter as a number
      const year = req.query.year
        ? parseInt(req.query.year as string)
        : new Date().getFullYear();

      // For debugging
      console.log(
        `[${new Date().toISOString()}] GET /dashboard/revenue year=${year}`
      );

      const userId = res.locals.user.id;
      console.log("ini locals id :", userId);

      if (!userId) {
        res.status(401).send({
          status: "error",
          message: "Unauthorized access",
        });
      }

      const revenueData = await this.dashboardService.getRevenueData(
        userId,
        year
      );

      res.status(200).send({
        status: "success",
        data: revenueData,
      });
    } catch (error) {
      console.error("Error in getRevenueData controller:", error);
      res.status(500).send({
        status: "error",
        message: "Failed to fetch revenue data",
      });
    }
  };

  getRevenueSummary = async (req: Request, res: Response) => {
    try {
      const year = req.query.year
        ? parseInt(req.query.year as string)
        : new Date().getFullYear();
      const userId = res.locals.user.id;

      if (!userId) {
        res.status(401).send({
          status: "error",
          message: "Unauthorized access",
        });
      }

      const summaryData = await this.dashboardService.getRevenueSummary(
        userId,
        year
      );

      res.status(200).json({
        status: "success",
        data: summaryData,
      });
    } catch (error) {
      console.error("Error in getRevenueSummary controller:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to fetch summary data",
      });
    }
  };
}
