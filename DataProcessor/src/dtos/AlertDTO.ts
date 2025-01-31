import { AlertType } from "../models/Alert";
import { IsDate, IsDefined, IsNumber, IsString } from "class-validator";

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
