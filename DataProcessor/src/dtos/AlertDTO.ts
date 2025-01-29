import { AlertType } from "../models/Alert";
import { IsNotEmpty } from "class-validator";

export class CreateAlertDTO {
  @IsNotEmpty()
  userId!: string;

  @IsNotEmpty()
  cryptoCoinId!: string;

  @IsNotEmpty()
  type!: AlertType;

  @IsNotEmpty()
  value!: number;
}
