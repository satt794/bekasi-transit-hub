"""Registry provider: membangun rantai provider sesuai env `PROVIDERS`."""

from __future__ import annotations

from app.config import settings
from app.scrapers.base import Provider, ProviderError, RouteResult
from app.scrapers.comuline import ComulineProvider
from app.scrapers.kci import KciProvider
from app.scrapers.snapshot import SnapshotProvider

REGISTRY: dict[str, type[Provider]] = {
    KciProvider.name: KciProvider,
    ComulineProvider.name: ComulineProvider,
    SnapshotProvider.name: SnapshotProvider,
}


def build_providers(names: list[str] | None = None) -> list[Provider]:
    providers: list[Provider] = []
    for name in names or settings.providers:
        cls = REGISTRY.get(name.lower())
        if cls is not None:
            providers.append(cls())
    return providers


__all__ = ["Provider", "ProviderError", "RouteResult", "build_providers", "REGISTRY"]
