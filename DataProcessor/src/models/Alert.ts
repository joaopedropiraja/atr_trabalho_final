import mongoose, { Schema, Document, Types } from "mongoose";
import { COLLECTION_NAMES } from "../config/constants";

enum AlertType {
  PRICE_UPPER_THRESHOLD = "priceUpperThreshold",
  PRICE_LOWER_THRESHOLD = "priceLowerThreshold",
}

export class IAlert extends Document {
  user!: Types.ObjectId;
  cryptoCoin!: Types.ObjectId;
  type!: AlertType;
  value!: number;
  isActive!: boolean;
}

const AlertSchema: Schema = new Schema<IAlert>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: COLLECTION_NAMES.USER,
      required: true,
    },
    cryptoCoin: {
      type: Schema.Types.ObjectId,
      ref: COLLECTION_NAMES.CRYPTO_COIN,
      required: true,
    },
    type: { type: String, required: true, enum: Object.values(AlertType) },
    value: { type: Number, required: true },
    isActive: { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
);

export const Alert = mongoose.model<IAlert>(
  COLLECTION_NAMES.ALERT,
  AlertSchema
);
