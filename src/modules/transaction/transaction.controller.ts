import { NextFunction, Request, Response } from "express";
import { injectable } from "tsyringe";
import { TransactionService } from "./transaction.service";
import { SearchTransactionUserDTO } from "./dto/search-transaction-user.dto";
import { GetTransactionsDTO } from "./dto/get-transactions.dto";
import { plainToInstance } from "class-transformer";
import { UpdateTransactionDTO } from "./dto/update-transaction.dto";

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

  updateTransaction = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Fixed: Use req.params.uuid instead of transactionId
      const transactionId = req.params.uuid;
      console.log("transactionId:", transactionId);

      // Make sure user data is correctly accessed from res.locals
      const adminId = res.locals.user.id;
      console.log("adminId:", adminId);
      // Get the update data from request body
      const updateData: UpdateTransactionDTO = req.body;
      console.log("iniupdateData:", updateData);
      

      const result = await this.transactionService.updateTransaction(
        transactionId,
        adminId,
        updateData
      );
      console.log("ini result :",result);
      

      // Remove the return statement here
      res.status(200).send({
        success: true,
        message: "Transaction updated successfully",
        data: result,
      });
    } catch (error) {
      next(error);
      // Make sure we don't return anything after calling next()
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

  getTransactionsAdminConfirmation = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const authUserId = res.locals.user.id;

      // Mengambil query parameters dari req.query, bukan req.body
      const query = plainToInstance(GetTransactionsDTO, req.query);

      const result =
        await this.transactionService.getTransactionsAdminConfirmation(
          query,
          authUserId
        );

      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };
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
