import paho.mqtt.client as mqtt

# Define MQTT parameters
BROKER = "localhost"  # Public MQTT broker for testing
PORT = 1883  # Default MQTT port
TOPIC = "collector"  # Topic to subscribe to


# Callback when the client connects to the broker
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("Connected to broker successfully!")
        # Subscribe to the topic
        client.subscribe(TOPIC)
        print(f"Subscribed to topic: {TOPIC}")
    else:
        print(f"Failed to connect, return code {rc}")


# Callback when a message is received
def on_message(client, userdata, msg):
    print(f"Message received: Topic = {msg.topic}, Payload = {msg.payload.decode()}")


def main():
    # Create an MQTT client instance
    client = mqtt.Client()

    # Assign the callback functions
    client.on_connect = on_connect
    client.on_message = on_message

    try:
        # Connect to the broker
        print(f"Connecting to broker {BROKER} on port {PORT}...")
        client.connect(BROKER, PORT)

        # Start the loop to process network traffic and dispatch callbacks
        print("Listening for messages...")
        client.loop_forever()  # Keeps the script running to receive messages

    except Exception as e:
        print(f"An error occurred: {e}")


if __name__ == "__main__":
    main()
