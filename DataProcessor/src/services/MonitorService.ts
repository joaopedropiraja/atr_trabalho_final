import { Service } from "typedi";
import { IPublishPacket } from "mqtt";
import { plainToClass, Type } from "class-transformer";
import { CryptoCoinService } from "./CryptoCoinService";
import { CryptoCoinDetails } from "../dtos/CryptoCoinDTO";
import { MqttClientService } from "./MqttClientService";
import logger from "../config/logger";
import { ICryptoCoin } from "../models/CryptoCoin";
import { CryptoCoinPriceService } from "./CryptoCoinPriceService";
import { Types } from "mongoose";
import { CryptoCoinPrice, ICryptoCoinPrice } from "../models/CryptoCoinPrice";
import { secondsToMilliSeconds } from "../utils/secondsToMilliseconds";
import { WebSocketService } from "./WebScoketService";

enum TOPICS {
  COLLECTOR_START = "collector/start",
  COLLECTOR_STOP = "collector/stop",
  SENSOR_MONITORS = "sensor_monitors",
  DEFAULT_SENSORS = "sensors",
  PROCESSED_DATA = "processed-data",
}

type CryptoCoinMap = Record<
  string,
  { cryptoCoin: ICryptoCoin; interval: NodeJS.Timeout | null }
>;

class Sensor {
  code!: string;
  sensor_id!: string;
  data_type!: string;
  data_interval!: number;
}

class Machine {
  machine_id!: string;

  @Type(() => Sensor)
  sensors!: Sensor[];
}

class SensorData {
  value!: number;
  timestamp!: Date;
}

@Service()
export class MonitorService {
  private intervalMultiplier: number = 5;
  private convertToCoin: string = "BRL";
  private isCollectorActive: boolean = false;
  private cryptoCoinsMap: CryptoCoinMap | null = null;

  constructor(
    private readonly cryptoCoinService: CryptoCoinService,
    private readonly cryptoCoinPriceService: CryptoCoinPriceService,
    private readonly mqttClientService: MqttClientService,
    private readonly webSocketService: WebSocketService
  ) {}

  async startCollector(): Promise<boolean> {
    if (this.isCollectorActive) return false;

    await this.mqttClientService.connect();

    await this.mqttClientService.subscribe(
      TOPICS.SENSOR_MONITORS,
      this.sensorsMonitorOnMessage.bind(this)
    );

    const cryptos = await this.cryptoCoinService.get();
    const cryptoCoins = cryptos.data.map(({ symbol, dataInterval }) => {
      const coinCode = `${symbol.toUpperCase()}${this.convertToCoin}`;
      return new CryptoCoinDetails(coinCode, dataInterval);
    });

    await this.mqttClientService.publish(
      TOPICS.COLLECTOR_START,
      JSON.stringify(cryptoCoins)
    );

    return true;
  }

  async stopCollector(): Promise<boolean> {
    if (!this.isCollectorActive) return false;

    await this.mqttClientService.publish(TOPICS.COLLECTOR_STOP);

    this.clearCryptoCoinsMap();
    this.isCollectorActive = false;

    await this.mqttClientService.end();

    return true;
  }

  private async sensorsMonitorOnMessage(
    topic: string,
    payload: Buffer,
    packet: IPublishPacket
  ) {
    if (this.isCollectorActive) return;

    const payloadObj = JSON.parse(payload.toString());
    const machine = plainToClass(Machine, payloadObj);

    const cryptoCoins = await this.updateCryptoCoinSensorIds(machine);
    this.cryptoCoinsMap = this.buildCryptoCoinsMap(cryptoCoins);

    await this.mqttClientService.subscribe(
      `${TOPICS.DEFAULT_SENSORS}/${machine.machine_id}/#`,
      this.sensorsOnMessage.bind(this)
    );

    this.isCollectorActive = true;
  }

