"""Konfigurasi aplikasi, dibaca dari environment variable.

Sengaja tidak memakai pydantic-settings supaya dependensi tetap ramping.
"""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path
from zoneinfo import ZoneInfo

BASE_DIR = Path(__file__).resolve().parent.parent
WIB = ZoneInfo("Asia/Jakarta")


def _env(name: str, default: str = "") -> str:
    return os.environ.get(name, default).strip()


def _env_int(name: str, default: int) -> int:
    raw = _env(name)
    try:
        return int(raw) if raw else default
    except ValueError:
        return default


def _env_list(name: str, default: list[str]) -> list[str]:
    raw = _env(name)
    if not raw:
        return default
    return [item.strip() for item in raw.split(",") if item.strip()]


@dataclass(frozen=True)
class Settings:
    # Urutan provider yang dicoba. Provider yang tidak terkonfigurasi akan dilewati.
    providers: list[str] = field(
        default_factory=lambda: _env_list("PROVIDERS", ["kci", "comuline", "snapshot"])
    )

    # KAI Commuter (resmi). Hanya aktif kalau token diisi.
    kci_base_url: str = field(
        default_factory=lambda: _env("KCI_API_BASE", "https://api-partner.krl.co.id/krl-webs/v1")
    )
    kci_token: str = field(default_factory=lambda: _env("KCI_API_TOKEN"))

    # Comuline — mirror publik data jadwal KAI Commuter.
    comuline_base_url: str = field(
        default_factory=lambda: _env("COMULINE_API_BASE", "https://api.comuline.com/v1")
    )

    snapshot_dir: Path = field(
        default_factory=lambda: Path(_env("SNAPSHOT_DIR") or BASE_DIR / "data" / "snapshot")
    )

    http_timeout: float = field(default_factory=lambda: float(_env_int("HTTP_TIMEOUT", 12)))
    schedule_ttl: int = field(default_factory=lambda: _env_int("SCHEDULE_TTL", 300))
    station_ttl: int = field(default_factory=lambda: _env_int("STATION_TTL", 21600))
    route_ttl: int = field(default_factory=lambda: _env_int("ROUTE_TTL", 1800))

    cors_origins: list[str] = field(
        default_factory=lambda: _env_list("CORS_ORIGINS", ["*"])
    )

    user_agent: str = (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:132.0) Gecko/20100101 Firefox/132.0"
    )


settings = Settings()
