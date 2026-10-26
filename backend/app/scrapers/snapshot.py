"""Provider snapshot — jadwal yang tersimpan di disk sebagai fallback offline.

Snapshot dibuat dengan perintah:

    uv run python -m app.cli snapshot

Struktur folder:
    data/snapshot/meta.json
    data/snapshot/stations.json
    data/snapshot/schedules/{STATION_ID}.json
"""

from __future__ import annotations

import json
from functools import cached_property
from pathlib import Path

from app.config import settings
from app.models import RawDeparture, RawStop, Station
from app.scrapers.base import Provider, ProviderError, RouteResult
from app.scrapers.timeparse import parse_clock


class SnapshotProvider(Provider):
    name = "snapshot"
    description = "Snapshot jadwal lokal (fallback saat sumber online gagal)"

    def __init__(self, directory: Path | None = None) -> None:
        self.directory = directory or settings.snapshot_dir

    @property
    def enabled(self) -> bool:
        return (self.directory / "stations.json").exists()

    @cached_property
    def meta(self) -> dict:
        path = self.directory / "meta.json"
        return json.loads(path.read_text()) if path.exists() else {}

    def _read(self, relative: str) -> list[dict]:
        path = self.directory / relative
        if not path.exists():
            raise ProviderError(f"snapshot: {relative} tidak ada")
        try:
            return json.loads(path.read_text())
        except json.JSONDecodeError as exc:
            raise ProviderError(f"snapshot: {relative} rusak ({exc})") from exc

    async def fetch_stations(self) -> list[Station]:
        return [Station(**row) for row in self._read("stations.json")]

    def _schedule(self, station_id: str) -> list[RawDeparture]:
        rows = self._read(f"schedules/{station_id.upper()}.json")
        return [
            RawDeparture(
                train_id=row["train_id"],
                line=row["line"],
                origin_id=row.get("origin_id"),
                origin_name=row["origin_name"],
                destination_id=row.get("destination_id"),
                destination_name=row["destination_name"],
                departs=parse_clock(row["departs"]),
                arrives=parse_clock(row["arrives"]) if row.get("arrives") else None,
                color=row.get("color"),
            )
            for row in rows
        ]

    async def fetch_schedule(self, station_id: str) -> list[RawDeparture]:
        return self._schedule(station_id)

    async def fetch_route(self, train_id: str) -> RouteResult | None:
        """Rekonstruksi rute dari semua jadwal stasiun yang ada di snapshot.

        Hasilnya parsial: hanya stasiun yang ikut di-snapshot yang muncul.
        """
        names = {s.id: s.name for s in await self.fetch_stations()}
        stops: list[RawStop] = []
        line = color = None
        for path in sorted((self.directory / "schedules").glob("*.json")):
            station_id = path.stem
            for dep in self._schedule(station_id):
                if dep.train_id == train_id:
                    stops.append(
                        RawStop(
                            station_id=station_id,
                            station_name=names.get(station_id, station_id),
                            departs=dep.departs,
                        )
                    )
                    line, color = dep.line, dep.color
                    break
        if not stops:
            return None
        return RouteResult(line=line, color=color, stops=stops, partial=True)
