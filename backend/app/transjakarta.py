"""Data rute dan titik integrasi Transjakarta serta Trans Patriot di koridor Bekasi.

Mencakup rute BRT, Non-BRT, Trans Patriot (bus kota Bekasi), dan rute integrasi stasiun KRL.
"""

from __future__ import annotations

from app.models import StationBusIntegration, TransjakartaRoute

TRANSJAKARTA_ROUTES: list[TransjakartaRoute] = [
    TransjakartaRoute(
        route_id="B11",
        name="Summarecon Bekasi ⇄ Tosari",
        corridor="Rute Lintasan Bekasi Barat — Jakarta Pusat",
        service_type="Non-BRT",
        color="#0284c7",
        fare=3500,
        operational_hours="05:00 — 22:00 WIB",
        headway_min=12,
        connecting_stations=["BKS"],
        stops=[
            "Summarecon Bekasi",
            "Mall Metropolitan / Mega Bekasi",
            "Gerbang Tol Bekasi Barat",
            "Halte BNN Cawang (Integrasi Koridor 7 & 9)",
            "Pancoran",
            "Gatot Subroto LIPI",
            "Komdak / Polda Metro",
            "Karet Sudirman",
            "Tosari / Bundaran HI (Integrasi MRT & Koridor 1)",
        ],
        description=(
            "Rute komuter utama Bekasi Barat menuju koridor Sudirman-Thamrin "
            "via Tol Jakarta-Cikampek."
        ),
    ),
    TransjakartaRoute(
        route_id="B12",
        name="Summarecon Bekasi ⇄ Tanjung Priok",
        corridor="Rute Lintasan Bekasi Barat — Jakarta Utara",
        service_type="Non-BRT",
        color="#0284c7",
        fare=3500,
        operational_hours="05:00 — 21:00 WIB",
        headway_min=15,
        connecting_stations=["BKS"],
        stops=[
            "Summarecon Bekasi",
            "Islamic Center Bekasi",
            "Tol Bekasi Barat",
            "Cempaka Mas (Integrasi Koridor 2 & 10)",
            "Sunter Kelapa Gading",
            "Terminal Tanjung Priok (Integrasi KRL Stasiun Tanjung Priok)",
        ],
        description=(
            "Akses langsung komuter Bekasi menuju kawasan industri Pulogadung, "
            "Sunter, dan Pelabuhan Tanjung Priok."
        ),
    ),
    TransjakartaRoute(
        route_id="B21",
        name="Bekasi Timur ⇄ Grogol 2",
        corridor="Rute Lintasan Bekasi Timur — Jakarta Barat",
        service_type="Non-BRT",
        color="#0284c7",
        fare=3500,
        operational_hours="05:00 — 22:00 WIB",
        headway_min=15,
        connecting_stations=["BKST"],
        stops=[
            "Terminal Bekasi Timur",
            "Bulak Kapal",
            "Gerbang Tol Bekasi Timur",
            "Halte BNN Cawang",
            "Tegal Parang",
            "Gatot Subroto Jamsostek",
            "Slipi Petamburan",
            "Grogol 2 (Integrasi Koridor 3, 8 & 9)",
        ],
        description=(
            "Melayani komuter dari Stasiun Bekasi Timur dan Bulak Kapal "
            "menuju Jakarta Barat via Tol Timur."
        ),
    ),
    TransjakartaRoute(
        route_id="B22",
        name="Bekasi Timur ⇄ Juanda",
        corridor="Rute Lintasan Bekasi Timur — Jakarta Pusat",
        service_type="Non-BRT",
        color="#0284c7",
        fare=3500,
        operational_hours="05:00 — 21:30 WIB",
        headway_min=15,
        connecting_stations=["BKST"],
        stops=[
            "Terminal Bekasi Timur",
            "Tol Bekasi Timur",
            "Halte BNN Cawang",
            "UKI Cawang",
            "Flyover Matraman (Integrasi Koridor 5)",
            "Salemba UI",
            "Pasar Senen (Integrasi KRL Stasiun Pasar Senen)",
            "Halte Juanda (Integrasi KRL Stasiun Juanda & Koridor 1, 2)",
        ],
        description=(
            "Koneksi cepat Bekasi Timur menuju pusat pemerintahan dan "
            "Stasiun Gambir/Pasar Senen/Juanda."
        ),
    ),
    TransjakartaRoute(
        route_id="11",
        name="Pulo Gebang ⇄ Kampung Melayu",
        corridor="Koridor Utama 11 (BRT Terisolasi)",
        service_type="BRT",
        color="#2563eb",
        fare=3500,
        operational_hours="24 Jam (05:00—22:00 Reguler, 22:00—05:00 Amari)",
        headway_min=8,
        connecting_stations=["CUK", "KLDB", "KLD", "JNG"],
        stops=[
            "Terminal Pulo Gebang",
            "Halte Stasiun Cakung (Integrasi Langsung KRL Cakung)",
            "Penggilingan",
            "Flyover Raden Inten",
            "Buaran",
            "Halte Stasiun Klender (Integrasi Langsung KRL Klender)",
            "Cipinang",
            "Halte Stasiun Jatinegara / Flyover Jatinegara (Integrasi KRL JNG)",
            "Terminal Kampung Melayu (Integrasi Koridor 5 & 7)",
        ],
        description=(
            "Jalur BRT langsung di sepanjang koridor KRL Cikarang sisi Jakarta Timur "
            "dengan jembatan integrasi skybridge."
        ),
    ),
    TransjakartaRoute(
        route_id="11D",
        name="Pulo Gebang ⇄ Stasiun Cakung ⇄ Pulo Gadung",
        corridor="Rute Feeder Pengumpan Stasiun KRL",
        service_type="Non-BRT",
        color="#0284c7",
        fare=3500,
        operational_hours="05:00 — 21:30 WIB",
        headway_min=12,
        connecting_stations=["CUK"],
        stops=[
            "Terminal Pulo Gebang",
            "Pintu Keluar Stasiun Cakung",
            "Sentra Timur",
            "Wisma Asri Pulo Gebang",
            "Raya Bekasi Pulogadung",
            "Terminal Pulo Gadung (Integrasi Koridor 2 & 4)",
        ],
        description=(
            "Feeder langsung di depan pintu Stasiun Cakung menuju kawasan industri "
            "Pulo Gadung dan terminal."
        ),
    ),
    TransjakartaRoute(
        route_id="TP1",
        name="Trans Patriot 1: Terminal Bekasi ⇄ Harapan Indah",
        corridor="Bus Kota Modern Bekasi",
        service_type="Trans Patriot",
        color="#dc2626",
        fare=4000,
        operational_hours="05:00 — 21:00 WIB",
        headway_min=15,
        connecting_stations=["BKS", "KRI"],
        stops=[
            "Terminal Bekasi",
            "Stasiun Bekasi Timur",
            "Proklamasi / RS Bella",
            "Pintu Selatan Stasiun Bekasi",
            "Kranji (Dekat Stasiun Kranji)",
            "Harapan Baru",
            "Pondok Ungu",
            "Bundaran Harapan Indah (Koneksi TJ 2B)",
        ],
        description=(
            "Bus transit kota resmi Pemkot Bekasi yang menghubungkan Stasiun Bekasi, "
            "Stasiun Kranji, dan kawasan pemukiman Harapan Indah."
        ),
    ),
    TransjakartaRoute(
        route_id="TP2",
        name="Trans Patriot 2: Vida Bantargebang ⇄ Summarecon Bekasi",
        corridor="Bus Kota Modern Bekasi",
        service_type="Trans Patriot",
        color="#dc2626",
        fare=4000,
        operational_hours="05:30 — 20:30 WIB",
        headway_min=20,
        connecting_stations=["BKS"],
        stops=[
            "Vida Bantargebang",
            "Narogong Raya",
            "Rawalumbu",
            "Cut Meutia",
            "Jalan Juanda Stasiun Bekasi",
            "Flyover Summarecon",
            "Halte Summarecon Mall Bekasi (Koneksi TJ B11 & B12)",
        ],
        description=(
            "Menghubungkan Bekasi Selatan & Timur menuju pusat transit "
            "Stasiun Bekasi dan Summarecon."
        ),
    ),
    TransjakartaRoute(
        route_id="TP3",
        name="Trans Patriot 3: Sumber Artha ⇄ Wisma Asri",
        corridor="Bus Kota Modern Bekasi",
        service_type="Trans Patriot",
        color="#dc2626",
        fare=4000,
        operational_hours="05:30 — 20:00 WIB",
        headway_min=20,
        connecting_stations=["BKS", "KRI"],
        stops=[
            "Sumber Artha Kalimalang (Koneksi LRT City Jatibening)",
            "KH Noer Ali Kalimalang",
            "Metropolitan Mall Bekasi",
            "Stasiun Kranji (Akses Jalan Jenderal Sudirman)",
            "Stasiun Bekasi (Pintu Utara)",
            "Perjuangan",
            "Wisma Asri Bekasi Utara",
        ],
        description=(
            "Koneksi Kalimalang, pusat perbelanjaan MM/BCP, Stasiun KRL, hingga Bekasi Utara."
        ),
    ),
    TransjakartaRoute(
        route_id="1T",
        name="Royaltrans: Cibubur / Bekasi Barat ⇄ Blok M",
        corridor="Bus Eksekutif Premium Transjakarta",
        service_type="Royaltrans",
        color="#7c3aed",
        fare=20000,
        operational_hours="05:30 — 09:00 WIB & 16:30 — 20:30 WIB",
        headway_min=30,
        connecting_stations=["BKS"],
        stops=[
            "Mega Bekasi Hypermall (Akses Stasiun Bekasi 1.5 km)",
            "Gerbang Tol Bekasi Barat",
            "Komdak Pancoran",
            "Gelora Bung Karno (GBK)",
            "Terminal Blok M (Integrasi MRT Blok M BCA)",
        ],
        description=(
            "Layanan bus premium ber-AC dengan kursi ergonomis tanpa penumpang "
            "berdiri khusus jam kerja sibuk."
        ),
    ),
]


