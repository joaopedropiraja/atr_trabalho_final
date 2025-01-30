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

export enum EXIT_STATUS {
  SUCCESS = 0,
  FAILURE = 1,
}

export enum COLLECTION_NAMES {
  USER = "users",
  ALERT = "alerts",
  CRYPTO_COIN = "cryptocoins",
  CRYPTO_COIN_PRICE = "cryptocoinprices",
}
