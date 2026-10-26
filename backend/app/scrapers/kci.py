"""Provider resmi KAI Commuter (api-partner.krl.co.id).

Endpoint ini dipakai oleh situs commuterline.id dan membutuhkan Bearer token
yang di-embed di frontend situs tersebut. Token bisa berganti/kedaluwarsa, jadi
provider ini hanya aktif kalau `KCI_API_TOKEN` diisi di environment.

Cara mendapatkan token: buka halaman jadwal di commuterline.id, buka DevTools →
tab Network, cari request ke `api-partner.krl.co.id`, salin nilai header
`Authorization` (tanpa kata "Bearer ").
"""

from __future__ import annotations

from typing import Any

import httpx

from app.config import settings
from app.models import RawDeparture, RawStop, Station
from app.scrapers.base import Provider, ProviderError, RouteResult
from app.scrapers.timeparse import parse_clock
from app.stations import display_name


class KciProvider(Provider):
    name = "kci"
    description = "API resmi KAI Commuter (butuh KCI_API_TOKEN)"

    def __init__(self, client: httpx.AsyncClient | None = None) -> None:
        self._client = client or httpx.AsyncClient(
            base_url=settings.kci_base_url,
            timeout=settings.http_timeout,
            headers={
                "User-Agent": settings.user_agent,
                "Accept": "application/json, text/javascript, */*; q=0.01",
                "Accept-Language": "id,en-US;q=0.7,en;q=0.3",
                "Origin": "https://commuterline.id",
                "Referer": "https://commuterline.id/",
                "Authorization": f"Bearer {settings.kci_token}",
            },
        )

    @property
    def enabled(self) -> bool:
        return bool(settings.kci_token)

    async def _get(self, path: str, params: dict[str, str] | None = None) -> Any:
        try:
            response = await self._client.get(path, params=params)
            response.raise_for_status()
            payload = response.json()
        except (httpx.HTTPError, ValueError) as exc:
            raise ProviderError(f"kci {path}: {exc}") from exc
        status = payload.get("status") if isinstance(payload, dict) else None
        if status not in (200, "200"):
            raise ProviderError(f"kci {path}: status {status}")
        return payload.get("data")

    async def fetch_stations(self) -> list[Station]:
        data = await self._get("/krl-station")
        stations = [
            Station(id=row["sta_id"], name=display_name(row["sta_name"]))
            for row in data or []
            if row.get("sta_id") and not str(row["sta_id"]).startswith("WIL")
        ]
        if not stations:
            raise ProviderError("kci: daftar stasiun kosong")
        return stations

    async def fetch_schedule(self, station_id: str) -> list[RawDeparture]:
        data = await self._get(
            "/schedule",
            params={"stationid": station_id.upper(), "timefrom": "00:00", "timeto": "23:59"},
        )
        rows: list[RawDeparture] = []
        for row in data or []:
            try:
                origin_raw, _, dest_raw = (row.get("route_name") or "").partition("-")
                rows.append(
                    RawDeparture(
                        train_id=str(row["train_id"]),
                        line=row.get("ka_name") or "",
                        # API resmi hanya memberi nama; ID di-resolve oleh service.
                        origin_id=None,
                        origin_name=origin_raw,
                        destination_id=None,
                        destination_name=row.get("dest") or dest_raw,
                        departs=parse_clock(row["time_est"]),
                        arrives=parse_clock(row["dest_time"]) if row.get("dest_time") else None,
                        color=row.get("color"),
                    )
                )
            except (KeyError, ValueError):
                continue
        return rows

    async def fetch_route(self, train_id: str) -> RouteResult | None:
        data = await self._get("/schedule-train", params={"trainid": train_id})
        if not data:
            return None
        stops = [
            RawStop(
                station_id=row["station_id"],
                station_name=display_name(row["station_name"]),
                departs=parse_clock(row["time_est"]),
            )
            for row in data
            if row.get("time_est")
        ]
        color = next((row.get("color") for row in data if row.get("color")), None)
        return RouteResult(line=None, color=color, stops=stops)

    async def aclose(self) -> None:
        await self._client.aclose()
