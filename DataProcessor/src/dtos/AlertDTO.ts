import { AlertType } from "../models/Alert";
import { IsDefined, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateAlertDTO {
  @IsDefined({ always: true })
  @IsString()
  cryptoCoinId!: string;

  @IsDefined({ always: true })
  @IsString()
  type!: AlertType;

  @IsDefined({ always: true })
  @IsNumber()
  value!: number;
}
