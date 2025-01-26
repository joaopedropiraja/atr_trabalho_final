import { HttpError } from "routing-controllers";
import { HTTP_CODES } from "../config/constants";

export class ConflictError extends HttpError {
  constructor(message?: string) {
    super(HTTP_CODES.CONFLICT, message);
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}
