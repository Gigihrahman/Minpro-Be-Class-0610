import { injectable } from "tsyringe";
import { PrismaService } from "../prisma/prisma.service";
import { ApiError } from "../../utils/api-error";
import { CloudinaryService } from "../cloudinary/cloudinary.service";
import { UpdateProfileDTO } from "./dto/update-profile.dto";

@injectable()
export class ProfileService {
  private prisma: PrismaService;
  private cloudinaryService: CloudinaryService;

  constructor(
    PrismaService: PrismaService,
    CloudinaryService: CloudinaryService
  ) {
    this.prisma = PrismaService;
    this.cloudinaryService = CloudinaryService;
  }
  updateProfile = async (id: number, body: UpdateProfileDTO) => {
    const user = await this.prisma.users.findFirst({
      where: { id, deletedAt: null },
    });

    if (!user) {
      throw new ApiError("Invalid user id", 400);
    }

    if (body.email) {
      const existingEmail = await this.prisma.users.findFirst({
        where: { email: body.email },
      });

      if (existingEmail) {
        throw new ApiError("Email sudah ada", 400);
      }
    }
    const updateProfile = await this.prisma.users.update({
      where: { id },
      data: body,
    });

    return { message: "Update product success", updateProfile };
  };

  UpdateFotoProfile = async (foto: Express.Multer.File, userId: number) => {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    if (user.profilePicture) {
      await this.cloudinaryService.remove(user.profilePicture);
    }

    const result = await this.cloudinaryService.upload(foto);

    const updatedUser = await this.prisma.users.update({
      where: { id: userId },
      data: {
        profilePicture: result.secure_url,
      },
      select: {
        id: true,
        profilePicture: true,
      },
    });

    return updatedUser;
  };
  getProfile = async (userId: number) => {
    const user = await this.prisma.users.findFirst({
      where: {
        id: userId,
      },
      omit: {
        password: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      },
    });

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    // if (!user.profilePicture) {
    //   throw new ApiError("Profile picture not found", 404);
    // }

    return user;
  };
}
