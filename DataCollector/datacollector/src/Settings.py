from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        case_sensitive=False, env_file=".env", env_file_encoding="utf-8"
    )

    MACHINE_ID: str = "example_machine_id"
    BROKER: str = "localhost"
    PORT: int = 1883

