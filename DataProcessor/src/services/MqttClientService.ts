import { Service } from "typedi";
import mqtt, {
  IClientOptions,
  IClientPublishOptions,
  IClientReconnectOptions,
  IClientSubscribeOptions,
  IClientSubscribeProperties,
  OnMessageCallback,
} from "mqtt";
import { env } from "../config/envSchema";

@Service()
export class MqttClientService {
  constructor() {}

  async sendMessage(
    topic: string,
    message: string = "",
    connOptions: IClientOptions = {},
    pubOptions: IClientPublishOptions = {}
  ): Promise<void> {
    const client = await mqtt.connectAsync({
      ...connOptions,
      host: env.MQTT_HOST,
      port: env.MQTT_PORT,
    });
    await client.publishAsync(topic, message, pubOptions);
    await client.endAsync();
  }

  async subscribe(
    topic: string,
    onMessage: OnMessageCallback,
    connOptions: IClientOptions = {},
    subOptions: IClientSubscribeOptions | IClientSubscribeProperties = {}
  ) {
    const client = await mqtt.connectAsync({
      ...connOptions,
      host: env.MQTT_HOST,
      port: env.MQTT_PORT,
    });

    await client.subscribeAsync(topic, subOptions);

    client.on("message", onMessage);

    return client;
  }
}
