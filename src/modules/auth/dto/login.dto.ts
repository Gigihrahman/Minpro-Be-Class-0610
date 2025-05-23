import { IsNotEmpty, IsEmail, IsString } from "class-validator";

export class LoginDTO {
  @IsNotEmpty()
  @IsEmail()
  readonly email!: string;

  @IsNotEmpty()
  @IsString()
  readonly password!: string;
}
