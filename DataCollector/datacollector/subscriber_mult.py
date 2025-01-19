# import time
# import asyncio
# import paho.mqtt.client as mqtt

# # MQTT Broker Configuration
# BROKER = "localhost"  # Replace with your broker address if needed
# PORT = 1883
# TOPIC = "crypto/#"  # Subscribe to all cryptocurrency topics


# # Callback when the client successfully connects to the broker
# def on_connect(client, userdata, flags, rc):
#     if rc == 0:
#         print("Connected to broker successfully!")
#         # Subscribe to the topic
#         client.subscribe(TOPIC)
#         print(f"Subscribed to topic: {TOPIC}")
#     else:
#         print(f"Failed to connect, return code {rc}")


# # Callback when a message is received
# def on_message(client, userdata, msg):
#     print(msg.payload.decode())
#     time.sleep(15)
    


# def main():
#     # Create an MQTT client instance
#     client = mqtt.Client()

#     # Assign callbacks
#     client.on_connect = on_connect
#     client.on_message = on_message

#     try:
#         # Connect to the MQTT broker
#         print(f"Connecting to broker {BROKER}:{PORT}...")
#         client.connect_async(BROKER, PORT, 60)

#         # Start the network loop to listen for messages
#         client.loop_forever()

#     except Exception as e:
#         print(f"An error occurred: {e}")


# if __name__ == "__main__":
#     main()
from concurrent.futures import ThreadPoolExecutor
import paho.mqtt.client as mqtt

# MQTT Broker Configuration
BROKER = "localhost"
PORT = 1883
TOPIC = "crypto/#"

# Create a thread pool
executor = ThreadPoolExecutor(max_workers=5)

# Non-blocking message handler
def handle_message(topic, payload):
    print(payload)
    # Simulate a time-consuming task
    import time
    time.sleep(2)
    print(f"Finished processing message: {payload}")

# Callback for when a message is received
def on_message(client, userdata, msg):
    print(msg.payload.decode())
    # Offload processing to the thread pool
    executor.submit(handle_message, msg.topic, msg.payload.decode())

# Main function
def main():
    client = mqtt.Client()
    client.on_message = on_message

    client.connect(BROKER, PORT, 60)
    client.subscribe(TOPIC)

    client.loop_forever()

if __name__ == "__main__":
    main()
