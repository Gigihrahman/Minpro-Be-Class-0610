// import { nanoid } from "nanoid";
import { comparePassword, hashPassword } from "../../lib/argon";
import { sign } from "jsonwebtoken";
import { PrismaService } from "../prisma/prisma.service";
import { ApiError } from "../../utils/api-error";
import dayjs from "dayjs";
import { injectable } from "tsyringe";
import { RegisterDTO } from "./dto/register.dto";
import { LoginDTO } from "./dto/login.dto";
import { nanoid } from "nanoid";
import {
  BASE_URL_FE,
  JWT_SECRET_KEY,
  JWT_SECRET_KEY_FORGOT_PASSWORD,
} from "../../config";
import { ForgotPasswordDTO } from "./dto/forgot-password.dto";
import { MailService } from "../mail/mail.service";
import { TokenService } from "./token.service";
import { ResetPasswordDTO } from "./dto/reset-password.dto";
import { PasswordService } from "./password.service";
import { ChangePasswordDTO } from "./dto/change-password.dto";
import { RegisterOrganizerDTO } from "./dto/register-organizer.dto";

@injectable()
export class AuthService {
  private prisma: PrismaService;
  private mailService: MailService;
  private tokenService: TokenService;
  private passwordService: PasswordService;

  constructor(
    PrismaClient: PrismaService,
    MailService: MailService,
    TokenService: TokenService,
    PasswordService: PasswordService
  ) {
    this.prisma = PrismaClient;
    this.mailService = MailService;
    this.tokenService = TokenService;
    this.passwordService = PasswordService;
  }

  register = async (body: RegisterDTO) => {
    const existingEmail = await this.prisma.users.findFirst({
      where: { email: body.email },
    });

    if (existingEmail) {
      throw new ApiError("Email already exists", 400);
    }

    const hashedPassword = await hashPassword(body.password);

    const referralCode = nanoid(10);

    const result = await this.prisma.$transaction(async (tx) => {
      let newUser;

      if (body.referralCodeUsed) {
        const refererUser = await tx.users.findFirst({
          where: { referalCode: body.referralCodeUsed },
        });

        if (!refererUser) {
          throw new ApiError("Referral code is invalid", 400);
        }

        newUser = await tx.users.create({
          data: {
            fullName: body.fullName,
            email: body.email,
            password: hashedPassword,
            phoneNumber: body.phoneNumber,
            profilePicture: body.profilePicture,
            referalCode: referralCode,
          },
        });

        await tx.referrals.create({
          data: {
            refererUserId: refererUser.id,
            referredUserId: newUser.id,
          },
        });
        await tx.coupons.create({
          data: {
            name: "Diskon Rp 20.000",
            userId: newUser.id,
            couponCode: `DISKON-h`,
            discount: 20000,
            expiredDate: dayjs().add(3, "month").toDate(),
          },
        });
        const pointsUser = await tx.points.findFirst({
          where: { userId: refererUser.id },
        });

        if (!pointsUser) {
          await tx.points.create({
            data: {
              userId: refererUser.id,
              pointsValue: 10000,
              expiredDate: dayjs().add(3, "month").toDate(),
            },
          });
        } else {
          await tx.points.update({
            where: { id: pointsUser.id },
            data: {
              pointsValue: { increment: 10000 },
              expiredDate: dayjs().add(3, "month").toDate(),
            },
          });
        }
      } else {
        newUser = await tx.users.create({
          data: {
            fullName: body.fullName,
            email: body.email,
            password: hashedPassword,
            phoneNumber: body.phoneNumber,
            profilePicture: body.profilePicture,
            referalCode: referralCode,
          },
        });
      }

      const { password, referalCode, deletedAt, ...safeResult } = newUser;
      return safeResult;
    });

    return result;
  };
  registerOrganizer = async (body: RegisterOrganizerDTO) => {
    const { email, password } = body;

    const existingAdmin = await this.prisma.users.findFirst({
      where: { email },
    });

    if (existingAdmin) {
      throw new ApiError("Email already exists", 400);
    }

    const hashedPassword = await this.passwordService.hashPassword(password);

    const referralCode = nanoid(10);

    // Step 1: Buat user baru dengan role ADMIN
    const newUser = await this.prisma.users.create({
      data: {
        email,
        password: hashedPassword,
        fullName: body.name,
        phoneNumber: body.phoneNumber,
        profilePicture: body.profilePicture,
        referalCode: referralCode,
        role: "ORGANIZER",
      },
    });

    // Step 2: Buat data organizer yang terkait dengan user
    const newOrganizer = await this.prisma.organizer.create({
      data: {
        userId: newUser.id,
        name: body.name,
        phoneNumber: body.phoneNumber,
        profilePicture: body.profilePicture,
        npwp: body.npwp,
        bankName: body.bankName,
        norek:body.norek
      },
    });

    return {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      fullName: newUser.fullName,
      organizer: newOrganizer,
    };
  };

  login = async (body: LoginDTO) => {
    const { email, password } = body;

    const user = await this.prisma.users.findFirst({
      where: { email },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        password: true,
      },
    });

    if (!user) {
      throw new ApiError("Invalid credentials", 400);
    }

    const isPassword = await comparePassword(password, user.password);

    if (!isPassword) {
      throw new ApiError("Invalid credentials", 400);
    }

    const tokenPayload = { id: user.id, role: user.role };

    const accessToken = sign(tokenPayload, JWT_SECRET_KEY!, {
      expiresIn: "2h",
    });
    const { password: pw, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken,
    };
  };

  forgotPassword = async (body: ForgotPasswordDTO) => {
    const { email } = body;

    const user = await this.prisma.users.findFirst({
      where: { email },
    });

    if (!user) {
      throw new ApiError("Invalid email address", 400);
    }

    const token = this.tokenService.generateToken(
      { id: user.id },
      JWT_SECRET_KEY_FORGOT_PASSWORD!,
      { expiresIn: "1h" }
    );

    const link = `${BASE_URL_FE}/reset-password/${token}`;

    await this.mailService.sendEmail(
      email,
      "Link reset password",
      "forgot-password",
      { name: user.fullName, resetLink: link, expiryTime: 1 }
    );

    return { message: "Send email succsess" };
  };

  resetPassword = async (body: ResetPasswordDTO, authUserId: number) => {
    const user = await this.prisma.users.findFirst({
      where: { id: authUserId },
    });

    if (!user) {
      throw new ApiError("User not found", 400);
    }

    const hashedPassword = await this.passwordService.hashPassword(
      body.password
    );

    await this.prisma.users.update({
      where: { id: authUserId },
      data: { password: hashedPassword },
    });

    return { message: "Reset password success" };
  };
  changePassword = async (body: ChangePasswordDTO, userId: number) => {
    const user = await this.prisma.users.findFirst({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError("Invalid user id", 400);
    }
    const { oldPassword, newPassword } = body;

    const isPasswordValid = await this.passwordService.comparePassword(
      oldPassword,
      user.password
    );

    if (!isPasswordValid) {
      throw new ApiError("Invalid credentials", 400);
    }

    const hashedNewPassword = await this.passwordService.hashPassword(
      newPassword
    );

    await this.prisma.users.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    return { message: "Change password success" };
  };
}
