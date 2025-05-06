import { IsArray, IsNotEmpty, IsNumber, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

class EventDetail {
  @IsNumber()
  @IsNotEmpty()
  seatsId!: number;

  @IsNumber()
  @IsNotEmpty()
  quantity!: number;
}

export class CreateTransactionDTO {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EventDetail)
  @IsNotEmpty()
  readonly detailsEvent!: EventDetail[];

  @IsNumber()
  @IsNotEmpty()
  readonly eventId!: number;
}
