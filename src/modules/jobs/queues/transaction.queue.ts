import { Queue } from "bullmq";
import { redisConnection } from "../../../lib/redis";

export const userTransactionQueue = new Queue("user-transaction-queue", {
  connection: redisConnection,
});
