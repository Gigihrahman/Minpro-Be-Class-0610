import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";
import { BankName } from "../../../generated/prisma";

export class UpdateOrganizerProfileDTO {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  fullName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+?[0-9]{10,15}$/, { message: "Phone number must be valid" })
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  profilePicture?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+?[0-9]{10,15}$/, {
    message: "Organizer phone number must be valid",
  })
  organizerPhoneNumber?: string;

  @IsOptional()
  @IsString()
  organizerProfilePicture?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{15,16}$/, { message: "NPWP must be valid" })
  npwp?: string;

  @IsOptional()
  @IsEnum(BankName)
  bankName?: BankName;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{10,20}$/, { message: "Bank account number must be valid" })
  norek?: string;
}