STATION_INTEGRATIONS: dict[str, StationBusIntegration] = {
    "BKS": StationBusIntegration(
        station_id="BKS",
        station_name="Stasiun Bekasi",
        nearest_bus_stop="Halte Pintu Selatan Stasiun Bekasi / Halte Bulan-Bulan",
        distance_m=80,
        walking_time_min=2,
        transfer_guide=(
            "Keluar melalui Pintu Selatan Stasiun Bekasi (arah Jl. Ir. H. Juanda). "
            "Halte Trans Patriot berada tepat di depan pintu keluar stasiun. "
            "Untuk Transjakarta B11/B12 menuju Jakarta, dapat naik angkutan penghubung/ojol "
            "5 menit menuju Halte Summarecon Bekasi atau Halte Mega Bekasi Barat."
        ),
        routes=[r for r in TRANSJAKARTA_ROUTES if "BKS" in r.connecting_stations],
    ),
    "KRI": StationBusIntegration(
        station_id="KRI",
        station_name="Stasiun Kranji",
        nearest_bus_stop="Halte Stasiun Kranji (Jl. Jenderal Sudirman)",
        distance_m=50,
        walking_time_min=1,
        transfer_guide=(
            "Keluar dari gate utama Stasiun Kranji langsung menuju Jalan Raya Jenderal Sudirman. "
            "Halte bus Trans Patriot Koridor 1 dan Koridor 3 berada tepat di tepi jalan depan. "
            "Tersedia pula Mikrotrans dan angkutan pengumpan menuju Harapan Indah dan Pulo Gebang."
        ),
        routes=[r for r in TRANSJAKARTA_ROUTES if "KRI" in r.connecting_stations],
    ),
    "BKST": StationBusIntegration(
        station_id="BKST",
        station_name="Stasiun Bekasi Timur",
        nearest_bus_stop="Halte Terminal Bekasi Timur (Jl. Juanda)",
        distance_m=120,
        walking_time_min=3,
        transfer_guide=(
            "Keluar melalui Pintu Utama Stasiun Bekasi Timur lalu berjalan ke arah Terminal "
            "Terpadu Bekasi Timur. Tersedia Halte Transjakarta untuk rute B21 (ke Grogol) "
            "dan B22 (ke Juanda/Pasar Senen) serta Trans Patriot Koridor 1."
        ),
        routes=[r for r in TRANSJAKARTA_ROUTES if "BKST" in r.connecting_stations],
    ),
    "TB": StationBusIntegration(
        station_id="TB",
        station_name="Stasiun Tambun",
        nearest_bus_stop="Pemberhentian Pasar Tambun / Jl. Sultan Hasanudin",
        distance_m=150,
        walking_time_min=3,
        transfer_guide=(
            "Akses transit angkutan kota koridor K-01A / K-39 menuju Terminal Bekasi dan kawasan "
            "industri Cibitung. Direncanakan integrasi Trans Patriot ruas Tambun-Cibitung."
        ),
        routes=[],
    ),
    "CIT": StationBusIntegration(
        station_id="CIT",
        station_name="Stasiun Cibitung",
        nearest_bus_stop="Pemberhentian Pasar Induk Cibitung",
        distance_m=250,
        walking_time_min=4,
        transfer_guide=(
            "Koneksi menuju kawasan industri MM2100 melalui shuttle bus kawasan dan "
            "angkutan feeder Cikarang Barat."
        ),
        routes=[],
    ),
    "TLM": StationBusIntegration(
        station_id="TLM",
        station_name="Stasiun Metland Telagamurni",
        nearest_bus_stop="Halte Kawasan Metland Cibitung",
        distance_m=100,
        walking_time_min=2,
        transfer_guide=(
            "Terhubung langsung dengan kawasan perumahan mandiri Metland Cibitung "
            "dan feeder internal shuttle."
        ),
        routes=[],
    ),
    "CKR": StationBusIntegration(
        station_id="CKR",
        station_name="Stasiun Cikarang",
        nearest_bus_stop="Terminal Cikarang / Sentral Grosir Cikarang (SGC)",
        distance_m=200,
        walking_time_min=4,
        transfer_guide=(
            "Stasiun terminus akhir Cikarang terhubung langsung dengan Terminal Cikarang dan SGC. "
            "Tersedia bus feeder AKAP/AKDP Jabodetabek, bus antar-jemput kawasan industri "
            "EJIP/Delta Silicon/Jababeka, dan angkutan feeder lokal."
        ),
        routes=[],
    ),
    "CUK": StationBusIntegration(
        station_id="CUK",
        station_name="Stasiun Cakung",
        nearest_bus_stop="Halte BRT Stasiun Cakung (Skybridge Terintegrasi)",
        distance_m=30,
        walking_time_min=1,
        transfer_guide=(
            "Stasiun KRL Cakung memiliki jembatan layang (Skybridge) yang menghubungkan lantai 2 "
            "stasiun langsung ke Halte BRT Transjakarta Koridor 11 (Pulo Gebang - Kampung Melayu) "
            "dan rute 11D (ke Pulo Gadung) tanpa perlu turun ke jalan raya."
        ),
        routes=[r for r in TRANSJAKARTA_ROUTES if "CUK" in r.connecting_stations],
    ),
    "JNG": StationBusIntegration(
        station_id="JNG",
        station_name="Stasiun Jatinegara",
        nearest_bus_stop="Halte Integrasi Flyover Jatinegara / Halte St. Jatinegara",
        distance_m=40,
        walking_time_min=1,
        transfer_guide=(
            "Hub transfer KRL & Transjakarta terbesar di Jakarta Timur. JPO langsung menghubungkan "
            "peron concourse Stasiun Jatinegara dengan Halte BRT Transjakarta Koridor 11 "
            "(ke Kampung Melayu) dan Koridor 4 (ke Pulo Gadung / Dukuh Atas)."
        ),
        routes=[r for r in TRANSJAKARTA_ROUTES if "JNG" in r.connecting_stations],
    ),
}
