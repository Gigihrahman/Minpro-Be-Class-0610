import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateReviewDTO {
  @IsNotEmpty()
  @IsString()
  readonly comment!: string;

  @IsNotEmpty()
  @IsNumber()
  readonly rating!: number;
}
