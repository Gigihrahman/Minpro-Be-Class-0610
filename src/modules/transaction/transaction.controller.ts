import { NextFunction, Request, Response } from "express";
import { injectable } from "tsyringe";
import { TransactionService } from "./transaction.service";
import { SearchTransactionUserDTO } from "./dto/search-transaction-user.dto";
import { plainToInstance } from "class-transformer";

@injectable()
export class TransactionController {
  private transactionService: TransactionService;
  constructor(TransactionService: TransactionService) {
    this.transactionService = TransactionService;
  }
  getTransactionHistoryUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const query = plainToInstance(SearchTransactionUserDTO, req.query);
      const result = await this.transactionService.getTransactionHistoryUser(
        res.locals.user.id,
        query
      );
      res.send(result);
    } catch (error) {
      next(error);
    }
  };
  getDetailTransactionUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { uuid } = req.params;
      const result = await this.transactionService.getDetailTransactionUser(
        res.locals.user.id,
        uuid
      );
      res.send(result);
    } catch (error) {
      next(error);
    }
  };

  applyCode = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.transactionService.applyCode(
        req.params.uuid,
        res.locals.user.id,
        req.body
      );
      res.send(result);
    } catch (error) {
      next(error);
    }
  };

  createTransaction = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this.transactionService.createTransaction(
        res.locals.user.id,
        req.body
      );
      res.send(result);
    } catch (error) {
      next(error);
    }
  };

  uploadProofment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const thumbnail = files.thumbnail?.[0];

      const result = await this.transactionService.uploadProofment(
        thumbnail,
        res.locals.user.id,
        req.params.uuid
      );
      res.send(result);
    } catch (error) {
      next(error);
    }
  };
}
