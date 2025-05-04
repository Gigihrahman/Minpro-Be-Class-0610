import { Transform } from "class-transformer";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class PaginationQueryParams {
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  readonly take: number = 5;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  readonly page: number = 1;

  @IsOptional()
  @IsString()
  readonly sortBy: string = "createdAt";

  @IsOptional()
  @IsString()
  readonly sortOrder: string = "desc";
}
