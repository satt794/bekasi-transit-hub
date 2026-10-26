"""Provider Comuline — mirror publik jadwal KAI Commuter.

Dokumentasi: https://www.api.comuline.com/docs
Endpoint yang dipakai:
    GET /station
    GET /schedule/{station_id}
    GET /route/{train_id}
"""

from __future__ import annotations

import asyncio
from typing import Any

import httpx

from app.config import settings
from app.models import RawDeparture, RawStop, Station
from app.scrapers.base import Provider, ProviderError, RouteResult
from app.scrapers.timeparse import parse_timestamp_to_wib
from app.stations import display_name


class ComulineProvider(Provider):
    name = "comuline"
    description = "Mirror publik jadwal KAI Commuter (api.comuline.com)"

    def __init__(self, client: httpx.AsyncClient | None = None) -> None:
        self._client = client or httpx.AsyncClient(
            base_url=settings.comuline_base_url,
            timeout=settings.http_timeout,
            headers={"User-Agent": settings.user_agent, "Accept": "application/json"},
            follow_redirects=True,
        )

    async def _get(self, path: str, retries: int = 1) -> Any:
        for attempt in range(retries + 1):
            try:
                response = await self._client.get(path)
                response.raise_for_status()
                payload = response.json()
                break
            except httpx.TransportError as exc:
                if attempt < retries:
                    await asyncio.sleep(0.8 * (attempt + 1))
                    continue
                raise ProviderError(f"comuline {path}: {type(exc).__name__} {exc}") from exc
            except (httpx.HTTPError, ValueError) as exc:
                raise ProviderError(f"comuline {path}: {type(exc).__name__} {exc}") from exc
        if not isinstance(payload, dict) or not payload.get("metadata", {}).get("success"):
            raise ProviderError(f"comuline {path}: respons tidak sukses")
        return payload.get("data")

    async def fetch_stations(self) -> list[Station]:
        data = await self._get("/station")
        stations: list[Station] = []
        for row in data or []:
            if row.get("type") != "KRL":
                continue
            if not (row.get("metadata") or {}).get("active", True):
                continue
            stations.append(Station(id=row["id"], name=display_name(row["name"])))
        if not stations:
            raise ProviderError("comuline: daftar stasiun kosong")
        return stations

    async def fetch_schedule(self, station_id: str) -> list[RawDeparture]:
        data = await self._get(f"/schedule/{station_id.upper()}")
        rows: list[RawDeparture] = []
        for row in data or []:
            try:
                origin_raw, _, dest_raw = (row.get("route") or "").partition("-")
                arrives = row.get("arrives_at")
                rows.append(
                    RawDeparture(
                        train_id=row["train_id"],
                        line=row.get("line") or "",
                        origin_id=row.get("station_origin_id"),
                        origin_name=origin_raw,
                        destination_id=row.get("station_destination_id"),
                        destination_name=dest_raw,
                        departs=parse_timestamp_to_wib(row["departs_at"]),
                        arrives=parse_timestamp_to_wib(arrives) if arrives else None,
                        color=((row.get("metadata") or {}).get("origin") or {}).get("color"),
                    )
                )
            except (KeyError, ValueError):
                # Satu baris rusak tidak boleh menggagalkan seluruh jadwal.
                continue
        return rows

    async def fetch_route(self, train_id: str) -> RouteResult | None:
        data = await self._get(f"/route/{train_id}")
        if not data or not data.get("routes"):
            return None
        details = data.get("details") or {}
        stops = [
            RawStop(
                station_id=row["station_id"],
                station_name=display_name(row.get("station_name") or row["station_id"]),
                departs=parse_timestamp_to_wib(row["departs_at"]),
            )
            for row in data["routes"]
            if row.get("departs_at")
        ]
        return RouteResult(line=details.get("line"), color=None, stops=stops)

    async def aclose(self) -> None:
        await self._client.aclose()
