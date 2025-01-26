import { Service } from "typedi";
import { CryptoCoinService } from "./CryptoCoinService";
import { CryptoCoinDetails } from "../dtos/CryptoCoinDTO";
import { MqttClientService } from "./MqttClientService";
import { IPublishPacket, MqttClient } from "mqtt";

enum TOPICS {
  COLLECTOR_START = "collector/start",
  COLLECTOR_STOP = "collector/stop",
  SENSOR_MONITORS = "sensor_monitors",
  DEFAULT_SENSORS = "sensors",
}

@Service()
export class MonitorService {
  private isCollectorActive: boolean = false;
  private sensorMonitorsClient?: MqttClient;

  constructor(
    private readonly cryptoCoinService: CryptoCoinService,
    private readonly mqttClientService: MqttClientService
  ) {}

  async startCollector(): Promise<boolean> {
    if (this.isCollectorActive) return false;

    this.sensorMonitorsClient = await this.mqttClientService.subscribe(
      TOPICS.SENSOR_MONITORS,
      this.sensorsMonitorOnMessage.bind(this)
    );

    const result = await this.cryptoCoinService.get();
    const cryptoCoins = result.data.map(({ symbol, acquisitionInterval }) => {
      const coinCode = `${symbol.toUpperCase()}BRL`;
      return new CryptoCoinDetails(coinCode, acquisitionInterval);
    });

    await this.mqttClientService.sendMessage(
      TOPICS.COLLECTOR_START,
      JSON.stringify(cryptoCoins)
    );

    this.isCollectorActive = true;

    return true;
  }

  async stopCollector(): Promise<boolean> {
    if (!this.isCollectorActive) return false;

    await this.mqttClientService.sendMessage(TOPICS.COLLECTOR_STOP);
    await this.sensorMonitorsClient?.endAsync();

    this.isCollectorActive = false;

    return true;
  }

  private async sensorsMonitorOnMessage(
    topic: string,
    payload: Buffer,
    packet: IPublishPacket
  ) {
    console.log(topic);
    console.log(payload.toString());
  }
}
