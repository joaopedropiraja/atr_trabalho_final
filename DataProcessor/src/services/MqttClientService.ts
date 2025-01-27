import { Service } from "typedi";
import mqttMatch from "mqtt-match";
import mqtt, {
  IClientOptions,
  IClientPublishOptions,
  IClientSubscribeOptions,
  IClientSubscribeProperties,
  IPublishPacket,
  MqttClient,
  OnMessageCallback,
} from "mqtt";
import { env } from "../config/envSchema";

@Service()
export class MqttClientService {
  private client: MqttClient | null = null;

  /**
   * A record of topics subscribed to this client.
   * Each topic can have multiple callbacks.
   */
  private subscriptions: Record<string, OnMessageCallback[]> = {};

  /**
   * Creates (and caches) a single MQTT client connection, if one does not already exist.
   */
  async connect(connOptions: IClientOptions = {}): Promise<void> {
    // Client is already connected
    if (!!this.client) return;

    this.client = await mqtt.connectAsync({
      ...connOptions,
      host: env.MQTT_HOST,
      port: env.MQTT_PORT,
    });

    // Attach a single 'message' listener for all subscribed topics.
    this.client.on(
      "message",
      (receivedTopic: string, payload: Buffer, packet: IPublishPacket) => {
        this.handleIncomingMessage(receivedTopic, payload, packet);
      }
    );
  }

  /**
   * Helper to distribute incoming messages to all matching topic callbacks.
   */
  private handleIncomingMessage(
    receivedTopic: string,
    payload: Buffer,
    packet: IPublishPacket
  ) {
    // Check all subscribed topics to see which ones match this 'receivedTopic'
    for (const [subTopic, callbacks] of Object.entries(this.subscriptions)) {
      if (this.matchesTopic(subTopic, receivedTopic)) {
        callbacks.forEach((cb) => cb(receivedTopic, payload, packet));
      }
    }
  }

  /**
   * Publish a message to a specific topic, reusing the existing client connection.
   */
  async publish(
    topic: string,
    message: string = "",
    pubOptions: IClientPublishOptions = {}
  ): Promise<void> {
    if (!this.client) {
      throw new Error("MQTT client is not connected. Call 'connect()' first.");
    }
    await this.client.publishAsync(topic, message, pubOptions);
  }

  /**
   * Subscribe to a topic (supports wildcards).
   * We store the callback in this.subscriptions so multiple subscriptions can coexist.
   */
  async subscribe(
    topic: string,
    onMessage: OnMessageCallback,
    subOptions: IClientSubscribeOptions | IClientSubscribeProperties = {}
  ): Promise<void> {
    if (!this.client) {
      throw new Error("MQTT client is not connected. Call 'connect()' first.");
    }

    // If this is the first time we're subscribing to this topic, actually subscribe via the client.
    if (!this.subscriptions[topic]) {
      await this.client.subscribeAsync(topic, subOptions);
      this.subscriptions[topic] = [];
    }

    // Push the new callback into the array of callbacks for this topic.
    this.subscriptions[topic].push(onMessage);
  }

  /**
   * Unsubscribe from a topic. If a callback is provided, remove that callback only.
   * Otherwise, remove all callbacks for that topic.
   */
  async unsubscribe(
    topic: string,
    onMessage?: OnMessageCallback
  ): Promise<void> {
    if (!this.client) {
      return;
    }

    // If we have no record of this topic in subscriptions, do nothing.
    if (!this.subscriptions[topic]) {
      return;
    }

    if (onMessage) {
      // Filter out the specific callback.
      this.subscriptions[topic] = this.subscriptions[topic].filter(
        (cb) => cb !== onMessage
      );
    } else {
      // Clear all callbacks for this topic
      this.subscriptions[topic] = [];
    }

    // If no callbacks remain for this topic, unsubscribe at the MQTT client level
    if (this.subscriptions[topic].length === 0) {
      delete this.subscriptions[topic];
      await this.client.unsubscribeAsync(topic);
    }
  }

  /**
   * Terminate the MQTT connection and clear all subscriptions.
   */
  async end(): Promise<void> {
    if (this.client) {
      await this.client.endAsync();
      this.client = null;
      this.subscriptions = {};
    }
  }

  private matchesTopic(
    subscribedTopic: string,
    receivedTopic: string
  ): boolean {
    return mqttMatch(subscribedTopic, receivedTopic);
  }
}
