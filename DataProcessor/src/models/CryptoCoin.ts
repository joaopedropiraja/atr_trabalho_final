import mongoose, { Schema, Document } from "mongoose";
import { COLLECTION_NAMES } from "../config/constants";

export class ICryptoCoin extends Document {
  name!: string;
  symbol!: string;
  image!: {
    thumb: string;
    small: string;
    large: string;
  };
  acquisitionInterval!: number;
  sensorId?: string;
}

const CryptoCoinSchema: Schema = new Schema<ICryptoCoin>(
  {
    name: { type: String, required: true },
    symbol: { type: String, required: true, unique: true },
    image: {
      thumb: { type: String, required: true },
      small: { type: String, required: true },
      large: { type: String, required: true },
    },
    acquisitionInterval: { type: Number, required: true },
    sensorId: { type: String },
  },
  {
    timestamps: true,
    toObject: {
      transform: (doc, ret) => {
        ret._id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const CryptoCoin = mongoose.model<ICryptoCoin>(
  COLLECTION_NAMES.CRYPTO_COIN,
  CryptoCoinSchema
);
