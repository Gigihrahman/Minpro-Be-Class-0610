import { IsOptional, IsString } from "class-validator";
import { PaginationQueryParams } from "../../pagination/dto/pagination.dto";

export class SearchTransactionUserDTO extends PaginationQueryParams {
  @IsOptional()
  @IsString()
  readonly status?: string;
}
