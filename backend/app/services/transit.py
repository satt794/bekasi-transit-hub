"""Logika inti: rantai provider + cache, normalisasi, dan perhitungan jadwal.

Sumber data hanya memberi *jam* keberangkatan (jadwal harian). Service ini yang
menempelkan jam tersebut ke tanggal operasional yang tepat, lalu menghitung
keberangkatan berikutnya, rute kereta, ringkasan, dan pencarian perjalanan.

Hari operasional KRL dianggap dimulai pukul 03:00 WIB, sehingga kereta pukul
00:19 tetap dihitung milik "hari ini" dan tampil setelah kereta pukul 23:50.
"""

from __future__ import annotations

import logging
from collections import Counter
from collections.abc import Awaitable, Callable
from dataclasses import dataclass
from datetime import date, datetime, time, timedelta
from time import perf_counter
from typing import Any, Generic, TypeVar

from app.cache import TTLCache
from app.config import WIB, settings
from app.models import (
    Departure,
    DeparturesResponse,
    HourBucket,
    ProviderAttempt,
    RawDeparture,
    RouteStop,
    SourceInfo,
    Station,
    StationsResponse,
    StationSummary,
    TimetableResponse,
    TrainRouteResponse,
    Trip,
    TripsResponse,
)
from app.scrapers import Provider, ProviderError, RouteResult
from app.stations import (
    BEKASI_IDS,
    BEKASI_STATIONS,
    KNOWN_NAMES,
    PLATFORM_GUIDES,
    bekasi_station,
    direction_for,
    display_name,
    name_key,
    platform_for,
)

log = logging.getLogger(__name__)

T = TypeVar("T")

SERVICE_DAY_START = time(3, 0)
DEFAULT_COLOR = "#0084D8"  # warna resmi Commuter Line Cikarang
SNAPSHOT_TTL = 60  # kalau jatuh ke snapshot, coba sumber online lagi lebih cepat


class StationNotFound(Exception):
    pass


class TrainNotFound(Exception):
    pass


class AllProvidersFailed(Exception):
    def __init__(self, attempts: list[ProviderAttempt]) -> None:
        self.attempts = attempts
        detail = "; ".join(f"{a.provider}: {a.error}" for a in attempts)
        super().__init__(f"Semua sumber data gagal ({detail})")


@dataclass
class Sourced(Generic[T]):
    value: T
    source: SourceInfo


# ---------------------------------------------------------------------------
# Helper waktu
# ---------------------------------------------------------------------------


def now_wib() -> datetime:
    return datetime.now(WIB)


def current_service_day(now: datetime) -> date:
    return (now.astimezone(WIB) - timedelta(hours=SERVICE_DAY_START.hour)).date()


def service_datetime(service_day: date, clock: time) -> datetime:
    day = service_day + timedelta(days=1) if clock < SERVICE_DAY_START else service_day
    return datetime.combine(day, clock, tzinfo=WIB)


def pretty_line(raw: str) -> str:
    upper = raw.upper()
    if "DINAS" in upper or "TIDAK ANGKUT" in upper:
        return "Dinas · tidak angkut penumpang"
    return display_name(raw) if raw else "Commuter Line"


def is_passenger(raw_line: str) -> bool:
    upper = raw_line.upper()
    return not ("DINAS" in upper or "TIDAK ANGKUT" in upper)


# ---------------------------------------------------------------------------
# Service
# ---------------------------------------------------------------------------


