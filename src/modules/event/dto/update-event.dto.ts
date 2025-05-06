import { IsDate, IsNumber, IsOptional, IsString } from "class-validator";
import { Transform, Type } from "class-transformer"; // Import Type decorator

export class UpdateEventDTO {
  @IsOptional()
  @IsString()
  readonly name?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  readonly categoryId?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  readonly cityId?: number;

  @IsOptional()
  @IsString()
  readonly description?: string;

  @IsOptional()
  @IsString()
  readonly locationDetail?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  readonly startEvent?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  readonly endEvent?: Date;

  @IsOptional()
  @IsString()
  readonly content?: string;

  @IsOptional()
  @IsString()
  readonly slug?: string;
}
