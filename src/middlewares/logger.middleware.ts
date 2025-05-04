import { Request, Response, NextFunction } from "express";

/**
 * Logger middleware to log HTTP requests
 */
const loggerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const method = req.method;
  const url = req.originalUrl;
  const timestamp = new Date().toISOString();

  // Log request details
  console.log(`[${timestamp}] ${method} ${url} ${req.body}`);

  // Optionally log the request body (useful for POST/PUT requests)
  if (["POST", "PUT", "GET"].includes(method) && req.body) {
    console.log("Request Body:", JSON.stringify(req.body, null, 2));
  }

  // Call the next middleware or route handler
  next();
};

export default loggerMiddleware;
