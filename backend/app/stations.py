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
    Station(id="KRI", name="Kranji", region="Kota Bekasi", is_bekasi=True, order=1),
    Station(id="BKS", name="Bekasi", region="Kota Bekasi", is_bekasi=True, order=2),
    Station(id="BKST", name="Bekasi Timur", region="Kota Bekasi", is_bekasi=True, order=3),
    Station(id="TB", name="Tambun", region="Kab. Bekasi", is_bekasi=True, order=4),
    Station(id="CIT", name="Cibitung", region="Kab. Bekasi", is_bekasi=True, order=5),
    Station(id="TLM", name="Metland Telagamurni", region="Kab. Bekasi", is_bekasi=True, order=6),
    Station(id="CKR", name="Cikarang", region="Kab. Bekasi", is_bekasi=True, order=7),
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
