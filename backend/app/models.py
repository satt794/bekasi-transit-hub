"""Skema data yang dikirim API ke frontend.

Semua waktu dikirim sebagai ISO-8601 dengan offset +07:00 (WIB) agar frontend
tidak perlu menebak zona waktu.
"""

from __future__ import annotations

from datetime import datetime, time
from typing import Literal

from pydantic import BaseModel, Field

Direction = Literal["jakarta", "cikarang"]


class Station(BaseModel):
    id: str = Field(description="Kode stasiun KAI, mis. BKS")
    name: str = Field(description="Nama tampilan, mis. Bekasi Timur")
    region: str | None = Field(default=None, description="Kota/Kabupaten untuk stasiun Bekasi")
    is_bekasi: bool = False
    order: int | None = Field(default=None, description="Urutan pada koridor Bekasi")


# ---------------------------------------------------------------------------
# Representasi mentah hasil scraping (sebelum ditempel ke tanggal hari ini)
# ---------------------------------------------------------------------------


class RawDeparture(BaseModel):
    """Satu baris jadwal dari sumber, waktu masih berupa jam (tanpa tanggal)."""

    train_id: str
    line: str
    origin_id: str | None
    origin_name: str
    destination_id: str | None
    destination_name: str
    departs: time
    arrives: time | None = None
    color: str | None = None


class RawStop(BaseModel):
    station_id: str
    station_name: str
    departs: time


# ---------------------------------------------------------------------------
# Payload API
# ---------------------------------------------------------------------------


class Departure(BaseModel):
    train_id: str
    line: str
    origin_id: str | None
    origin_name: str
    destination_id: str | None
    destination_name: str
    departs_at: datetime
    arrives_at: datetime | None
    direction: Direction
    color: str
    is_passenger: bool


class SourceInfo(BaseModel):
    provider: str = Field(description="Provider yang berhasil menyajikan data")
    fetched_at: datetime
    cached: bool
    stale: bool = Field(
        default=False, description="True kalau data berasal dari snapshot / cache kedaluwarsa"
    )
    attempts: list[ProviderAttempt] = []


class ProviderAttempt(BaseModel):
    provider: str
    ok: bool
    latency_ms: int | None = None
    error: str | None = None


class HourBucket(BaseModel):
    hour: int
    count: int


class StationSummary(BaseModel):
    total_trips: int
    first_departure: datetime | None
    last_departure: datetime | None
    trips_next_hour: int
    avg_headway_min: float | None = Field(
        description="Rata-rata selang antar kereta (menit) dalam 60 menit ke depan"
    )
    per_hour: list[HourBucket]


class DeparturesResponse(BaseModel):
    station: Station
    generated_at: datetime
    source: SourceInfo
    summary: StationSummary
    departures: dict[Direction, list[Departure]]


class TimetableResponse(BaseModel):
    station: Station
    generated_at: datetime
    source: SourceInfo
    departures: list[Departure]


class RouteStop(BaseModel):
    station_id: str
    station_name: str
    departs_at: datetime
    status: Literal["passed", "next", "upcoming"]
    is_bekasi: bool


class TrainRouteResponse(BaseModel):
    train_id: str
    line: str | None
    color: str
    generated_at: datetime
    source: SourceInfo
    partial: bool = Field(description="True kalau rute hanya mencakup stasiun yang ada di snapshot")
    stops: list[RouteStop]


class Trip(BaseModel):
    train_id: str
    line: str
    destination_name: str
    color: str
    departs_at: datetime
    arrives_at: datetime
    duration_min: int


class TripsResponse(BaseModel):
    origin: Station
    destination: Station
    generated_at: datetime
    source: SourceInfo
    trips: list[Trip]


class StationsResponse(BaseModel):
    generated_at: datetime
    source: SourceInfo
    bekasi: list[Station]
    all: list[Station]


class HealthResponse(BaseModel):
    status: Literal["ok"]
    version: str
    providers: list[ProviderStatus]
    time: datetime


class ProviderStatus(BaseModel):
    name: str
    enabled: bool
    description: str


# ---------------------------------------------------------------------------
# Transjakarta & Feeder Bus Multi-Modal
# ---------------------------------------------------------------------------


class TransjakartaRoute(BaseModel):
    route_id: str = Field(description="Kode rute, misal B11, 11, TP1")
    name: str = Field(description="Nama rute, misal Summarecon Bekasi ⇄ Tosari")
    corridor: str
    service_type: Literal["BRT", "Non-BRT", "Trans Patriot", "Royaltrans"]
    color: str
    fare: int
    operational_hours: str
    headway_min: int
    connecting_stations: list[str] = []
    stops: list[str] = []
    description: str


class StationBusIntegration(BaseModel):
    station_id: str
    station_name: str
    nearest_bus_stop: str
    distance_m: int
    walking_time_min: int
    transfer_guide: str
    routes: list[TransjakartaRoute] = []


class TransjakartaResponse(BaseModel):
    generated_at: datetime
    routes: list[TransjakartaRoute]
    total_routes: int


class StationTransitHubResponse(BaseModel):
    station: Station
    generated_at: datetime
    integration: StationBusIntegration


SourceInfo.model_rebuild()
HealthResponse.model_rebuild()
StationTransitHubResponse.model_rebuild()
