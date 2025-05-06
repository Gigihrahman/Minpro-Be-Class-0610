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
  // DTO for updating organizer profile

  // updateProfileOrganizer = async (
  //   id: number,
  //   body: UpdateOrganizerProfileDTO
  // ) => {
  //   // First check if the user exists
  //   const user = await this.prisma.users.findFirst({
  //     where: {
  //       id,
  //       deletedAt: null,
  //     },
  //     include: {
  //       organizer: true,
  //     },
  //   });

  //   if (!user) {
  //     throw new ApiError("Invalid user id", 400);
  //   }

  //   // Check if the user has an organizer profile
  //   if (!user.organizer || user.organizer.length === 0) {
  //     throw new ApiError("User is not an organizer", 400);
  //   }

  //   const organizerId = user.organizer[0].id;

  //   // Check if email is unique if it's being updated
  //   if (body.email && body.email !== user.email) {
  //     const existingEmail = await this.prisma.users.findFirst({
  //       where: {
  //         email: body.email,
  //         id: { not: id },
  //       },
  //     });

  //     if (existingEmail) {
  //       throw new ApiError("Email sudah ada", 400);
  //     }
  //   }

  //   // Separate user and organizer data
  //   const userData: UserData = {
  //     fullName: body.fullName,
  //     email: body.email,
  //     phoneNumber: body.phoneNumber,
  //     profilePicture: body.profilePicture,
  //   };

  //   // Filter out undefined values from userData
  //   for (const key in userData) {
  //     if (userData[key] === undefined) {
  //       delete userData[key];
  //     }
  //   }

  //   // Separate organizer data
  //   const organizerData: OrganizerData = {
  //     name: body.name,
  //     phoneNumber: body.organizerPhoneNumber,
  //     profilePicture: body.organizerProfilePicture,
  //     npwp: body.npwp,
  //     bankName: body.bankName,
  //     norek: body.norek,
  //   };

  //   // Filter out undefined values from organizerData
  //   for (const key in organizerData) {
  //     if (organizerData[key] === undefined) {
  //       delete organizerData[key];
  //     }
  //   }

  //   // Use transaction to update both user and organizer
  //   const result = await this.prisma.$transaction(async (prisma) => {
  //     // Update user data if there's any
  //     let updatedUser = null;
  //     if (Object.keys(userData).length > 0) {
  //       updatedUser = await prisma.users.update({
  //         where: { id },
  //         data: userData,
  //       });
  //     } else {
  //       updatedUser = user;
  //     }

  //     // Update organizer data if there's any
  //     let updatedOrganizer = null;
  //     if (Object.keys(organizerData).length > 0) {
  //       updatedOrganizer = await prisma.organizer.update({
  //         where: { id: organizerId }, // Use the organizer's primary key id, not userId
  //         data: organizerData,
  //       });
  //     } else {
  //       updatedOrganizer = user.organizer[0];
  //     }

  //     return {
  //       user: updatedUser,
  //       organizer: updatedOrganizer,
  //     };
  //   });

  //   return {
  //     message: "Update organizer profile success",
  //     data: result,
  //   };
  // };
  
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
  getProfileOrganizer = async (userId: number) => {
    const user = await this.prisma.users.findFirst({
      where: {
        id: userId,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        profilePicture: true,
        phoneNumber: true,
        role: true,
        referalCode: true,
        organizer: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
            phoneNumber: true,
            npwp: true,
            bankName: true,
            norek: true,
            isVerified: true,
          },
        },
      },
    });

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    // Check if the user has an organizer profile
    if (!user.organizer || user.organizer.length === 0) {
      throw new ApiError("Organizer profile not found", 404);
    }

    // Return user data with the first organizer profile
    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        profilePicture: user.profilePicture,
        phoneNumber: user.phoneNumber,
        role: user.role,
        referalCode: user.referalCode,
      },
      organizerProfile: user.organizer[0],
    };
  };

  // You can add more organizer-related methods here
}
