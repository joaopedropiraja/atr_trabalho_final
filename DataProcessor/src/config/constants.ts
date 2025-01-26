// Supported success response status codes
export enum HTTP_CODES {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_SERVER = 500,
}

// Application supported exit statuses
export enum EXIT_STATUS {
  SUCCESS = 0,
  FAILURE = 1,
}

export enum COLLECTION_NAMES {
  USER = "users",
  CRYPTO_COIN = "cryptocoins",
  CRYPTO_COIN_PRICE = "cryptocoinprices",
}

export const IMAGE_CONFIG = {
  fileName: "Image",
  allowedMimeTypes: ["image/jpeg", "image/pjpeg", "image/png", "image/gif"],
  sizeLimitInMB: 5,
};
