"""Test unit untuk service dan parser. Tidak butuh akses internet."""

from __future__ import annotations

import asyncio
import json
from datetime import datetime, time
from pathlib import Path

import pytest

from app.config import WIB
from app.models import RawDeparture, RawStop, Station
from app.scrapers.base import Provider, ProviderError, RouteResult
from app.scrapers.snapshot import SnapshotProvider
from app.scrapers.timeparse import parse_clock, parse_timestamp_to_wib
from app.services.transit import (
    AllProvidersFailed,
    TransitService,
    current_service_day,
    service_datetime,
)
from app.stations import direction_for, display_name


def run(coro):
    return asyncio.run(coro)


def at(hh: int, mm: int, day: int = 24) -> datetime:
    return datetime(2026, 10, day, hh, mm, tzinfo=WIB)


# ---------------------------------------------------------------------------
# Fixture: snapshot mini dua stasiun
# ---------------------------------------------------------------------------

STATIONS = [
    {"id": "BKS", "name": "Bekasi", "is_bekasi": True},
    {"id": "KRI", "name": "Kranji", "is_bekasi": True},
    {"id": "CKR", "name": "Cikarang", "is_bekasi": True},
    {"id": "KPB", "name": "Kampung Bandan"},
    {"id": "MRI", "name": "Manggarai"},
]


def dep(train, origin, dest, departs, arrives, line="COMMUTER LINE CIKARANG", oid=None, did=None):
    return {
        "train_id": train,
        "line": line,
        "origin_id": oid,
        "origin_name": origin,
        "destination_id": did,
        "destination_name": dest,
        "departs": departs,
        "arrives": arrives,
        "color": "#0084D8",
    }


DINAS = "DINAS RANGKAIAN KRL (TIDAK ANGKUT PENUMPANG)"

BKS = [
    dep("5001", "CIKARANG", "KAMPUNGBANDAN", "05:10", "06:05", oid="CKR", did="KPB"),
    dep("5002", "KAMPUNGBANDAN", "CIKARANG", "05:20", "05:45", oid="KPB", did="CKR"),
    dep("5003", "CIKARANG", "MANGGARAI", "05:25", "06:10", oid="CKR", did="MRI"),
    dep("R01", "BEKASI", "CAKUNG", "05:30", "05:40", line=DINAS, oid="BKS", did="CUK"),
    dep("5099", "KAMPUNGBANDAN", "BEKASI", "05:40", "05:40", oid="KPB", did="BKS"),
    dep("5174A", "KAMPUNGBANDAN", "CIKARANG", "00:19", "00:40", oid="KPB", did="CKR"),
]
KRI = [
    dep("5001", "CIKARANG", "KAMPUNGBANDAN", "05:15", "06:05", oid="CKR", did="KPB"),
    dep("5002", "KAMPUNGBANDAN", "CIKARANG", "05:15", "05:45", oid="KPB", did="CKR"),
    dep("5003", "CIKARANG", "MANGGARAI", "05:30", "06:10", oid="CKR", did="MRI"),
]


@pytest.fixture()
def snapshot_dir(tmp_path: Path) -> Path:
    (tmp_path / "schedules").mkdir()
    (tmp_path / "stations.json").write_text(json.dumps(STATIONS))
    (tmp_path / "schedules" / "BKS.json").write_text(json.dumps(BKS))
    (tmp_path / "schedules" / "KRI.json").write_text(json.dumps(KRI))
    return tmp_path


@pytest.fixture()
def service(snapshot_dir: Path) -> TransitService:
    return TransitService([SnapshotProvider(snapshot_dir)])


# ---------------------------------------------------------------------------
# Parser & helper
# ---------------------------------------------------------------------------


def test_parse_timestamp_converts_utc_to_wib():
    assert parse_timestamp_to_wib("2024-11-12 17:19:00.291+00") == time(0, 19)
    assert parse_timestamp_to_wib("2024-11-12 21:55:00+00") == time(4, 55)
    assert parse_timestamp_to_wib("2024-11-12T05:00:00+07:00") == time(5, 0)


def test_parse_clock():
    assert parse_clock("05:12:00") == time(5, 12)
    assert parse_clock("5:07") == time(5, 7)
    with pytest.raises(ValueError):
        parse_clock("jam lima")


def test_display_name():
    assert display_name("BEKASI TIMUR") == "Bekasi Timur"
    assert display_name("UNIVERSITAS INDONESIA") == "Universitas Indonesia"


def test_direction():
    assert direction_for("BKS", "CKR") == "cikarang"
    assert direction_for("BKS", "KRI") == "jakarta"
    assert direction_for("BKS", "KPB") == "jakarta"  # di luar koridor → Jakarta


def test_service_day_rolls_over_at_3am():
    assert current_service_day(at(2, 30, day=25)).day == 24
    assert current_service_day(at(3, 0, day=25)).day == 25
    sd = current_service_day(at(22, 0))
    assert service_datetime(sd, time(0, 19)) == at(0, 19, day=25)


# ---------------------------------------------------------------------------
# Service
# ---------------------------------------------------------------------------


def test_departures_split_by_direction(service: TransitService):
    res = run(service.departures("BKS", now=at(5, 0)))
    jkt = [d.train_id for d in res.departures["jakarta"]]
    ckr = [d.train_id for d in res.departures["cikarang"]]
    assert jkt[:2] == ["5001", "5003"]
    # Slot sisa diisi kereta hari berikutnya.
    assert res.departures["jakarta"][2].departs_at.day == 25
    assert ckr[:2] == ["5002", "5174A"]
    # Dinas & kereta yang berakhir di Bekasi tidak ikut.
    assert "R01" not in jkt + ckr
    assert "5099" not in jkt + ckr
    assert res.departures["jakarta"][0].destination_name == "Kampung Bandan"
    assert res.source.provider == "snapshot"
    assert res.source.stale is True


