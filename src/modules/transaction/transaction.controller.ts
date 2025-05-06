import { plainToInstance } from "class-transformer";
import { GetTransactionsDTO } from "./dto/get-transactions.dto";
import { TransactionService } from "./transaction.service";
import { NextFunction, Request, Response } from "express";
import { injectable } from "tsyringe";

@injectable()
export class TransactionController {
  transactionService: TransactionService;
  constructor(TransactionService: TransactionService) {
    this.transactionService = TransactionService;
  }
  getTransactions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authUserId = res.locals.user.id;

      // Mengambil query parameters dari req.query, bukan req.body
      const query = plainToInstance(GetTransactionsDTO, req.query);

      const result = await this.transactionService.getTransactions(
        query,
        authUserId
      );

      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };
}
