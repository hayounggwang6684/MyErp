import type { Response } from "express";

export function sendJson(response: Response, statusCode: number, body: unknown) {
  response.status(statusCode).json(body);
}
