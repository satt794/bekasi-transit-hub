"""Kontrak umum untuk semua sumber data (provider) jadwal KRL."""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass

from app.models import RawDeparture, RawStop, Station


class ProviderError(Exception):
    """Dilempar saat provider gagal mengambil atau mem-parsing data."""


@dataclass
class RouteResult:
    line: str | None
    color: str | None
    stops: list[RawStop]
    partial: bool = False


class Provider(ABC):
    #: Nama singkat, dipakai di env PROVIDERS dan di respons API.
    name: str = "base"
    description: str = ""

    @property
    def enabled(self) -> bool:
        return True

    @abstractmethod
    async def fetch_stations(self) -> list[Station]:
        """Seluruh stasiun KRL yang dikenal sumber ini."""

    @abstractmethod
    async def fetch_schedule(self, station_id: str) -> list[RawDeparture]:
        """Jadwal harian lengkap untuk satu stasiun."""

    @abstractmethod
    async def fetch_route(self, train_id: str) -> RouteResult | None:
        """Daftar pemberhentian satu perjalanan kereta. None kalau tidak ditemukan."""

    async def aclose(self) -> None:  # pragma: no cover - default no-op
        return None
