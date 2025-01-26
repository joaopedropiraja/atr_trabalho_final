import { JsonController, Get, Param, Post } from "routing-controllers";
import { Service } from "typedi";
import { MonitorService } from "../services/MonitorService";

@Service()
@JsonController("/monitor", { transformResponse: false })
export class MonitorController {
  constructor(private readonly monitorService: MonitorService) {}

  @Post("/start")
  async startCollector() {
    const isCollectorAlreadyActive = await this.monitorService.startCollector();

    return {
      message: isCollectorAlreadyActive
        ? "Collector already active."
        : "Collector started.",
    };
  }

  @Post("/stop")
  async stopCollector() {
    const isCollectorAlreadyInactive =
      await this.monitorService.stopCollector();

    return {
      message: isCollectorAlreadyInactive
        ? "Collector already inactive."
        : "Collector stopped.",
    };
  }
}
