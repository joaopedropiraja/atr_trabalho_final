import mongoose, { Document, Schema } from "mongoose";
import { COLLECTION_NAMES } from "../config/constants";

enum Platform {
  IOS = "ios",
  ANDROID = "android",
}

export class Device {
  device_id!: string;
  device_name!: string;
  platform!: Platform;
  push_token!: string | null;
  last_login_at!: Date | null;
}

export class IUser extends Document {
  name!: string;
  email!: string;
  password?: string;
  isAdmin!: boolean;
  devices!: Device[];
}

const UserSchema: Schema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    password: {
      type: String,
      required: true,
    },
    devices: [
      {
        device_id: { type: String, required: true },
        device_name: { type: String, required: true },
        platform: {
          type: String,
          required: true,
          enum: Object.values(Platform),
        },
        push_token: { type: String, required: true },
        last_login_at: { type: Date },
      },
    ],
  },
  { timestamps: true }
);

UserSchema.index({ name: "text", email: "text" });

export const User = mongoose.model<IUser>(COLLECTION_NAMES.USER, UserSchema);
