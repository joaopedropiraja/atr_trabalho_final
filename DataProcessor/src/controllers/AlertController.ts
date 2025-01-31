import { Service } from "typedi";
import {
  JsonController,
  Get,
  Post,
  Body,
  QueryParam,
  HttpCode,
  CurrentUser,
  Param,
} from "routing-controllers";

import { HTTP_CODES } from "../config/constants";
import { AlertService } from "../services/AlertService";
import { CreateAlertDTO } from "../dtos/AlertDTO";
import { Alert } from "../models/Alert";
import { IUser } from "../models/User";
import { Types } from "mongoose";

@JsonController("/alerts", { transformResponse: false })
@Service()
export class AlertController {
  constructor(private readonly alertService: AlertService) {}

  @Get("/")
  async getAlerts(
    @QueryParam("page") page: number = 1,
    @QueryParam("limit") limit: number = 0
  ) {
    return this.alertService.get(page, limit);
  }

  @Get("/:cryptoCoinId/crypto-coins")
  async getAlertsByCryptoCoinIdAndLoggedUser(
    @Param("cryptoCoinId") cryptoCoinId: string,
    @CurrentUser() user: IUser
  ) {
    return this.alertService.getByCryptoCoinIdAndLoggedUser(
      user._id as Types.ObjectId,
      new Types.ObjectId(String(cryptoCoinId))
    );
  }

  @Post("/")
  @HttpCode(HTTP_CODES.CREATED)
  async createAlert(@Body() alert: CreateAlertDTO, @CurrentUser() user: IUser) {
    const newAlert = new Alert({
      user: user._id,
      cryptoCoin: alert.cryptoCoinId,
      type: alert.type,
      value: alert.value,
    });

    return this.alertService.create(newAlert);
  }
}
