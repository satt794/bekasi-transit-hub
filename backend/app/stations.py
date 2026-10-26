"""Data referensi stasiun di koridor Bekasi (Commuter Line Cikarang).

Kode stasiun mengikuti kode resmi KAI Commuter. Urutan `CORRIDOR` dipakai untuk
menentukan arah kereta (menuju Jakarta atau menuju Cikarang).
"""

from __future__ import annotations

import re

from app.models import Station

# Urutan stasiun dari arah Jakarta ke arah Cikarang.
CORRIDOR: list[str] = [
    "JNG",  # Jatinegara
    "KLD",  # Klender
    "BUA",  # Buaran
    "KLDB",  # Klender Baru
    "CUK",  # Cakung
    "KRI",  # Kranji
    "BKS",  # Bekasi
    "BKST",  # Bekasi Timur
    "TB",  # Tambun
    "CIT",  # Cibitung
    "TLM",  # Metland Telagamurni
    "CKR",  # Cikarang
]

BEKASI_STATIONS: list[Station] = [
    Station(
        id="KRI",
        name="Kranji",
        region="Kota Bekasi",
        is_bekasi=True,
        order=1,
        platform_guide="Peron 1: Arah Cikarang · Peron 2: Arah Jakarta (Manggarai)",
    ),
    Station(
        id="BKS",
        name="Bekasi",
        region="Kota Bekasi",
        is_bekasi=True,
        order=2,
        platform_guide="Peron 1 & 2: Arah Cikarang · Peron 3 & 4: Arah Jakarta (Manggarai/KPB)",
    ),
    Station(
        id="BKST",
        name="Bekasi Timur",
        region="Kota Bekasi",
        is_bekasi=True,
        order=3,
        platform_guide="Peron 1: Arah Cikarang · Peron 2: Arah Jakarta",
    ),
    Station(
        id="TB",
        name="Tambun",
        region="Kab. Bekasi",
        is_bekasi=True,
        order=4,
        platform_guide="Peron 1: Arah Jakarta · Peron 2 & 3: Arah Cikarang",
    ),
    Station(
        id="CIT",
        name="Cibitung",
        region="Kab. Bekasi",
        is_bekasi=True,
        order=5,
        platform_guide="Peron 1: Arah Jakarta · Peron 2: Arah Cikarang",
    ),
    Station(
        id="TLM",
        name="Metland Telagamurni",
        region="Kab. Bekasi",
        is_bekasi=True,
        order=6,
        platform_guide="Peron 1: Arah Jakarta · Peron 2: Arah Cikarang",
    ),
    Station(
        id="CKR",
        name="Cikarang",
        region="Kab. Bekasi",
        is_bekasi=True,
        order=7,
        platform_guide="Peron 1 & 2: KRL Arah Jakarta · Peron 3 & 4: KA Lokal Walahar & Jarak Jauh",
    ),
]

BEKASI_IDS: set[str] = {s.id for s in BEKASI_STATIONS}
DEFAULT_STATION = "BKS"

# Nama tampilan untuk stasiun yang sering muncul sebagai asal/tujuan.
# Sumber data menulis nama tanpa spasi (mis. "KAMPUNGBANDAN").
KNOWN_NAMES: dict[str, str] = {
    "AK": "Angke",
    "BKS": "Bekasi",
    "BKST": "Bekasi Timur",
    "BUA": "Buaran",
    "CIT": "Cibitung",
    "CKR": "Cikarang",
    "CUK": "Cakung",
    "JAKK": "Jakarta Kota",
    "JNG": "Jatinegara",
    "KLD": "Klender",
    "KLDB": "Klender Baru",
    "KPB": "Kampung Bandan",
    "KRI": "Kranji",
    "MRI": "Manggarai",
    "PSE": "Pasar Senen",
    "TB": "Tambun",
    "TLM": "Metland Telagamurni",
}

# Kata yang tetap ditulis kapital saat title-case.
_UPPER_WORDS = {"UI", "LRT", "MRT", "BNI", "KRL"}


def display_name(raw: str) -> str:
    """Ubah 'BEKASI TIMUR' → 'Bekasi Timur' dengan beberapa pengecualian."""
    words = re.split(r"\s+", raw.strip())
    out = []
    for word in words:
        upper = word.upper()
        out.append(upper if upper in _UPPER_WORDS else word.capitalize())
    return " ".join(out)


