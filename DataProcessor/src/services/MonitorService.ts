import { Service } from "typedi";
import { IPublishPacket, MqttClient } from "mqtt";
import { plainToClass, Type } from "class-transformer";
import { CryptoCoinService } from "./CryptoCoinService";
import { CryptoCoinDetails } from "../dtos/CryptoCoinDTO";
import { MqttClientService } from "./MqttClientService";
import logger from "../config/logger";
import { ICryptoCoin } from "../models/CryptoCoin";
import { CryptoCoinPriceService } from "./CryptoCoinPriceService";
import { Types } from "mongoose";
import { CryptoCoinPrice } from "../models/CryptoCoinPrice";
import { secondsToMilliSeconds } from "../utils/secondsToMilliseconds";

enum TOPICS {
  COLLECTOR_START = "collector/start",
  COLLECTOR_STOP = "collector/stop",
  SENSOR_MONITORS = "sensor_monitors",
  DEFAULT_SENSORS = "sensors",
}

type CryptoCoinMap = {
  [key: string]: { cryptoCoin: ICryptoCoin; interval: NodeJS.Timeout | null };
};

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

  private sensorMonitorsClient?: MqttClient;
  private sensorsClient?: MqttClient;
  private cryptoCoinsMap?: CryptoCoinMap;

  constructor(
    private readonly cryptoCoinService: CryptoCoinService,
    private readonly cryptoCoinPriceService: CryptoCoinPriceService,
    private readonly mqttClientService: MqttClientService
  ) {}

  async startCollector(): Promise<boolean> {
    if (this.isCollectorActive) return false;

    this.sensorMonitorsClient = await this.mqttClientService.subscribe(
      TOPICS.SENSOR_MONITORS,
      this.sensorsMonitorOnMessage.bind(this)
    );

    const result = await this.cryptoCoinService.get();
    const cryptoCoins = result.data.map(({ symbol, dataInterval }) => {
      const coinCode = `${symbol.toUpperCase()}${this.convertToCoin}`;
      return new CryptoCoinDetails(coinCode, dataInterval);
    });

    await this.mqttClientService.sendMessage(
      TOPICS.COLLECTOR_START,
      JSON.stringify(cryptoCoins)
    );

    return true;
  }

  async stopCollector(): Promise<boolean> {
    if (!this.isCollectorActive) return false;

    await this.mqttClientService.sendMessage(TOPICS.COLLECTOR_STOP);
    await this.sensorMonitorsClient?.endAsync();
    await this.sensorsClient?.endAsync();

    this.clearCryptoCoinsMap();
    this.isCollectorActive = false;

    return true;
  }

  private async sensorsMonitorOnMessage(
    topic: string,
    payload: Buffer,
    packet: IPublishPacket
  ) {
    const payloadObj = JSON.parse(payload.toString());
    const machine = plainToClass(Machine, payloadObj);

    const cryptoCoins = await this.updateCryptoCoinSensorIds(machine);
    this.cryptoCoinsMap = this.buildCryptoCoinsMap(cryptoCoins);

    if (this.isCollectorActive) return;

    this.sensorsClient = await this.mqttClientService.subscribe(
      `${TOPICS.DEFAULT_SENSORS}/${machine.machine_id}/#`,
      this.sensorsOnMessage.bind(this)
    );

    this.isCollectorActive = true;
  }

  private buildCryptoCoinsMap(cryptoCoins: (ICryptoCoin | null)[]) {
    this.clearCryptoCoinsMap();
    return cryptoCoins?.reduce<CryptoCoinMap>((acc, cryptoCoin) => {
      if (cryptoCoin == null || cryptoCoin.sensorId == null) return acc;

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
    Object.values(this.cryptoCoinsMap || {}).forEach(({ interval }) => {
      if (interval) {
        clearInterval(interval);
      }
    });

    this.cryptoCoinsMap = undefined;
  }

  private sendAlert(cryptoCoin: ICryptoCoin) {
    return () => {
      console.log(cryptoCoin.name);
    };
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

    const lastCryptoCoinPrice = await this.saveNewCryptoCoinPrice(
      cryptoCoinId,
      payload
    );
    const metrics = await this.cryptoCoinPriceService.getMetrics(cryptoCoinId);

    // sendToMqtt
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
    return this.cryptoCoinPriceService.create(cryptoCoinPrice);
  }

  private updateCryptoCoinsMapInterval(sensorId: string) {
    if (this.cryptoCoinsMap?.[sensorId] == null) {
      logger.warn(`Sensor ID "${sensorId}" not found in Map.`);
      return;
    }
    const { cryptoCoin } = this.cryptoCoinsMap[sensorId];

    if (this.cryptoCoinsMap[sensorId].interval) {
      clearInterval(this.cryptoCoinsMap[sensorId].interval);
    }

    this.cryptoCoinsMap[sensorId].interval = setInterval(
      this.sendAlert(cryptoCoin).bind(this),
      secondsToMilliSeconds(cryptoCoin.dataInterval) * this.intervalMultiplier
    );
  }

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
}
