import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsStrongPassword,
  Matches,
  IsEnum,
} from "class-validator";

export enum BankName {
  BCA = "BCA",
  BRI = "BRI",
  BNI = "BNI",
}

export class RegisterOrganizerDTO {
  @IsNotEmpty()
  @IsString()
  readonly name!: string;

  @IsNotEmpty()
  @IsEmail()
  readonly email!: string;

  @IsNotEmpty()
  @IsStrongPassword()
  readonly password!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+$/, { message: "please enter only number" })
  readonly phoneNumber!: string;

  @IsOptional()
  @IsString()
  readonly profilePicture?: string;

  @IsString()
  @IsNotEmpty()
  readonly npwp!: string;

  @IsNotEmpty()
  @IsNumber()
  readonly norek!: number;

  @IsOptional()
  @IsString()
  readonly referralCodeUsed?: string;

  @IsNotEmpty()
  @IsEnum(BankName, { message: "Bank name must be BCA, BRI, or BNI" })
  readonly bankName!: BankName;
}
