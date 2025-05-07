import { ApiError } from "../../utils/api-error";
import { injectable } from "tsyringe";
import { PrismaService } from "../prisma/prisma.service";
import { CloudinaryService } from "../cloudinary/cloudinary.service";
import { sign } from "jsonwebtoken";
import { JWT_SECRET_KEY } from "../../config";

@injectable()
export class FotoProfileService {
  private prisma: PrismaService;
  private cloudinary: CloudinaryService;

  constructor(
    PrismaClient: PrismaService,
    CloudinaryService: CloudinaryService
  ) {
    this.prisma = PrismaClient;
    this.cloudinary = CloudinaryService;
  }
  getFotoProfile = async (id: number) => {
    const user = await this.prisma.users.findFirst({
      where: {
        id: id,
      },
      select: {
        profilePicture: true,
      },
    });

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    if (!user.profilePicture) {
      throw new ApiError("Profile picture not found", 404);
    }

    return { profilePicture: user.profilePicture };
  };

  updateFotoProfile = async (userId: number, file: Express.Multer.File) => {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    if (user.profilePicture) {
      await this.cloudinary.remove(user.profilePicture);
    }
    const tokenPayload = { id: user.id, role: user.role };

    const accessToken = sign(tokenPayload, JWT_SECRET_KEY!, {
      expiresIn: "2h",
    });
    const result = await this.cloudinary.upload(file);

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

    return {
      accessToken,
      updatedUser,
    };
  };
}
