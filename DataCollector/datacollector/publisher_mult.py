import threading
import time
import random
import queue
import requests
import paho.mqtt.client as mqtt

# MQTT Broker Configuration
BROKER = "localhost"
PORT = 1883
BASE_TOPIC = "crypto"
ADD_SENSOR_TOPIC = f"{BASE_TOPIC}/add_sensor"

# Shared queue for new tasks
task_queue = queue.Queue()


# Function to fetch cryptocurrency price from Binance
def fetch_crypto_price(coin):
    try:
        # Binance API expects symbols in the format "BTCUSDT", "ETHUSDT", etc.
        symbol = f"{coin.upper()}USDT"
        url = f"https://api.binance.com/api/v3/ticker/price?symbol={symbol}"
        response = requests.get(url)
        data = response.json()

        # Extract price from response
        price = data.get("price")
        if price:
            return round(float(price), 2)  # Format the price to 2 decimal places
        else:
            print(f"Error: Invalid response for {symbol}: {data}")
            return "N/A"
    except Exception as e:
        print(f"Error fetching data from Binance for {coin}: {e}")
        return "N/A"


# Worker thread function for publishing cryptocurrency prices
def sensor_worker(coin, interval):
    client = mqtt.Client()
    client.connect(BROKER, PORT, 60)

    while True:
        price = fetch_crypto_price(coin)
        message = f"{coin}: ${price}"
        print(f"Publishing: {message}")
        client.publish(f"{BASE_TOPIC}/{coin}", message)
        time.sleep(interval)

    client.disconnect()


# Subscriber function to listen for new coins
def mqtt_subscriber():
    def on_message(client, userdata, msg):
        coin = msg.payload.decode().strip()
        print(f"Received new coin: {coin}")
        task_queue.put(coin)  # Add new coin to task queue

    client = mqtt.Client()
    client.on_message = on_message
    client.connect(BROKER, PORT, 60)
    client.subscribe(ADD_SENSOR_TOPIC)
    print(f"Listening for new coins on topic: {ADD_SENSOR_TOPIC}")

    client.loop_forever()


# Task manager to dynamically create threads
def task_manager(interval):
    monitored_coins = set()
    threads = []

    while True:
        try:
            # Wait for new tasks in the queue
            coin = task_queue.get(block=True)
            if coin not in monitored_coins:
                print(f"Starting sensor for {coin}")
                thread = threading.Thread(
                    target=sensor_worker, args=(coin, interval), daemon=True
                )
                threads.append(thread)
                thread.start()
                monitored_coins.add(coin)
            else:
                print(f"{coin} is already being monitored.")
        except Exception as e:
            print(f"Task manager error: {e}")


# Main function
def main():
    interval = 5  # Interval in seconds for publishing data

    # Start MQTT subscriber thread
    subscriber_thread = threading.Thread(target=mqtt_subscriber, daemon=True)
    subscriber_thread.start()

    # Start task manager thread
    task_manager_thread = threading.Thread(
        target=task_manager, args=(interval,), daemon=True
    )
    task_manager_thread.start()

    subscriber_thread.join()
    task_manager_thread.join()


if __name__ == "__main__":
    main()
