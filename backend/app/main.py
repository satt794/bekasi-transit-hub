"""Entry point FastAPI.

Jalankan lokal:
    uv run uvicorn app.main:app --reload --port 8000
Dokumentasi interaktif: http://localhost:8000/docs
"""

from __future__ import annotations

import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from typing import Annotated

from fastapi import FastAPI, HTTPException, Path, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app import __version__
from app.config import settings
from app.models import (
    DeparturesResponse,
    HealthResponse,
    ProviderStatus,
    StationBusIntegration,
    StationsResponse,
    StationTransitHubResponse,
    TimetableResponse,
    TrainRouteResponse,
    TransjakartaResponse,
    TripsResponse,
)
from app.scrapers import build_providers
from app.services.transit import (
    AllProvidersFailed,
    StationNotFound,
    TrainNotFound,
    TransitService,
    now_wib,
)
from app.transjakarta import STATION_INTEGRATIONS, TRANSJAKARTA_ROUTES

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")

StationId = Annotated[
    str, Path(pattern=r"^[A-Za-z0-9]{1,6}$", description="Kode stasiun, mis. BKS")
]


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    providers = build_providers()
    app.state.service = TransitService(providers)
    logging.getLogger(__name__).info("provider aktif: %s", [p.name for p in providers if p.enabled])
    yield
    for provider in providers:
        await provider.aclose()


app = FastAPI(
    title="Bekasi Transit API",
    version=__version__,
    summary="Jadwal KRL real-time untuk stasiun-stasiun di wilayah Bekasi.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_methods=["GET"],
    allow_headers=["*"],
)


def service(request: Request) -> TransitService:
    if not hasattr(request.app.state, "service") or request.app.state.service is None:
        providers = build_providers()
        request.app.state.service = TransitService(providers)
    return request.app.state.service


@app.exception_handler(AllProvidersFailed)
async def _providers_failed(_: Request, exc: AllProvidersFailed) -> JSONResponse:
    return JSONResponse(
        status_code=503,
        content={
            "detail": "Semua sumber data sedang tidak tersedia.",
            "attempts": [a.model_dump() for a in exc.attempts],
        },
    )


@app.exception_handler(StationNotFound)
async def _station_not_found(_: Request, exc: StationNotFound) -> JSONResponse:
    return JSONResponse(status_code=404, content={"detail": f"Stasiun '{exc}' tidak dikenal."})


@app.exception_handler(TrainNotFound)
async def _train_not_found(_: Request, exc: TrainNotFound) -> JSONResponse:
    return JSONResponse(status_code=404, content={"detail": f"Kereta '{exc}' tidak ditemukan."})


@app.get("/", tags=["meta"])
@app.get("/api/index", tags=["meta"])
@app.get("/api/index.py", tags=["meta"])
async def root() -> dict[str, str]:
    return {
        "status": "ok",
        "service": "Bekasi Transit Hub API",
        "version": __version__,
        "docs": "/docs",
        "health": "/api/health",
        "stations": "/api/stations",
    }


@app.get("/api/health", response_model=HealthResponse, tags=["meta"])
async def health(request: Request) -> HealthResponse:
    return HealthResponse(
        status="ok",
        version=__version__,
        time=now_wib(),
        providers=[
            ProviderStatus(name=p.name, enabled=p.enabled, description=p.description)
            for p in service(request).providers
        ],
    )


@app.get("/api/stations", response_model=StationsResponse, tags=["stations"])
async def stations(request: Request) -> StationsResponse:
    return await service(request).list_stations()


@app.get(
    "/api/stations/{station_id}/departures",
    response_model=DeparturesResponse,
    tags=["stations"],
)
async def departures(
    request: Request,
    station_id: StationId,
    limit: Annotated[int, Query(ge=1, le=30)] = 8,
    include_non_passenger: bool = False,
) -> DeparturesResponse:
    """Keberangkatan berikutnya, dipisah arah Jakarta dan arah Cikarang."""
    return await service(request).departures(
        station_id, limit=limit, include_non_passenger=include_non_passenger
    )


@app.get(
    "/api/stations/{station_id}/timetable",
    response_model=TimetableResponse,
    tags=["stations"],
)
async def timetable(request: Request, station_id: StationId) -> TimetableResponse:
    """Jadwal lengkap satu hari operasional (03:00–03:00 WIB)."""
    return await service(request).timetable(station_id)


@app.get("/api/trains/{train_id}/route", response_model=TrainRouteResponse, tags=["trains"])
async def train_route(
    request: Request,
    train_id: Annotated[str, Path(pattern=r"^[A-Za-z0-9-]{1,12}$")],
) -> TrainRouteResponse:
    """Daftar pemberhentian satu perjalanan beserta posisi relatif terhadap waktu sekarang."""
    return await service(request).route(train_id)


@app.get("/api/trips", response_model=TripsResponse, tags=["trips"])
async def trips(
    request: Request,
    origin: Annotated[str, Query(alias="from", pattern=r"^[A-Za-z0-9]{1,6}$")],
    destination: Annotated[str, Query(alias="to", pattern=r"^[A-Za-z0-9]{1,6}$")],
    limit: Annotated[int, Query(ge=1, le=30)] = 10,
) -> TripsResponse:
    """Kereta langsung (tanpa transit) dari stasiun asal ke tujuan."""
    try:
        return await service(request).trips(origin, destination, limit=limit)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@app.get("/api/transjakarta/routes", response_model=TransjakartaResponse, tags=["transjakarta"])
async def transjakarta_routes() -> TransjakartaResponse:
    """Daftar rute Transjakarta & Trans Patriot penghubung koridor Bekasi."""
    return TransjakartaResponse(
        generated_at=now_wib(),
        routes=TRANSJAKARTA_ROUTES,
        total_routes=len(TRANSJAKARTA_ROUTES),
    )


@app.get(
    "/api/stations/{station_id}/transjakarta",
    response_model=StationTransitHubResponse,
    tags=["stations", "transjakarta"],
)
async def station_transjakarta(
    request: Request,
    station_id: StationId,
) -> StationTransitHubResponse:
    """Integrasi antarmoda (halte terdekat, panduan transit, & rute bus) di stasiun KRL."""
    station = await service(request).station(station_id)
    integration = STATION_INTEGRATIONS.get(station.id)
    if integration is None:
        integration = StationBusIntegration(
            station_id=station.id,
            station_name=station.name,
            nearest_bus_stop=f"Pemberhentian Angkutan Feeder Stasiun {station.name}",
            distance_m=100,
            walking_time_min=2,
            transfer_guide=(
                "Pintu keluar stasiun terhubung dengan akses angkutan pengumpan "
                "dan ojek daring menuju koridor utama."
            ),
            routes=[],
        )
    return StationTransitHubResponse(
        station=station,
        generated_at=now_wib(),
        integration=integration,
    )
