import { Router } from "express";

import { injectable } from "tsyringe";

import { validateBody } from "../../middlewares/validation.middleware";
import { AuthController } from "./auth.controller";
import { RegisterDTO } from "./dto/register.dto";
import { LoginDTO } from "./dto/login.dto";
import { ForgotPasswordDTO } from "./dto/forgot-password.dto";
import { JWT_SECRET_KEY, JWT_SECRET_KEY_FORGOT_PASSWORD } from "../../config";
import { ResetPasswordDTO } from "./dto/reset-password.dto";
import { JwtMiddleware } from "../../middlewares/jwt.middleware";
import { ChangePasswordDTO } from "./dto/change-password.dto";
import { RegisterOrganizerDTO } from "./dto/register-organizer.dto";

@injectable()
export class AuthRouter {
  private router: Router;
  private authController: AuthController;
  private jwtMiddleware: JwtMiddleware;

  constructor(AuthController: AuthController, JwtMiddleware: JwtMiddleware) {
    this.router = Router();
    this.authController = AuthController;
    this.jwtMiddleware = JwtMiddleware;
    this.initialzeRouter();
  }

  private initialzeRouter() {
    this.router.post(
      "/register",
      validateBody(RegisterDTO),
      this.authController.register
    );
    this.router.post(
      "/register-organizer",
      validateBody(RegisterOrganizerDTO),
      this.authController.registerOrganizer
    );
    this.router.post(
      "/login",
      validateBody(LoginDTO),
      this.authController.login
    );
    this.router.post(
      "/forgot-password",
      validateBody(ForgotPasswordDTO),
      this.authController.forgotPassword
    );

    this.router.patch(
      "/reset-password",
      this.jwtMiddleware.verifyToken(JWT_SECRET_KEY_FORGOT_PASSWORD!),
      validateBody(ResetPasswordDTO),
      this.authController.resetPassword
    );
    this.router.patch(
      "/change-password",
      this.jwtMiddleware.verifyToken(JWT_SECRET_KEY!),
      validateBody(ChangePasswordDTO),
      this.authController.changePassword
    );
  }

  getRouter() {
    return this.router;
  }
}
