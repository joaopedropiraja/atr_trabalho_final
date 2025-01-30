import {
  JsonController,
  Get,
  Param,
  Post,
  Authorized,
} from "routing-controllers";
import { Service } from "typedi";
import { MonitorService } from "../services/MonitorService";
import { ROLES } from "../models/User";

@Service()
@JsonController("/monitor", { transformResponse: false })
export class MonitorController {
  constructor(private readonly monitorService: MonitorService) {}

  @Authorized(ROLES.ADMIN)
  @Post("/start")
  async startCollector() {
    const isSucceeded = await this.monitorService.startCollector();

    return {
      message: isSucceeded ? "Collector started." : "Collector already active.",
    };
  }

  @Authorized(ROLES.ADMIN)
  @Post("/stop")
  async stopCollector() {
    const isSucceeded = await this.monitorService.stopCollector();

    return {
      message: isSucceeded
        ? "Collector stopped."
        : "Collector already inactive.",
    };
  }
}
