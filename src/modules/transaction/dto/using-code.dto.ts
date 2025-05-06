import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";

export class UsingCodeDTO {
  @IsOptional()
  @IsString()
  readonly voucherCode?: string;

  @IsString()
  @IsOptional()
  readonly couponCode!: string;

  @IsBoolean()
  @IsOptional()
  readonly isUsedPoints?: boolean;
}
