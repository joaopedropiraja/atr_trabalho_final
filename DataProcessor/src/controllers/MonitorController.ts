import { JsonController, Get, Param, Post } from "routing-controllers";
import { Service } from "typedi";
import { MonitorService } from "../services/MonitorService";

@Service()
@JsonController("/monitor", { transformResponse: false })
export class MonitorController {
  constructor(private readonly monitorService: MonitorService) {}

  @Post("/start")
  async startCollector() {
    const wasStartSucceed = await this.monitorService.startCollector();

    return {
      message: wasStartSucceed
        ? "Collector started."
        : "Collector already active.",
    };
  }

  @Post("/stop")
  async stopCollector() {
    const wasStopSucceed = await this.monitorService.stopCollector();

    return {
      message: wasStopSucceed
        ? "Collector stopped."
        : "Collector already inactive.",
    };
  }
}