def test_departures_after_midnight_train(service: TransitService):
    res = run(service.departures("BKS", now=at(23, 50)))
    first = res.departures["cikarang"][0]
    assert first.train_id == "5174A"
    assert first.departs_at == at(0, 19, day=25)


def test_include_non_passenger(service: TransitService):
    res = run(service.departures("BKS", now=at(5, 0), include_non_passenger=True))
    ids = [d.train_id for d in res.departures["jakarta"]]
    assert "R01" in ids


def test_summary(service: TransitService):
    res = run(service.departures("BKS", now=at(5, 0)))
    s = res.summary
    assert s.total_trips == 4
    assert s.first_departure == at(5, 10)
    assert s.last_departure == at(0, 19, day=25)
    assert s.trips_next_hour == 3
    assert s.avg_headway_min == 7.5


def test_route_progress_from_snapshot(service: TransitService):
    res = run(service.route("5001", now=at(5, 12)))
    assert res.partial is True
    assert [s.station_id for s in res.stops] == ["BKS", "KRI"]
    assert [s.status for s in res.stops] == ["passed", "next"]


def test_trips_only_forward_direction(service: TransitService):
    res = run(service.trips("BKS", "KRI", now=at(5, 0)))
    assert [t.train_id for t in res.trips][:2] == ["5001", "5003"]
    assert "5002" not in [t.train_id for t in res.trips]  # arah sebaliknya
    assert res.trips[0].duration_min == 5


def test_unknown_station(service: TransitService):
    from app.services.transit import StationNotFound

    with pytest.raises(StationNotFound):
        run(service.departures("XXX", now=at(5, 0)))


# ---------------------------------------------------------------------------
# Rantai provider
# ---------------------------------------------------------------------------


class FailingProvider(Provider):
    name = "broken"

    async def fetch_stations(self) -> list[Station]:
        raise ProviderError("down")

    async def fetch_schedule(self, station_id: str) -> list[RawDeparture]:
        raise ProviderError("down")

    async def fetch_route(self, train_id: str) -> RouteResult | None:
        raise ProviderError("down")


class StaticProvider(Provider):
    name = "static"

    def __init__(self) -> None:
        self.calls = 0

    async def fetch_stations(self) -> list[Station]:
        return [Station(id="BKS", name="Bekasi")]

    async def fetch_schedule(self, station_id: str) -> list[RawDeparture]:
        self.calls += 1
        return [
            RawDeparture(
                train_id="9",
                line="COMMUTER LINE CIKARANG",
                origin_id="KPB",
                origin_name="KAMPUNGBANDAN",
                destination_id="CKR",
                destination_name="CIKARANG",
                departs=time(6, 0),
                arrives=time(6, 30),
            )
        ]

    async def fetch_route(self, train_id: str) -> RouteResult | None:
        stop = RawStop(station_id="BKS", station_name="Bekasi", departs=time(6, 0))
        return RouteResult(line=None, color=None, stops=[stop])


def test_chain_falls_through_and_caches():
    static = StaticProvider()
    svc = TransitService([FailingProvider(), static])
    first = run(svc.departures("BKS", now=at(5, 0)))
    assert first.source.provider == "static"
    assert [a.ok for a in first.source.attempts] == [False, True]
    second = run(svc.departures("BKS", now=at(5, 0)))
    assert second.source.cached is True
    assert static.calls == 1


def test_chain_all_failed():
    svc = TransitService([FailingProvider()])
    with pytest.raises(AllProvidersFailed):
        run(svc.departures("BKS", now=at(5, 0)))


def test_transjakarta_routes_and_integrations():
    from app.transjakarta import STATION_INTEGRATIONS, TRANSJAKARTA_ROUTES

    assert len(TRANSJAKARTA_ROUTES) >= 25
    route_ids = [r.route_id for r in TRANSJAKARTA_ROUTES]
    assert "B11" in route_ids
    assert "B21" in route_ids
    assert "1" in route_ids
    assert "11" in route_ids
    assert "13" in route_ids
    assert "D11" in route_ids
    assert "S11" in route_ids
    assert "TP1" in route_ids

    # Cek area wilayah rute
    areas = {r.area for r in TRANSJAKARTA_ROUTES}
    assert {"bekasi", "brt_jakarta", "bogor_depok", "tangerang"}.issubset(areas)

    # Stasiun Bekasi terhubung dengan Trans Patriot & feeder
    bks = STATION_INTEGRATIONS.get("BKS")
    assert bks is not None
    assert bks.walking_time_min <= 3
    assert any("BKS" in r.connecting_stations for r in bks.routes)

    # Stasiun Cakung terhubung langsung via skybridge ke Koridor 11
    cuk = STATION_INTEGRATIONS.get("CUK")
    assert cuk is not None
    assert any(r.route_id == "11" for r in cuk.routes)


def test_station_and_departure_platform(service: TransitService):
    res = run(service.departures("BKS", now=at(5, 0)))
    # Stasiun memiliki platform_guide
    assert res.station.platform_guide is not None
    assert "Peron 1 & 2" in res.station.platform_guide

    # Keberangkatan memiliki platform terisi
    for d in res.departures["jakarta"]:
        assert d.platform in ("Peron 3", "Peron 4")
    for d in res.departures["cikarang"]:
        assert d.platform in ("Peron 1", "Peron 2")
