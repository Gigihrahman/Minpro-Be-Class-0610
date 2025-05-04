import { IsOptional, IsString } from "class-validator";
import { PaginationQueryParams } from "../../pagination/dto/pagination.dto";

export class GetEventsDTO extends PaginationQueryParams {
  @IsOptional()
  @IsString()
  readonly search?: string;
  @IsOptional()
  @IsString()
  readonly city?: string;
  @IsOptional()
  @IsString()
  readonly category?: string;
}
