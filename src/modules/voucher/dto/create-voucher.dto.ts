import { IsDate, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { Type } from "class-transformer";

export class CreateVoucherDTO {
  @IsNotEmpty()
  @IsString()
  readonly description!: string;

  @IsNotEmpty()
  @IsNumber()
  readonly quota!: number;
  @IsNotEmpty()
  @IsNumber()
  readonly value!: number;
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  readonly validAt!: Date;
  @IsNotEmpty()
  @Type(() => Date) // Ensure that the value is transformed to Date before validation
  @IsDate()
  readonly expiredAt!: Date;
}
