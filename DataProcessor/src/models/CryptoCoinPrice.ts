import mongoose, { Schema, Document, Types } from "mongoose";
import { COLLECTION_NAMES } from "../config/constants";

export class ICryptoCoinPrice extends Document {
  cryptoCoin!: Types.ObjectId;
  value!: number;
  timestamp!: Date;
}

const CryptoCoinPriceSchema: Schema = new Schema<ICryptoCoinPrice>(
  {
    cryptoCoin: {
      type: Schema.Types.ObjectId,
      ref: COLLECTION_NAMES.CRYPTO_COIN,
      required: true,
    },
    value: { type: Number, required: true },
    timestamp: { type: Date, required: true },
  },
  {
    timeseries: {
      timeField: "timestamp",
      metaField: "cryptoCoin",
      granularity: "seconds",
    },
  }
);

export const CryptoCoinPrice = mongoose.model<ICryptoCoinPrice>(
  COLLECTION_NAMES.CRYPTO_COIN_PRICE,
  CryptoCoinPriceSchema
);
