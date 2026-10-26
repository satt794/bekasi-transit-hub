"""Utilitas parsing waktu yang dipakai lintas provider."""

from __future__ import annotations

import re
from datetime import UTC, datetime, time

from app.config import WIB

_TIME_RE = re.compile(r"^\s*(\d{1,2}):(\d{2})(?::(\d{2}))?")
_TS_RE = re.compile(
    r"^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}:\d{2})(?:\.\d+)?\s*(Z|[+-]\d{2}(?::?\d{2})?)?$"
)


def parse_clock(value: str) -> time:
    """'05:12:00' / '5:12' → time(5, 12). Detik diabaikan."""
    match = _TIME_RE.match(value or "")
    if not match:
        raise ValueError(f"format jam tidak dikenal: {value!r}")
    hour, minute = int(match.group(1)), int(match.group(2))
    return time(hour % 24, minute)


def parse_timestamp_to_wib(value: str) -> time:
    """Timestamp Postgres seperti '2024-11-12 17:19:00.291+00' → jam WIB (00:19).

    Comuline menyimpan jadwal dalam UTC, jadi perlu dikonversi ke Asia/Jakarta.
    """
    match = _TS_RE.match((value or "").strip())
    if not match:
        raise ValueError(f"format timestamp tidak dikenal: {value!r}")
    date_part, time_part, offset = match.groups()
    if offset in (None, "Z"):
        offset = "+00:00"
    elif len(offset) == 3:  # "+00"
        offset = f"{offset}:00"
    elif ":" not in offset:  # "+0700"
        offset = f"{offset[:3]}:{offset[3:]}"
    dt = datetime.fromisoformat(f"{date_part}T{time_part}{offset}")
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=UTC)
    local = dt.astimezone(WIB)
    return time(local.hour, local.minute)


def clock_str(value: time) -> str:
    return value.strftime("%H:%M")
