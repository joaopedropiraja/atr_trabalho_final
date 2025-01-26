import multer, { Options } from "multer";
import { Request } from "express";
import { BadRequestError } from "routing-controllers";
import path from "path";

export const numToMegaBytes = (num: number) => num * 1024 * 1024;

export const fileUploadConfig = (
  allowedMimes: string[],
  sizeLimitInMB: number
): Options => ({
  storage: multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb) => {
      cb(null, "uploads/");
    },
    filename: (req: Request, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(
        null,
        `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`
      );
    },
  }),
  fileFilter: (req: Request, file: Express.Multer.File, cb) => {
    const mimeTypeIsValid = allowedMimes.includes(file.mimetype);

    if (!mimeTypeIsValid) {
      return cb(new BadRequestError(`${file.fieldname} mime type is invalid`));
    }

    return cb(null, true);
  },
  limits: {
    fileSize: numToMegaBytes(sizeLimitInMB),
  },
});
