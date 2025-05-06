import { Queue } from "bullmq";

import { redisConnection } from "./../../../lib/redis";

export const adminConfirmationQueue = new Queue("admin-confirmation-queue", {
  connection: redisConnection,
});
