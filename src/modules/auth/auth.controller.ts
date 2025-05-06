import { AuthService } from "./auth.service";
import { injectable } from "tsyringe";
import { NextFunction, Request, Response } from "express";

@injectable()
export class AuthController {
  private authService: AuthService;

  constructor(AuthService: AuthService) {
    this.authService = AuthService;
  }
  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.login(req.body);
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };
  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.register(req.body);
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };
  registerOrganizer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.registerOrganizer(req.body);
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };

  forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.forgotPassword(req.body);
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.resetPassword(
        req.body,
        res.locals.user.id
      );
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.changePassword(
        req.body,
        res.locals.user.id
      );
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };
}
