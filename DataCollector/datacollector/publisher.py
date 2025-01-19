import json
import paho.mqtt.client as mqtt

# Define MQTT parameters
BROKER = "localhost"  # Public MQTT broker for testing
PORT = 1883  # Default MQTT port
TOPIC = "collector/start"  # Topic to publish to
MESSAGE = "Hello, MQTT!"  # Message to publish


def main():
    # Create an MQTT client instance
    client = mqtt.Client()

    try:
        # Connect to the broker
        print(f"Connecting to broker {BROKER} on port {PORT}...")
        client.connect(BROKER, PORT)

        # Publish a message to the specified topic
        print(f"Publishing message to topic '{TOPIC}': {MESSAGE}")
        message = [{ "symbol": "BTCUSDT", "interval": 5 }, { "symbol": "ETHUSDT", "interval": 5 }]
        client.publish(TOPIC, json.dumps(message))

        # Disconnect from the broker
        client.disconnect()
        print("Disconnected from broker.")

    except Exception as e:
        print(f"An error occurred: {e}")


if __name__ == "__main__":
    main()