def name_key(raw: str) -> str:
    """Kunci pencarian nama yang kebal spasi/kapitalisasi ('KAMPUNG BANDAN' == 'KAMPUNGBANDAN')."""
    return re.sub(r"[^A-Z0-9]", "", raw.upper())


def corridor_index(station_id: str | None) -> int | None:
    if station_id and station_id in CORRIDOR:
        return CORRIDOR.index(station_id)
    return None


def direction_for(current_id: str, destination_id: str | None) -> str:
    """Tentukan arah kereta relatif terhadap stasiun saat ini.

    Tujuan yang berada di luar koridor (Manggarai, Angke, Kampung Bandan, dst.)
    selalu dianggap menuju Jakarta.
    """
    here = corridor_index(current_id)
    there = corridor_index(destination_id)
    if here is None or there is None:
        return "jakarta"
    return "cikarang" if there > here else "jakarta"


def bekasi_station(station_id: str) -> Station | None:
    return next((s for s in BEKASI_STATIONS if s.id == station_id.upper()), None)


PLATFORM_GUIDES: dict[str, str] = {
    "BKS": "Peron 1 & 2: Arah Cikarang · Peron 3 & 4: Arah Jakarta (Manggarai/KPB)",
    "KRI": "Peron 1: Arah Cikarang · Peron 2: Arah Jakarta (Manggarai)",
    "BKST": "Peron 1: Arah Cikarang · Peron 2: Arah Jakarta",
    "TB": "Peron 1: Arah Jakarta · Peron 2 & 3: Arah Cikarang",
    "CIT": "Peron 1: Arah Jakarta · Peron 2: Arah Cikarang",
    "TLM": "Peron 1: Arah Jakarta · Peron 2: Arah Cikarang",
    "CKR": "Peron 1 & 2: KRL Arah Jakarta · Peron 3 & 4: KA Lokal Walahar & Jarak Jauh",
    "CUK": "Peron 1 & 2: Arah Cikarang · Peron 3 & 4: Arah Jakarta",
    "KLDB": "Peron 1: Arah Cikarang · Peron 2: Arah Jakarta",
    "BUA": "Peron 1: Arah Cikarang · Peron 2: Arah Jakarta",
    "KLD": "Peron 1: Arah Cikarang · Peron 2: Arah Jakarta",
    "JNG": "Peron 3 & 4: Arah Pasar Senen/KPB · Peron 5 & 6: Arah Manggarai/Bekasi",
    "MRI": "Peron 6 & 7: Commuter Line Cikarang · Peron 10-13: Bogor Line",
}


def platform_for(station_id: str, direction: str, train_id: str = "") -> str:
    """Tentukan peron/jalur keberangkatan kereta di stasiun tertentu."""
    sid = station_id.upper()
    digits = re.findall(r"\d+", train_id)
    num = int(digits[-1]) if digits else 0

    if sid == "BKS":
        # Stasiun Bekasi: Peron 1 & 2 arah Cikarang, Peron 3 & 4 arah Jakarta
        if direction == "jakarta":
            return "Peron 3" if num % 2 == 1 else "Peron 4"
        return "Peron 1" if num % 2 == 1 else "Peron 2"
    if sid == "CKR":
        # Stasiun Cikarang: Peron 1 & 2 KRL Commuter Line Cikarang
        return "Peron 1" if num % 2 == 1 else "Peron 2"
    if sid == "CUK":
        # Stasiun Cakung: Peron 1 & 2 Cikarang, Peron 3 & 4 Jakarta
        if direction == "jakarta":
            return "Peron 3" if num % 2 == 1 else "Peron 4"
        return "Peron 1" if num % 2 == 1 else "Peron 2"
    if sid == "JNG":
        # Stasiun Jatinegara: Peron 3 & 4 (Pasar Senen/KPB), Peron 5 & 6 (Manggarai/Bekasi)
        return "Peron 5" if direction == "cikarang" else "Peron 3"
    if sid == "MRI":
        # Stasiun Manggarai: Peron 6 & 7 untuk Cikarang Line
        return "Peron 6" if direction == "cikarang" else "Peron 7"
    if sid in ("KRI", "BKST", "CIT", "TLM", "KLD", "BUA", "KLDB"):
        return "Peron 2" if direction == "jakarta" else "Peron 1"
    if sid == "TB":
        return "Peron 1" if direction == "jakarta" else "Peron 2"
    return "Peron 2" if direction == "jakarta" else "Peron 1"
