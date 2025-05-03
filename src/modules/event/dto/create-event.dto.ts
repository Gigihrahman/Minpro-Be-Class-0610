import { IsDate, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { Transform, Type } from "class-transformer"; // Import Type decorator

export class CreateEventDTO {
  @IsNotEmpty()
  @IsString()
  readonly name!: string;

  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  readonly categoryId!: number;

  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  readonly cityId!: number;

  @IsNotEmpty()
  @IsString()
  readonly description!: string;

  @IsNotEmpty()
  @IsString()
  readonly locationDetail!: string;

  @IsNotEmpty()
  @Type(() => Date) // Ensure that the value is transformed to Date before validation
  @IsDate()
  readonly startEvent!: Date;

  @IsNotEmpty()
  @Type(() => Date) // Ensure that the value is transformed to Date before validation
  @IsDate()
  readonly endEvent!: Date;

  @IsNotEmpty()
  @IsString()
  readonly content!: string;
}
