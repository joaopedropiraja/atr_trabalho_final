from src.Settings import Settings
from src.DataCollector import DataCollector


def main():

    settings = Settings()
    agent = DataCollector(
        username=settings.MQTT_USERNAME,
        password=settings.MQTT_PASSWORD,
        machine_id=settings.MACHINE_ID,
        broker=settings.BROKER,
        port=settings.PORT,
    )

    agent.connect()


if __name__ == "__main__":
    main()