  private async sensorsOnMessage(
    topic: string,
    payload: Buffer,
    packet: IPublishPacket
  ) {
    const sensorId = topic.split("/")?.[2];
    if (!sensorId) {
      logger.error(`Invalid sensors topic: ${topic}.`);
      return;
    }

    this.updateCryptoCoinsMapInterval(sensorId);

    const cryptoCoinId = new Types.ObjectId(
      String(this.cryptoCoinsMap?.[sensorId]?.cryptoCoin?._id)
    );
    if (cryptoCoinId == null || !(cryptoCoinId instanceof Types.ObjectId)) {
      logger.warn(`Invalid crypto coin ID for sensor "${sensorId}".`);
      return;
    }

    await this.saveNewCryptoCoinPrice(cryptoCoinId, payload);

    const event = `${TOPICS.PROCESSED_DATA}/${cryptoCoinId.toString()}`;
    const cryptoCoinWithMetrics =
      await this.cryptoCoinService.getByIdWithMetrics(cryptoCoinId);
    this.webSocketService.broadcast(event, cryptoCoinWithMetrics);

    await this.sendAlerts(cryptoCoinWithMetrics.lastPrice);

    // await this.mqttClientService.publish(
    //   `${TOPICS.PROCESSED_DATA}/${cryptoCoinId.toString()}`,
    //   JSON.stringify({ lastCryptoCoinPrice, metrics })
    // );
  }

  private async sendAlerts(lastCryptoCoinPrice: ICryptoCoinPrice) {}

  private async updateCryptoCoinSensorIds(machine: Machine) {
    return Promise.all(
      machine.sensors.map((sensor) => {
        const convertToCoinIndex = sensor.code.indexOf(this.convertToCoin);
        const symbol = sensor.code.slice(0, convertToCoinIndex);
        return this.cryptoCoinService.updateBySymbol(symbol, {
          sensorId: sensor.sensor_id,
        });
      })
    );
  }

  private buildCryptoCoinsMap(cryptoCoins: (ICryptoCoin | null)[]) {
    this.clearCryptoCoinIntervals();

    return cryptoCoins?.reduce<CryptoCoinMap>((acc, cryptoCoin) => {
      if (!cryptoCoin?.sensorId) return acc;
      acc[cryptoCoin.sensorId] = {
        cryptoCoin,
        interval: setInterval(
          this.sendAlert(cryptoCoin).bind(this),
          secondsToMilliSeconds(cryptoCoin.dataInterval) *
            this.intervalMultiplier
        ),
      };
      return acc;
    }, {});
  }

  private clearCryptoCoinsMap() {
    this.clearCryptoCoinIntervals();
    this.cryptoCoinsMap = null;
  }

  private clearCryptoCoinIntervals() {
    if (this.cryptoCoinsMap) {
      Object.values(this.cryptoCoinsMap).forEach(({ interval }) => {
        if (interval) clearInterval(interval);
      });
    }
  }

  private updateCryptoCoinsMapInterval(sensorId: string) {
    if (!this.cryptoCoinsMap?.[sensorId]) {
      logger.warn(`Sensor ID "${sensorId}" not found in Map.`);
      return;
    }

    const { cryptoCoin } = this.cryptoCoinsMap[sensorId];

    if (this.cryptoCoinsMap[sensorId].interval) {
      clearInterval(this.cryptoCoinsMap[sensorId].interval!);
    }

    this.cryptoCoinsMap[sensorId].interval = setInterval(
      this.sendAlert(cryptoCoin).bind(this),
      secondsToMilliSeconds(cryptoCoin.dataInterval) * this.intervalMultiplier
    );
  }

  private sendAlert(cryptoCoin: ICryptoCoin) {
    return () => {
      console.log(`Alert for ${cryptoCoin.name}`);
    };
  }

  private async saveNewCryptoCoinPrice(
    cryptoCoinId: Types.ObjectId,
    payload: Buffer
  ) {
    const payloadObj = JSON.parse(payload.toString());
    const sensorData = plainToClass(SensorData, payloadObj);

    const cryptoCoinPrice = new CryptoCoinPrice({
      cryptoCoin: cryptoCoinId,
      value: sensorData.value,
      timestamp: sensorData.timestamp,
    });

    await this.cryptoCoinPriceService.create(cryptoCoinPrice);
  }
}