class TransitService:
    def __init__(self, providers: list[Provider], cache: TTLCache | None = None) -> None:
        self.providers = providers
        self.cache = cache or TTLCache()

    # -- rantai provider -----------------------------------------------------

    async def _fetch(
        self,
        key: str,
        ttl: int,
        op: Callable[[Provider], Awaitable[Any]],
    ) -> Sourced[Any]:
        entry = self.cache.get(key)
        if entry and entry.fresh:
            value, info = entry.value
            return Sourced(value, info.model_copy(update={"cached": True}))

        async with self.cache.lock(key):
            entry = self.cache.get(key)
            if entry and entry.fresh:
                value, info = entry.value
                return Sourced(value, info.model_copy(update={"cached": True}))

            attempts: list[ProviderAttempt] = []
            empty: tuple[Any, str] | None = None

            for provider in self.providers:
                if not provider.enabled:
                    attempts.append(
                        ProviderAttempt(provider=provider.name, ok=False, error="nonaktif")
                    )
                    continue
                started = perf_counter()
                try:
                    value = await op(provider)
                except ProviderError as exc:
                    attempts.append(self._attempt(provider, started, error=str(exc)))
                    continue
                except Exception as exc:  # noqa: BLE001 - jangan biarkan satu sumber merusak API
                    log.exception("provider %s error tak terduga", provider.name)
                    attempts.append(self._attempt(provider, started, error=repr(exc)))
                    continue

                if value is None or value == []:
                    attempts.append(self._attempt(provider, started, error="data kosong"))
                    empty = empty or (value, provider.name)
                    continue

                attempts.append(self._attempt(provider, started))
                is_snapshot = provider.name == "snapshot"
                info = SourceInfo(
                    provider=provider.name,
                    fetched_at=now_wib(),
                    cached=False,
                    stale=is_snapshot,
                    attempts=attempts,
                )
                self.cache.set(key, (value, info), SNAPSHOT_TTL if is_snapshot else ttl)
                return Sourced(value, info)

            if entry is not None:
                value, info = entry.value
                log.warning("menyajikan cache kedaluwarsa untuk %s", key)
                return Sourced(
                    value,
                    info.model_copy(update={"cached": True, "stale": True, "attempts": attempts}),
                )
            if empty is not None:
                value, provider_name = empty
                info = SourceInfo(
                    provider=provider_name, fetched_at=now_wib(), cached=False, attempts=attempts
                )
                return Sourced(value, info)
            raise AllProvidersFailed(attempts)

    @staticmethod
    def _attempt(provider: Provider, started: float, error: str | None = None) -> ProviderAttempt:
        return ProviderAttempt(
            provider=provider.name,
            ok=error is None,
            latency_ms=round((perf_counter() - started) * 1000),
            error=error,
        )

    # -- direktori stasiun --------------------------------------------------

    async def _stations(self) -> Sourced[list[Station]]:
        return await self._fetch("stations", settings.station_ttl, lambda p: p.fetch_stations())

    async def _directory(self) -> dict[str, Station]:
        """Peta id → Station. Tidak pernah gagal; jatuh ke data statis kalau perlu."""
        directory: dict[str, Station] = {
            sid: Station(id=sid, name=name, platform_guide=PLATFORM_GUIDES.get(sid))
            for sid, name in KNOWN_NAMES.items()
        }
        try:
            for station in (await self._stations()).value:
                if not station.platform_guide and station.id in PLATFORM_GUIDES:
                    station = station.model_copy(
                        update={"platform_guide": PLATFORM_GUIDES[station.id]}
                    )
                directory[station.id] = station
        except AllProvidersFailed:
            pass
        for station in BEKASI_STATIONS:
            directory[station.id] = station
        return directory

    async def list_stations(self) -> StationsResponse:
        sourced = await self._stations()
        directory = await self._directory()
        all_stations = sorted(directory.values(), key=lambda s: s.name)
        return StationsResponse(
            generated_at=now_wib(),
            source=sourced.source,
            bekasi=BEKASI_STATIONS,
            all=all_stations,
        )

    async def station(self, station_id: str) -> Station:
        station_id = station_id.upper()
        found = bekasi_station(station_id) or (await self._directory()).get(station_id)
        if found is None:
            raise StationNotFound(station_id)
        return found

    # -- normalisasi --------------------------------------------------------

    @staticmethod
    def _resolve(
        raw_id: str | None, raw_name: str, directory: dict[str, Station], by_key: dict[str, str]
    ) -> tuple[str | None, str]:
        station_id = raw_id or by_key.get(name_key(raw_name))
        if station_id and station_id in directory:
            return station_id, directory[station_id].name
        return station_id, display_name(raw_name) if raw_name else (station_id or "—")

    def _to_departure(
        self,
        raw: RawDeparture,
        here: str,
        day: date,
        directory: dict[str, Station],
        by_key: dict[str, str],
    ) -> Departure:
        origin_id, origin_name = self._resolve(raw.origin_id, raw.origin_name, directory, by_key)
        dest_id, dest_name = self._resolve(
            raw.destination_id, raw.destination_name, directory, by_key
        )
        departs_at = service_datetime(day, raw.departs)
        arrives_at = service_datetime(day, raw.arrives) if raw.arrives else None
        if arrives_at and arrives_at < departs_at:
            arrives_at += timedelta(days=1)
        dir_val = direction_for(here, dest_id)
        platform = platform_for(here, dir_val, raw.train_id)
        return Departure(
            train_id=raw.train_id,
            line=pretty_line(raw.line),
            origin_id=origin_id,
            origin_name=origin_name,
            destination_id=dest_id,
            destination_name=dest_name,
            departs_at=departs_at,
            arrives_at=arrives_at,
            direction=dir_val,  # type: ignore[arg-type]
            platform=platform,
            color=raw.color or DEFAULT_COLOR,
            is_passenger=is_passenger(raw.line),
        )

    async def _schedule(self, station_id: str) -> Sourced[list[RawDeparture]]:
        return await self._fetch(
            f"schedule:{station_id}",
            settings.schedule_ttl,
            lambda p: p.fetch_schedule(station_id),
        )

    async def _dated(self, station_id: str, days: list[date]) -> tuple[list[Departure], SourceInfo]:
        sourced = await self._schedule(station_id)
        directory = await self._directory()
        by_key = {name_key(s.name): s.id for s in directory.values()}
        items: list[Departure] = []
        for day in days:
            for raw in sourced.value:
                dep = self._to_departure(raw, station_id, day, directory, by_key)
                # Kereta yang berakhir di stasiun ini bukan keberangkatan.
                if dep.destination_id == station_id:
                    continue
                items.append(dep)
        items.sort(key=lambda d: (d.departs_at, d.train_id))
        return items, sourced.source

    # -- endpoint ------------------------------------------------------------

    async def departures(
        self,
        station_id: str,
        now: datetime | None = None,
        limit: int = 8,
        include_non_passenger: bool = False,
    ) -> DeparturesResponse:
        now = now or now_wib()
        station = await self.station(station_id)
        sd = current_service_day(now)
        items, source = await self._dated(
            station.id, [sd - timedelta(days=1), sd, sd + timedelta(days=1)]
        )

        visible = [d for d in items if include_non_passenger or d.is_passenger]
        upcoming = [d for d in visible if d.departs_at >= now - timedelta(seconds=30)]
        grouped: dict[str, list[Departure]] = {"jakarta": [], "cikarang": []}
        for dep in upcoming:
            bucket = grouped[dep.direction]
            if len(bucket) < limit:
                bucket.append(dep)

        today = [d for d in visible if current_service_day(d.departs_at) == sd]
        return DeparturesResponse(
            station=station,
            generated_at=now,
            source=source,
            summary=self._summary(today, upcoming, now),
            departures=grouped,  # type: ignore[arg-type]
        )

    @staticmethod
    def _summary(
        today: list[Departure], upcoming: list[Departure], now: datetime
    ) -> StationSummary:
        horizon = now + timedelta(hours=1)
        next_hour = [d for d in upcoming if d.departs_at <= horizon]
        headway = None
        if len(next_hour) >= 2:
            gaps = [
                (b.departs_at - a.departs_at).total_seconds() / 60
                for a, b in zip(next_hour, next_hour[1:], strict=False)
            ]
            headway = round(sum(gaps) / len(gaps), 1)

        counts = Counter(d.departs_at.astimezone(WIB).hour for d in today)
        service_hours = list(range(SERVICE_DAY_START.hour, 24)) + list(
            range(0, SERVICE_DAY_START.hour)
        )
        active = [h for h in service_hours if counts.get(h)]
        if active:
            start, end = service_hours.index(active[0]), service_hours.index(active[-1])
            per_hour = [
                HourBucket(hour=h, count=counts.get(h, 0)) for h in service_hours[start : end + 1]
            ]
        else:
            per_hour = []

        return StationSummary(
            total_trips=len(today),
            first_departure=today[0].departs_at if today else None,
            last_departure=today[-1].departs_at if today else None,
            trips_next_hour=len(next_hour),
            avg_headway_min=headway,
            per_hour=per_hour,
        )

    async def timetable(self, station_id: str, now: datetime | None = None) -> TimetableResponse:
        now = now or now_wib()
        station = await self.station(station_id)
        items, source = await self._dated(station.id, [current_service_day(now)])
        return TimetableResponse(station=station, generated_at=now, source=source, departures=items)

    async def route(self, train_id: str, now: datetime | None = None) -> TrainRouteResponse:
        now = now or now_wib()
        train_id = train_id.upper()
        try:
            sourced = await self._fetch(
                f"route:{train_id}", settings.route_ttl, lambda p: p.fetch_route(train_id)
            )
        except AllProvidersFailed:
            raise
        result: RouteResult | None = sourced.value
        if not result or not result.stops:
            raise TrainNotFound(train_id)

        sd = current_service_day(now)
        chosen: list[tuple[datetime, Any]] = []
        for day in (sd - timedelta(days=1), sd, sd + timedelta(days=1)):
            dated = sorted(
                ((service_datetime(day, s.departs), s) for s in result.stops), key=lambda x: x[0]
            )
            chosen = dated
            # Pilih perjalanan pertama yang belum selesai (toleransi 15 menit).
            if dated[-1][0] + timedelta(minutes=15) >= now:
                break

        stops: list[RouteStop] = []
        next_marked = False
        for departs_at, stop in chosen:
            if departs_at < now:
                status = "passed"
            elif not next_marked:
                status, next_marked = "next", True
            else:
                status = "upcoming"
            stops.append(
                RouteStop(
                    station_id=stop.station_id,
                    station_name=stop.station_name,
                    departs_at=departs_at,
                    status=status,  # type: ignore[arg-type]
                    is_bekasi=stop.station_id in BEKASI_IDS,
                )
            )

        return TrainRouteResponse(
            train_id=train_id,
            line=pretty_line(result.line) if result.line else None,
            color=result.color or DEFAULT_COLOR,
            generated_at=now,
            source=sourced.source,
            partial=result.partial,
            stops=stops,
        )

    async def trips(
        self,
        origin_id: str,
        destination_id: str,
        now: datetime | None = None,
        limit: int = 10,
    ) -> TripsResponse:
        now = now or now_wib()
        origin = await self.station(origin_id)
        destination = await self.station(destination_id)
        if origin.id == destination.id:
            raise ValueError("Stasiun asal dan tujuan tidak boleh sama")

        a = await self._schedule(origin.id)
        b = await self._schedule(destination.id)
        directory = await self._directory()
        by_key = {name_key(s.name): s.id for s in directory.values()}
        at_destination = {raw.train_id: raw for raw in b.value}

        sd = current_service_day(now)
        trips: list[Trip] = []
        for day in (sd - timedelta(days=1), sd, sd + timedelta(days=1)):
            for raw in a.value:
                other = at_destination.get(raw.train_id)
                if other is None or not is_passenger(raw.line):
                    continue
                departs_at = service_datetime(day, raw.departs)
                arrives_at = service_datetime(day, other.departs)
                duration = arrives_at - departs_at
                # Kereta melintas ke arah sebaliknya, atau data tidak masuk akal.
                if duration <= timedelta(0) or duration > timedelta(hours=4):
                    continue
                if departs_at < now:
                    continue
                _, dest_name = self._resolve(
                    raw.destination_id, raw.destination_name, directory, by_key
                )
                trips.append(
                    Trip(
                        train_id=raw.train_id,
                        line=pretty_line(raw.line),
                        destination_name=dest_name,
                        color=raw.color or DEFAULT_COLOR,
                        departs_at=departs_at,
                        arrives_at=arrives_at,
                        duration_min=round(duration.total_seconds() / 60),
                    )
                )
        trips.sort(key=lambda t: t.departs_at)

        source = a.source
        if b.source.stale and not source.stale:
            source = source.model_copy(update={"stale": True})
        return TripsResponse(
            origin=origin,
            destination=destination,
            generated_at=now,
            source=source,
            trips=trips[:limit],
        )
