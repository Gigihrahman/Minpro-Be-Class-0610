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
  @IsOptional()
  @IsString()
  readonly fullName!: string;

  @IsOptional()
  @IsEmail()
  readonly email!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+$/, { message: "please enter only number" })
  readonly phoneNumber!: string;
}
