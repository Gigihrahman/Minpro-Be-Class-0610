import { IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateSeatDTO {
  @IsOptional()
  @IsString()
  readonly name!: string;
  @IsOptional()
  @IsString()
  readonly description!: string;

  @IsOptional()
  @IsNumber()
  readonly price!: number;
  @IsOptional()
  @IsNumber()
  readonly totalSeat!: number;
}
