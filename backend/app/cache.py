"""Cache TTL in-memory sederhana untuk hasil scraping.

Menyimpan entri kedaluwarsa juga, supaya API masih bisa menyajikan data lama
(ditandai `stale`) kalau semua sumber sedang gagal.
"""

from __future__ import annotations

import asyncio
import time
from collections.abc import Awaitable, Callable
from dataclasses import dataclass
from typing import Generic, TypeVar

T = TypeVar("T")


@dataclass
class CacheEntry(Generic[T]):
    value: T
    stored_at: float
    ttl: int

    @property
    def fresh(self) -> bool:
        return (time.monotonic() - self.stored_at) < self.ttl


class TTLCache:
    def __init__(self) -> None:
        self._data: dict[str, CacheEntry] = {}
        self._locks: dict[str, asyncio.Lock] = {}

    def get(self, key: str) -> CacheEntry | None:
        return self._data.get(key)

    def set(self, key: str, value: T, ttl: int) -> CacheEntry[T]:
        entry = CacheEntry(value=value, stored_at=time.monotonic(), ttl=ttl)
        self._data[key] = entry
        return entry

    def lock(self, key: str) -> asyncio.Lock:
        # Satu lock per key mencegah "thundering herd" ke sumber data.
        if key not in self._locks:
            self._locks[key] = asyncio.Lock()
        return self._locks[key]

    async def get_or_load(
        self, key: str, ttl: int, loader: Callable[[], Awaitable[T]]
    ) -> tuple[T, bool]:
        """Kembalikan (value, from_cache)."""
        entry = self.get(key)
        if entry and entry.fresh:
            return entry.value, True
        async with self.lock(key):
            entry = self.get(key)
            if entry and entry.fresh:
                return entry.value, True
            value = await loader()
            self.set(key, value, ttl)
            return value, False

    def clear(self) -> None:
        self._data.clear()
