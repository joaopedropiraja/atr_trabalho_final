import { JsonController, Get, Param, Post } from "routing-controllers";
import { Service } from "typedi";

@Service()
@JsonController("/monitor", { transformResponse: false })
export class Monitor {
  constructor() {}

  @Post("/start")
  async startCollector() {
    return { message: "Collector started." };
  }

  @Post("/stop")
  async stopCollector() {
    return { message: "Collector stopped." };
  }
}
