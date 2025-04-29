import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsStrongPassword,
  Matches,
} from "class-validator";

export class UpdateProfileDTO {
  @IsNotEmpty()
  @IsString()
  readonly fullName!: string;

  @IsNotEmpty()
  @IsEmail()
  readonly email!: string;

  @IsOptional()
  @IsString()
  readonly referralCodeUsed?: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+$/, { message: "please enter only number" })
  readonly phoneNumber!: string;

}
