import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsStrongPassword,
  Matches,
} from "class-validator";

export class RegisterDTO {
  @IsNotEmpty()
  @IsString()
  readonly fullName!: string;

  @IsNotEmpty()
  @IsEmail()
  readonly email!: string;

  @IsNotEmpty()
  @IsStrongPassword()
  readonly password!: string;

  @IsOptional()
  @IsString()
  readonly referralCodeUsed?: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+$/, { message: "please enter only number" })
  readonly phoneNumber!: string;

  @IsOptional()
  @IsString()
  readonly profilePicture?: string;
}
