import os
import time
import uuid
import requests
import json
from datetime import datetime, timezone
import threading
from enum import Enum
from typing import Any
from pydantic import BaseModel, Field
from pydantic_core import from_json
import paho.mqtt.client as mqtt
from concurrent.futures import ThreadPoolExecutor

class SensorConfig(BaseModel):
    id: uuid.UUID = Field(default_factory=uuid.uuid4)
    code: str
    data_interval: int = Field(default=5)

class COLLECTOR_TOPIC(str, Enum):
    START = "start"
    STOP = "stop"

class DataCollector:
    def __init__(
        self,
        machine_id: str,
        broker: str,
        port: int,
        sensor_monitors_interval: int = 30,
    ) -> None:
        self.machine_id = machine_id
        self.broker = broker
        self.port = port
        self.collector_topic = "collector/#"
        self.sensor_monitors_topic = "sensor_monitors"
        self.sensor_monitors_interval = sensor_monitors_interval
        self.sensors_default_topic = f"sensors/{machine_id}"

        max_workers = (os.cpu_count() or 1) * 5
        self.thread_pool = ThreadPoolExecutor(max_workers)
        self.thread_event_flag = threading.Event()

        self.invalid_price = "N/A"

    def connect(self):
        client = mqtt.Client()

        client.on_connect = self.__on_connect
        client.on_message = self.__collector_topic_on_message

        client.connect(self.broker, self.port)
        client.subscribe(self.collector_topic)
        client.loop_forever()

    def __collector_topic_on_message(
        self, client: mqtt.Client, user_data: Any, message: mqtt.MQTTMessage
    ):
        splitted_topic = message.topic.split("/")
        if len(splitted_topic) != 2:
            return

        sub_topic = splitted_topic[1]
        match sub_topic:
            case COLLECTOR_TOPIC.START.value:
                self.__handle_start(message)
            case COLLECTOR_TOPIC.STOP.value:
                self.__handle_stop()
            case _:
                print(f"Invalid subtopic for topic {self.collector_topic}")

    def __handle_start(self, message: mqtt.MQTTMessage):
        if self.thread_event_flag.is_set():
            return
        self.thread_event_flag.set()

        payload = from_json(message.payload.decode(), allow_partial=True)
        if not isinstance(payload, list):
            print(f"Invalid payload for the topic {self.collector_topic}")
            return

        configs = [SensorConfig.model_validate(c) for c in payload]
        self.thread_pool.submit(self.__sensors_monitor, (configs))

        for idx, config in enumerate(configs):
            self.thread_pool.submit(self.__sensor_worker, config, idx)

    def __handle_stop(self):
        if not self.thread_event_flag.is_set():
            return

        self.thread_event_flag.clear()

    def __sensors_monitor(self, configs: list[SensorConfig]):
        client = mqtt.Client()
        client.connect(self.broker, self.port)

        sensors = [
            {
                "code": c.code, 
                "sensor_id": str(c.id), 
                "data_type": "float", 
                "data_interval": c.data_interval
            }
            for c in configs
        ]
        message = {"machine_id": self.machine_id, "sensors": sensors}

        while self.thread_event_flag.is_set():
            client.publish(self.sensor_monitors_topic, json.dumps(message))
            time.sleep(self.sensor_monitors_interval)

        client.disconnect()

    def __sensor_worker(self, crypto_config: SensorConfig, idx):
        time.sleep(idx)

        client = mqtt.Client()
        client.connect(self.broker, self.port)
        topic = f"{self.sensors_default_topic}/{crypto_config.id}"

        while self.thread_event_flag.is_set():
            price = self.__fetch_crypto_price(crypto_config.code)
            if price == self.invalid_price:
                return
            
            timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
            message = {"timestamp": timestamp, "value": price}

            print(message)
            client.publish(topic, json.dumps(message))
            time.sleep(crypto_config.data_interval)

        client.disconnect()

    def __fetch_crypto_price(self, code: str):
        try:
            url = f"https://api.binance.com/api/v3/ticker/price?symbol={code}"
            response = requests.get(url)

            data = response.json()
            price = data.get("price")
            if price:
                return round(float(price), 2)
            else:
                print(f"Error: Invalid response for {code}: {data}")
                return self.invalid_price
        except Exception as e:
            print(f'Error fetching data from Binance for "{code}": {e}')
            return self.invalid_price

    def __on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            print("Connected to MQTT Broker!")
        else:
            print("Failed to connect, return code %d\n", rc)
