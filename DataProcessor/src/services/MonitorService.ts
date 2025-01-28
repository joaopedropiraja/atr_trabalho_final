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
    private readonly mqttClientService: MqttClientService
  ) {}

  /**
   * Starts the collector by:
   * 1. Connecting to MQTT (if not already connected).
   * 2. Subscribing to SENSOR_MONITORS.
   * 3. Publishing the initial list of crypto coins to COLLECTOR_START.
   */
  async startCollector(): Promise<boolean> {
    if (this.isCollectorActive) return false;

    // Ensure MQTT client is connected
    await this.mqttClientService.connect();

    // Subscribe to sensor monitors
    await this.mqttClientService.subscribe(
      TOPICS.SENSOR_MONITORS,
      this.sensorsMonitorOnMessage.bind(this)
    );

    // Get crypto coins and publish to collector/start
    const result = await this.cryptoCoinService.get();
    const cryptoCoins = result.data.map(({ symbol, dataInterval }) => {
      const coinCode = `${symbol.toUpperCase()}${this.convertToCoin}`;
      return new CryptoCoinDetails(coinCode, dataInterval);
    });

    await this.mqttClientService.publish(
      TOPICS.COLLECTOR_START,
      JSON.stringify(cryptoCoins)
    );

    return true;
  }

  /**
   * Stops the collector by:
   * 1. Publishing to COLLECTOR_STOP.
   * 2. Clearing internal intervals.
   * 3. Ending the MQTT connection (optional).
   */
  async stopCollector(): Promise<boolean> {
    if (!this.isCollectorActive) return false;

    await this.mqttClientService.publish(TOPICS.COLLECTOR_STOP);

    // Clear intervals and mark collector as inactive
    this.clearCryptoCoinsMap();
    this.isCollectorActive = false;

    // Completely close the MQTT connection
    await this.mqttClientService.end();

    return true;
  }

  /**
   * Callback executed when a message arrives on SENSOR_MONITORS.
   */
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

    // Subscribe to sensors topic
    await this.mqttClientService.subscribe(
      `${TOPICS.DEFAULT_SENSORS}/${machine.machine_id}/#`,
      this.sensorsOnMessage.bind(this)
    );

    this.isCollectorActive = true;
  }

  /**
   * Handle sensors message
   */
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

    // Persist the new crypto coin price
    const lastCryptoCoinPrice = await this.saveNewCryptoCoinPrice(
      cryptoCoinId,
      payload
    );

    // Aggregated metrics
    const metrics = await this.cryptoCoinPriceService.getMetrics(cryptoCoinId);

    // Publish metrics
    await this.mqttClientService.publish(
      `${TOPICS.PROCESSED_DATA}/${cryptoCoinId.toString()}`,
      JSON.stringify({ lastCryptoCoinPrice, metrics })
    );

    await this.sendAlerts(lastCryptoCoinPrice);
  }

  private async sendAlerts(lastCryptoCoinPrice: ICryptoCoinPrice) {}

  /**
   * Map the sensors to the crypto coins in the database (updating their sensorId field).
   */
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

  /**
   * Build a map of cryptoCoins keyed by their sensor IDs, each with its own interval
   * for periodic tasks (alerts, logs, etc.).
   */
  private buildCryptoCoinsMap(cryptoCoins: (ICryptoCoin | null)[]) {
    this.clearCryptoCoinsMap();

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

  /**
   * Clears all intervals in the cryptoCoinsMap and sets it to undefined.
   */
  private clearCryptoCoinsMap() {
    if (this.cryptoCoinsMap) {
      Object.values(this.cryptoCoinsMap).forEach(({ interval }) => {
        if (interval) clearInterval(interval);
      });
    }
    this.cryptoCoinsMap = null;
  }

  /**
   * Re-schedule the alert interval whenever a new sensor reading arrives.
   */
  private updateCryptoCoinsMapInterval(sensorId: string) {
    if (!this.cryptoCoinsMap?.[sensorId]) {
      logger.warn(`Sensor ID "${sensorId}" not found in Map.`);
      return;
    }

    const { cryptoCoin } = this.cryptoCoinsMap[sensorId];

    // Clear the existing interval
    if (this.cryptoCoinsMap[sensorId].interval) {
      clearInterval(this.cryptoCoinsMap[sensorId].interval!);
    }

    // Set up a new interval
    this.cryptoCoinsMap[sensorId].interval = setInterval(
      this.sendAlert(cryptoCoin).bind(this),
      secondsToMilliSeconds(cryptoCoin.dataInterval) * this.intervalMultiplier
    );
  }

  /**
   * Simple placeholder for any periodic work. Replace this with your actual logic.
   */
  private sendAlert(cryptoCoin: ICryptoCoin) {
    return () => {
      console.log(`Alert for ${cryptoCoin.name}`);
    };
  }

  /**
   * Persists a new crypto coin price reading in the database.
   */
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
}
