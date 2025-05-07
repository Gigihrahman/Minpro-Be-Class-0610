import { Router } from "express";

import { injectable } from "tsyringe";
import { TransactionController } from "./transaction.controller";
import { JwtMiddleware } from "../../middlewares/jwt.middleware";
import { JWT_SECRET_KEY } from "../../config";
import { UsingCodeDTO } from "./dto/using-code.dto";
import { validateBody } from "../../middlewares/validation.middleware";
import { CreateTransactionDTO } from "./dto/create-transaction.dto";
import { UploaderMiddleware } from "../../middlewares/uploader.middleware";

@injectable()
export class TransactionRouter {
  private router: Router;
  private transactionController: TransactionController;
  private jwtMiddleware: JwtMiddleware;
  private uploaderMiddleware: UploaderMiddleware;
  constructor(
    TransactionController: TransactionController,
    JwtMiddleware: JwtMiddleware,
    UploaderMiddleware: UploaderMiddleware
  ) {
    this.router = Router();
    this.transactionController = TransactionController;
    this.jwtMiddleware = JwtMiddleware;
    this.uploaderMiddleware = UploaderMiddleware;

    this.initialzeRouter();
  }
  private initialzeRouter() {
    this.router.get(
      "/",
      this.jwtMiddleware.verifyToken(JWT_SECRET_KEY!),
      this.transactionController.getTransactions
    );
    this.router.get(
      "/user",
      this.jwtMiddleware.verifyToken(JWT_SECRET_KEY!),
      this.transactionController.getTransactionHistoryUser
    );
    this.router.get(
      "/:uuid",
      this.jwtMiddleware.verifyToken(JWT_SECRET_KEY!),
      this.transactionController.getDetailTransactionUser
    );
    this.router.post(
      "/",
      this.jwtMiddleware.verifyToken(JWT_SECRET_KEY!),
      validateBody(CreateTransactionDTO),
      this.transactionController.createTransaction
    );

    this.router.patch(
      "/:uuid",
      this.jwtMiddleware.verifyToken(JWT_SECRET_KEY!),
      validateBody(UsingCodeDTO),
      this.transactionController.applyCode
    );
    this.router.post(
      "/upload-proofment/:uuid",
      this.jwtMiddleware.verifyToken(JWT_SECRET_KEY!),
      this.uploaderMiddleware
        .upload()
        .fields([{ name: "thumbnail", maxCount: 1 }]),
      this.uploaderMiddleware.fileFilter([
        "image/jpeg",
        "image/avif",
        "image/png",
      ]),
      this.transactionController.uploadProofment
    );
  }

  getRouter() {
    return this.router;
  }
}
