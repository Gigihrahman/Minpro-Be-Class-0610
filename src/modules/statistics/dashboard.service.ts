// dashboard.service.ts
import { injectable } from "tsyringe";
import { PrismaService } from "../prisma/prisma.service";

@injectable()
export class DashboardService {
  private prisma: PrismaService;

  constructor(prismaService: PrismaService) {
    this.prisma = prismaService;
  }

  getRevenueData = async (
    authUserId: number,
    year: number = new Date().getFullYear()
  ) => {
    try {
      // Use SQL query to directly get monthly revenue data
      // This is more efficient for aggregate calculations
      const monthlyRevenue = await this.prisma.$queryRaw`
       WITH months AS (
         SELECT 1 AS month_num, 'Jan' AS month_name UNION
         SELECT 2, 'Feb' UNION
         SELECT 3, 'Mar' UNION
         SELECT 4, 'Apr' UNION
         SELECT 5, 'May' UNION
         SELECT 6, 'Jun' UNION
         SELECT 7, 'Jul' UNION
         SELECT 8, 'Aug' UNION
         SELECT 9, 'Sep' UNION
         SELECT 10, 'Oct' UNION
         SELECT 11, 'Nov' UNION
         SELECT 12, 'Dec'
       ),
       organizer_id AS (
         SELECT id FROM "organizers" WHERE "userId" = ${authUserId} LIMIT 1
       ),
       monthly_totals AS (
         SELECT 
           EXTRACT(MONTH FROM t."createdAt") AS month_num,
           SUM(t."totalPrice") AS revenue
         FROM "transactions" t
         JOIN "events" e ON t."eventsId" = e.id
         JOIN organizer_id o ON e."organizerId" = o.id
         WHERE 
           t.status = 'DONE' AND
           EXTRACT(YEAR FROM t."createdAt") = ${year}
         GROUP BY EXTRACT(MONTH FROM t."createdAt")
       )
       SELECT 
         m.month_name AS month,
         COALESCE(mt.revenue, 0) AS revenue
       FROM months m
       LEFT JOIN monthly_totals mt ON m.month_num = mt.month_num
       ORDER BY m.month_num
     `;

      // Convert BigInt to Number
      const formattedData = Array.isArray(monthlyRevenue)
        ? monthlyRevenue.map((item) => ({
            month: item.month,
            revenue: Number(item.revenue),
          }))
        : this.getEmptyRevenueData();

      return formattedData;
    } catch (error) {
      console.error("Error fetching revenue data:", error);
      return this.getEmptyRevenueData();
    }
  };

  /**
   * Returns empty revenue data structure for all months
   */
  private getEmptyRevenueData = () => {
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return monthNames.map((month) => ({ month, revenue: 0 }));
  };

  /**
   * Gets revenue summary data for the dashboard
   */
  getRevenueSummary = async (
    authUserId: number,
    year: number = new Date().getFullYear()
  ) => {
    try {
      // Get organizer ID first
      const organizer = await this.prisma.organizer.findFirst({
        where: {
          userId: authUserId,
        },
        select: {
          id: true,
        },
      });

      if (!organizer) {
        return {
          totalRevenue: 0,
          totalTransactions: 0,
          averageRevenue: 0,
        };
      }

      // Get aggregated summary data
      const summary = await this.prisma.transactions.aggregate({
        where: {
          event: {
            organizerId: organizer.id,
          },
          status: "DONE",
          createdAt: {
            gte: new Date(`${year}-01-01`),
            lt: new Date(`${year + 1}-01-01`),
          },
        },
        _sum: {
          totalPrice: true,
        },
        _count: {
          id: true,
        },
      });

      const totalRevenue = Number(summary._sum?.totalPrice ?? 0);
      const totalTransactions = summary._count?.id ?? 0;
      const averageRevenue =
        totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

      return {
        totalRevenue,
        totalTransactions,
        averageRevenue,
      };
    } catch (error) {
      console.error("Error fetching revenue summary:", error);
      return {
        totalRevenue: 0,
        totalTransactions: 0,
        averageRevenue: 0,
      };
    }
  };
}
