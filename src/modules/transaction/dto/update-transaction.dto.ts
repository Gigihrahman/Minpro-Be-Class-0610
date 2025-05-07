import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from "class-validator";

/**
 * Enum yang sesuai dengan schema Prisma
 */
export enum TransactionStatus {
  CREATED = "CREATED",
  WAITING_FOR_PAYMENT = "WAITING_FOR_PAYMENT",
  WAITING_FOR_ADMIN_CONFIRMATION = "WAITING_FOR_ADMIN_CONFIRMATION",
  DONE = "DONE",
  REJECTED = "REJECTED",
  EXPIRED = "EXPIRED",
  CANCELED = "CANCELED",
}

/**
 * Data Transfer Object untuk update transaksi
 */
export class UpdateTransactionDTO {
  @IsEnum(TransactionStatus, {
    message: "Status harus salah satu dari nilai TransactionStatus yang valid",
  })
  @IsNotEmpty()
  readonly status!: TransactionStatus; // DONE, REJECTED

  @IsOptional()
  @IsUrl(
    {},
    {
      message: "paymentProofUrl harus berupa URL yang valid",
    }
  )
  readonly paymentProofUrl?: string; // Opsional, jika perlu update bukti pembayaran

  @IsOptional()
  @IsString({
    message: "adminNote harus berupa string",
  })
  @MaxLength(500, {
    message: "adminNote tidak boleh lebih dari 500 karakter",
  })
  readonly adminNote?: string; // Opsional, catatan dari admin
}
