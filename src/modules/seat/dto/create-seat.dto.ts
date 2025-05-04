import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateSeatDTO {
  @IsNotEmpty()
  @IsString()
  readonly name!: string;
  @IsNotEmpty()
  @IsString()
  readonly description!: string;

  @IsNotEmpty()
  @IsNumber()
  readonly price!: number;
  @IsNotEmpty()
  @IsNumber()
  readonly totalSeat!: number;
}
