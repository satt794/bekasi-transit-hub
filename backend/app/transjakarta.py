"""Data rute dan titik integrasi Transjakarta serta Trans Patriot di koridor Bekasi.

Mencakup rute BRT, Non-BRT, Trans Patriot (bus kota Bekasi), dan rute integrasi stasiun KRL.
"""

from __future__ import annotations

from app.models import StationBusIntegration, TransjakartaRoute

TRANSJAKARTA_ROUTES: list[TransjakartaRoute] = [
    # -----------------------------------------------------------------------
    # 1. Koridor Bekasi & Feeder Trans Patriot
    # -----------------------------------------------------------------------
    TransjakartaRoute(
        route_id="B11",
        name="Summarecon Bekasi ⇄ Tosari",
        corridor="Rute Lintasan Bekasi Barat — Jakarta Pusat",
        service_type="Non-BRT",
        color="#0284c7",
        fare=3500,
        operational_hours="05:00 — 22:00 WIB",
        headway_min=12,
        area="bekasi",
        area_name="Bekasi & Trans Patriot",
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
        area="bekasi",
        area_name="Bekasi & Trans Patriot",
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
        area="bekasi",
        area_name="Bekasi & Trans Patriot",
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
        area="bekasi",
        area_name="Bekasi & Trans Patriot",
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
        route_id="11D",
        name="Pulo Gebang ⇄ Stasiun Cakung ⇄ Pulo Gadung",
        corridor="Rute Feeder Pengumpan Stasiun KRL",
        service_type="Non-BRT",
        color="#0284c7",
        fare=3500,
        operational_hours="05:00 — 21:30 WIB",
        headway_min=12,
        area="bekasi",
        area_name="Bekasi & Trans Patriot",
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
        area="bekasi",
        area_name="Bekasi & Trans Patriot",
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
        area="bekasi",
        area_name="Bekasi & Trans Patriot",
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
        area="bekasi",
        area_name="Bekasi & Trans Patriot",
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
    # -----------------------------------------------------------------------
    # 2. Koridor Utama BRT Se-Jakarta (1 s/d 14)
    # -----------------------------------------------------------------------
    TransjakartaRoute(
        route_id="1",
        name="Koridor 1: Blok M ⇄ Kota",
        corridor="Koridor Utama BRT 1",
        service_type="BRT",
        color="#dc2626",
        fare=3500,
        operational_hours="24 Jam (05:00—22:00 Reguler, 22:00—05:00 Amari)",
        headway_min=5,
        area="brt_jakarta",
        area_name="Koridor Utama BRT",
        connecting_stations=["JAKK", "MRI"],
        stops=[
            "Blok M (Integrasi MRT Blok M)",
            "Masjid Agung",
            "Bundaran Senayan (Integrasi MRT)",
            "Gelora Bung Karno",
            "Polda Metro Jaya",
            "Bendungan Hilir",
            "Karet Sudirman",
            "Dukuh Atas 1 (Integrasi KRL Sudirman & MRT Dukuh Atas)",
            "Tosari",
            "Bundaran HI",
            "Sarinah",
            "Bank Indonesia",
            "Monumen Nasional (Monas)",
            "Harmoni",
            "Sawah Besar",
            "Mangga Besar",
            "Glodok",
            "Kota (Integrasi KRL Stasiun Jakarta Kota)",
        ],
        description=(
            "Koridor legendaris tulang punggung Jakarta melintasi poros "
            "Sudirman-Thamrin-Monas-Kota Tua."
        ),
    ),
    TransjakartaRoute(
        route_id="2",
        name="Koridor 2: Pulo Gadung ⇄ Monas",
        corridor="Koridor Utama BRT 2",
        service_type="BRT",
        color="#2563eb",
        fare=3500,
        operational_hours="05:00 — 22:00 WIB",
        headway_min=8,
        area="brt_jakarta",
        area_name="Koridor Utama BRT",
        connecting_stations=["PSE", "JUDA"],
        stops=[
            "Pulo Gadung 1",
            "Bermis",
            "Pulo Mas",
            "Cempaka Timur",
            "Cempaka Mas",
            "Rawa Selatan",
            "Galur",
            "Pasar Senen (Integrasi KRL Stasiun Senen)",
            "Kwitang",
            "Balai Kota",
            "Monas (Integrasi Koridor 1, 3)",
        ],
        description=("Menghubungkan Jakarta Timur dengan pusat pemerintahan di Gambir dan Monas."),
    ),
    TransjakartaRoute(
        route_id="3",
        name="Koridor 3: Kalideres ⇄ Monas",
        corridor="Koridor Utama BRT 3",
        service_type="BRT",
        color="#ca8a04",
        fare=3500,
        operational_hours="24 Jam (05:00—22:00 Reguler, 22:00—05:00 Amari)",
        headway_min=7,
        area="brt_jakarta",
        area_name="Koridor Utama BRT",
        connecting_stations=["RBO", "PSG"],
        stops=[
            "Kalideres",
            "Pesakih",
            "Rawa Buaya (Integrasi KRL Rawa Buaya)",
            "Jembatan Baru",
            "Dispenda Samsat Barat",
            "Indosiar",
            "Grogol 1 (Integrasi Koridor 9)",
            "Roxy Flyover",
            "Petojo",
            "Monas",
        ],
        description=("Akses komuter Jakarta Barat (Daan Mogot & Cengkareng) menuju pusat kota."),
    ),
    TransjakartaRoute(
        route_id="4",
        name="Koridor 4: Pulo Gadung ⇄ Galunggung",
        corridor="Koridor Utama BRT 4",
        service_type="BRT",
        color="#7c3aed",
        fare=3500,
        operational_hours="05:00 — 22:00 WIB",
        headway_min=8,
        area="brt_jakarta",
        area_name="Koridor Utama BRT",
        connecting_stations=["MRI", "SUD"],
        stops=[
            "Pulo Gadung 2",
            "Pasar Pulo Gadung",
            "Pemuda Rawamangun",
            "Pramuka BPKP",
            "Matraman 2",
            "Pasar Rumput",
            "Stasiun Manggarai (Integrasi Sentral KRL Manggarai)",
            "Galunggung / Dukuh Atas 2 (Integrasi LRT Jabodebek & KRL Sudirman)",
        ],
        description=(
            "Koneksi langsung dari Rawamangun & Matraman menuju hub transit terbesar "
            "Manggarai dan Dukuh Atas."
        ),
    ),
    TransjakartaRoute(
        route_id="5",
        name="Koridor 5: Kampung Melayu ⇄ Ancol",
        corridor="Koridor Utama BRT 5",
        service_type="BRT",
        color="#d97706",
        fare=3500,
        operational_hours="24 Jam (05:00—22:00 Reguler, 22:00—05:00 Amari)",
        headway_min=8,
        area="brt_jakarta",
        area_name="Koridor Utama BRT",
        connecting_stations=["JNG", "KPB"],
        stops=[
            "Terminal Kampung Melayu",
            "RS Premier Jatinegara",
            "Pasar Jatinegara (Dekat KRL Stasiun Jatinegara)",
            "Matraman 1",
            "Salemba Carolus",
            "Pal Putih",
            "Senen Central",
            "Pasar Baru Timur",
            "Jembatan Merah",
            "Mangga Dua",
            "Ancol",
        ],
        description=(
            "Lintasan utara-selatan timur Jakarta dari Kampung Melayu menyusuri "
            "Salemba, Senen, hingga pesisir Ancol."
        ),
    ),
    TransjakartaRoute(
        route_id="6",
        name="Koridor 6: Ragunan ⇄ Galunggung",
        corridor="Koridor Utama BRT 6",
        service_type="BRT",
        color="#16a34a",
        fare=3500,
        operational_hours="05:00 — 22:00 WIB",
        headway_min=8,
        area="brt_jakarta",
        area_name="Koridor Utama BRT",
        connecting_stations=["SUD"],
        stops=[
            "Ragunan",
            "Departemen Pertanian",
            "SMK 57",
            "Pejaten",
            "Buncit Indah",
            "Mampang Prapatan",
            "Kuningan Barat (Integrasi Koridor 9)",
            "GOR Sumantri (Plaza Festival)",
            "Setiabudi Utara AINI",
            "Galunggung (Integrasi LRT Jabodebek & KRL Sudirman)",
        ],
        description=(
            "Koridor utama Jakarta Selatan melintasi kawasan perkantoran Rasuna Said Kuningan."
        ),
    ),
    TransjakartaRoute(
        route_id="7",
        name="Koridor 7: Kampung Rambutan ⇄ Kampung Melayu",
        corridor="Koridor Utama BRT 7",
        service_type="BRT",
        color="#db2777",
        fare=3500,
        operational_hours="05:00 — 22:00 WIB",
        headway_min=8,
        area="brt_jakarta",
        area_name="Koridor Utama BRT",
        connecting_stations=["CWG"],
        stops=[
            "Terminal Kampung Rambutan",
            "Tanah Merdeka",
            "Flyover Raya Bogor",
            "RS Harapan Bunda",
            "Pasar Kramat Jati",
            "PGC 1 Cililitan",
            "BKN",
            "Cawang UKI",
            "Cawang BNN",
            "Stasiun Cawang (Integrasi KRL Cawang)",
            "Bidara Cina",
            "Terminal Kampung Melayu",
        ],
        description=(
            "Menghubungkan terminal bus luar kota Kampung Rambutan dengan koridor "
            "Cawang dan Kampung Melayu."
        ),
    ),
    TransjakartaRoute(
        route_id="8",
        name="Koridor 8: Lebak Bulus ⇄ Pasar Baru",
        corridor="Koridor Utama BRT 8",
        service_type="BRT",
        color="#0d9488",
        fare=3500,
        operational_hours="05:00 — 22:00 WIB",
        headway_min=8,
        area="brt_jakarta",
        area_name="Koridor Utama BRT",
        connecting_stations=["KBY", "JUDA"],
        stops=[
            "Lebak Bulus (Integrasi MRT Lebak Bulus)",
            "Pondok Pinang",
            "Pondok Indah 1 & 2",
            "Gandaria City",
            "Pasar Kebayoran Lama (Integrasi KRL Kebayoran)",
            "Permata Hijau",
            "Pos Pengumben",
            "Duri Kepa",
            "Kedoya Panjang",
            "Tomang Mandala",
            "Petojo",
            "Pasar Baru",
        ],
        description=(
            "Penghubung kawasan hunian Jakarta Selatan (Pondok Indah, Kebayoran) menuju "
            "Jakarta Pusat."
        ),
    ),
    TransjakartaRoute(
        route_id="9",
        name="Koridor 9: Pinang Ranti ⇄ Pluit",
        corridor="Koridor Utama BRT 9",
        service_type="BRT",
        color="#0284c7",
        fare=3500,
        operational_hours="24 Jam (05:00—22:00 Reguler, 22:00—05:00 Amari)",
        headway_min=6,
        area="brt_jakarta",
        area_name="Koridor Utama BRT",
        connecting_stations=["CWG", "GRG"],
        stops=[
            "Pinang Ranti",
            "Garuda Taman Mini",
            "Cikoko Stasiun Cawang (Integrasi KRL Cawang & LRT)",
            "Tebet Eco Park",
            "Pancoran Barat",
            "Tegal Parang",
            "Kuningan Barat",
            "Gatot Subroto Jamsostek",
            "Komdak Semanggi",
            "Slipi Petamburan",
            "Grogol 2 (Integrasi KRL Grogol)",
            "Jembatan Besi",
            "Penjaringan",
            "Pluit",
        ],
        description=(
            "Koridor terpanjang menyusuri Tol Dalam Kota (Gatot Subroto, S. Parman) "
            "dari timur ke barat."
        ),
    ),
    TransjakartaRoute(
        route_id="10",
        name="Koridor 10: Tanjung Priok ⇄ PGC 2",
        corridor="Koridor Utama BRT 10",
        service_type="BRT",
        color="#991b1b",
        fare=3500,
        operational_hours="05:00 — 22:00 WIB",
        headway_min=9,
        area="brt_jakarta",
        area_name="Koridor Utama BRT",
        connecting_stations=["TPK"],
        stops=[
            "Tanjung Priok (Integrasi KRL Stasiun Tanjung Priok)",
            "Enggano",
            "Plumpang Pertamina",
            "Sunter Kelapa Gading",
            "Cempaka Mas 2",
            "Cempaka Putih",
            "Ahmad Yani Bea Cukai",
            "Utan Kayu Rawamangun",
            "Cawang Soetoyo",
            "PGC 2 Cililitan",
        ],
        description=(
            "Menghubungkan pelabuhan Tanjung Priok dengan koridor By-pass Yos Sudarso dan Cawang."
        ),
    ),
    TransjakartaRoute(
        route_id="11",
        name="Koridor 11: Pulo Gebang ⇄ Kampung Melayu",
        corridor="Koridor Utama BRT 11",
        service_type="BRT",
        color="#2563eb",
        fare=3500,
        operational_hours="24 Jam (05:00—22:00 Reguler, 22:00—05:00 Amari)",
        headway_min=8,
        area="brt_jakarta",
        area_name="Koridor Utama BRT",
        connecting_stations=["CUK", "KLDB", "KLD", "JNG"],
        stops=[
            "Terminal Pulo Gebang",
            "Halte Stasiun Cakung (Skybridge Langsung KRL Cakung)",
            "Penggilingan",
            "Flyover Raden Inten",
            "Buaran",
            "Halte Stasiun Klender (Integrasi Langsung KRL Klender)",
            "Cipinang",
            "Halte Stasiun Jatinegara (Integrasi KRL JNG)",
            "Terminal Kampung Melayu (Integrasi Koridor 5 & 7)",
        ],
        description=(
            "Jalur BRT langsung di sepanjang koridor KRL Cikarang sisi Jakarta Timur "
            "dengan jembatan integrasi skybridge."
        ),
    ),
    TransjakartaRoute(
        route_id="12",
        name="Koridor 12: Pluit ⇄ Tanjung Priok",
        corridor="Koridor Utama BRT 12",
        service_type="BRT",
        color="#65a30d",
        fare=3500,
        operational_hours="05:00 — 22:00 WIB",
        headway_min=10,
        area="brt_jakarta",
        area_name="Koridor Utama BRT",
        connecting_stations=["JAKK", "KPB", "TPK"],
        stops=[
            "Pluit",
            "Landmark Auto Plaza",
            "Museum Fatahillah",
            "Kota (Integrasi KRL Kota)",
            "Mangga Dua",
            "Gunung Sahari Mangga Dua",
            "Kemayoran Landas Pacu",
            "Danau Sunter",
            "Sunter Mall",
            "Tanjung Priok",
        ],
        description=(
            "Rute lingkar pesisir Jakarta Utara menghubungkan Pluit, Kota Tua, Sunter, "
            "dan Tanjung Priok."
        ),
    ),
    TransjakartaRoute(
        route_id="13",
        name="Koridor 13: CBD Ciledug ⇄ Tegal Mampang",
        corridor="Koridor Utama BRT 13 (Jalur Layang)",
        service_type="BRT",
        color="#9333ea",
        fare=3500,
        operational_hours="05:00 — 22:00 WIB",
        headway_min=6,
        area="tangerang",
        area_name="Tangerang & Tangsel",
        connecting_stations=["KBY"],
        stops=[
            "Halte CBD Ciledug (Kota Tangerang)",
            "Puri Beta 2",
            "Puri Beta 1",
            "Petukangan Utara",
            "JORR Cipulir",
            "Cipulir",
            "Seskoal",
            "Kebayoran Lama (Velbak - Integrasi KRL Kebayoran)",
            "Mayestik",
            "CSW ASEAN (Integrasi MRT ASEAN & Koridor 1)",
            "Tegal Mampang (Integrasi Koridor 9)",
        ],
        description=(
            "Jalur layang khusus busway (elevated BRT) bebas macet dari Kota Tangerang "
            "tembus ke Jakarta Selatan."
        ),
    ),
    TransjakartaRoute(
        route_id="14",
        name="Koridor 14: JIS ⇄ Senen Raya",
        corridor="Koridor Utama BRT 14",
        service_type="BRT",
        color="#ea580c",
        fare=3500,
        operational_hours="05:00 — 22:00 WIB",
        headway_min=10,
        area="brt_jakarta",
        area_name="Koridor Utama BRT",
        connecting_stations=["PSE"],
        stops=[
            "Jakarta International Stadium (JIS)",
            "Jembatan Item",
            "Danau Sunter Barat",
            "Kemayoran Landas Pacu Timur",
            "Tanah Tinggi",
            "Pasar Senen (Integrasi KRL Stasiun Pasar Senen)",
            "Senen Raya",
        ],
        description=(
            "Akses terintegrasi stadion internasional JIS menuju pusat transit Senen "
            "dan koridor pusat."
        ),
    ),
    # -----------------------------------------------------------------------
    # 3. Transjabodetabek Bogor, Cibubur & Depok
    # -----------------------------------------------------------------------
    TransjakartaRoute(
        route_id="D11",
        name="Terminal Depok ⇄ BNN Cawang",
        corridor="Transjabodetabek Depok — Jakarta Timur",
        service_type="Non-BRT",
        color="#0284c7",
        fare=3500,
        operational_hours="05:00 — 21:30 WIB",
        headway_min=15,
        area="bogor_depok",
        area_name="Bogor & Depok",
        connecting_stations=["DPB"],
        stops=[
            "Terminal Depok (Dekat KRL Stasiun Depok Baru)",
            "Margonda Raya",
            "Pesona Khayangan",
            "Juanda Depok",
            "Cibubur Junction",
            "Tol Jagorawi",
            "Halte BNN Cawang (Integrasi Koridor 7 & 9)",
        ],
        description=(
            "Rute andalan komuter Kota Depok menyusuri Jl. Juanda dan Tol Jagorawi "
            "menuju hub transit Cawang."
        ),
    ),
    TransjakartaRoute(
        route_id="D21",
        name="Universitas Indonesia ⇄ Lebak Bulus",
        corridor="Transjabodetabek Depok — Jakarta Selatan",
        service_type="Non-BRT",
        color="#0284c7",
        fare=3500,
        operational_hours="05:00 — 22:00 WIB",
        headway_min=15,
        area="bogor_depok",
        area_name="Bogor & Depok",
        connecting_stations=["UI", "UP"],
        stops=[
            "Stasiun UI (Integrasi Langsung KRL UI)",
            "Kampus UP (Stasiun Universitas Pancasila)",
            "Lenteng Agung",
            "Flyover Tanjung Barat",
            "TB Simatupang Antam",
            "Cilandak KKO",
            "Fatmawati",
            "Terminal Lebak Bulus (Integrasi MRT Lebak Bulus)",
        ],
        description=(
            "Koneksi strategis mahasiswa dan komuter dari kampus UI Depok menuju "
            "koridor bisnis TB Simatupang & MRT."
        ),
    ),
    TransjakartaRoute(
        route_id="D31",
        name="Cinere ⇄ Kuningan (Kuningan Timur)",
        corridor="Transjabodetabek Cinere Depok — Rasuna Said",
        service_type="Non-BRT",
        color="#0284c7",
        fare=3500,
        operational_hours="05:30 — 20:30 WIB",
        headway_min=20,
        area="bogor_depok",
        area_name="Bogor & Depok",
        connecting_stations=[],
        stops=[
            "Cinere Mall Depok",
            "Pangkalan Jati",
            "Pondok Labu",
            "Cilandak Marinir",
            "Ampera Garden",
            "Buncit Raya",
            "Kuningan Barat (Integrasi Koridor 9)",
            "Kuningan Timur (Integrasi Koridor 6 & LRT)",
        ],
        description=(
            "Melayani warga Cinere, Gandul, dan Limo Depok menuju segitiga emas Kuningan."
        ),
    ),
    TransjakartaRoute(
        route_id="D32",
        name="Cinere ⇄ Bundaran Senayan",
        corridor="Transjabodetabek Cinere Depok — Senayan",
        service_type="Non-BRT",
        color="#0284c7",
        fare=3500,
        operational_hours="05:30 — 21:00 WIB",
        headway_min=20,
        area="bogor_depok",
        area_name="Bogor & Depok",
        connecting_stations=[],
        stops=[
            "Pasar Segar Cinere",
            "Pondok Labu Raya",
            "Fatmawati Raya",
            "Panglima Polim",
            "Blok M",
            "Bundaran Senayan (Integrasi MRT Bundaran Senayan)",
        ],
        description=(
            "Akses komuter hunian Cinere ke kawasan komersial Blok M dan perkantoran Senayan."
        ),
    ),
    TransjakartaRoute(
        route_id="1K",
        name="Cibubur Junction ⇄ Blok M",
        corridor="Transjabodetabek Cibubur Bogor — Jakarta Selatan",
        service_type="Non-BRT",
        color="#0284c7",
        fare=3500,
        operational_hours="05:00 — 21:00 WIB",
        headway_min=15,
        area="bogor_depok",
        area_name="Bogor & Depok",
        connecting_stations=[],
        stops=[
            "Cibubur Junction (Perbatasan Bogor/Depok/Jaktim)",
            "Tol Jagorawi",
            "Halte Komdak / Polda Metro",
            "Gelora Bung Karno (GBK)",
            "Terminal Blok M (Integrasi MRT & Koridor 1)",
        ],
        description=(
            "Rute cepat warga kawasan Cibubur, Cileungsi, dan sekitarnya menuju pusat "
            "Jakarta Selatan via Tol Jagorawi."
        ),
    ),
    TransjakartaRoute(
        route_id="7V",
        name="Cibubur Junction ⇄ BKN Cawang",
        corridor="Transjabodetabek Cibubur — Cawang",
        service_type="Non-BRT",
        color="#0284c7",
        fare=3500,
        operational_hours="05:00 — 21:30 WIB",
        headway_min=15,
        area="bogor_depok",
        area_name="Bogor & Depok",
        connecting_stations=[],
        stops=[
            "Cibubur Junction",
            "Rest Area Cibubur",
            "Tol Jagorawi",
            "Halte BKN Cawang (Integrasi Koridor 7, 9 & LRT)",
        ],
        description=(
            "Feeder ekspres Tol Jagorawi menghubungkan simpul transit Cibubur dengan hub Cawang."
        ),
    ),
    TransjakartaRoute(
        route_id="1T",
        name="Royaltrans: Cibubur / Bekasi ⇄ Blok M",
        corridor="Bus Eksekutif Premium Transjakarta",
        service_type="Royaltrans",
        color="#7c3aed",
        fare=20000,
        operational_hours="05:30 — 09:00 WIB & 16:30 — 20:30 WIB",
        headway_min=30,
        area="bogor_depok",
        area_name="Bogor & Depok",
        connecting_stations=["BKS"],
        stops=[
            "Cibubur Junction / Mega Bekasi",
            "Tol Jagorawi / Cikampek",
            "Komdak Pancoran",
            "Gelora Bung Karno (GBK)",
            "Terminal Blok M (Integrasi MRT Blok M BCA)",
        ],
        description=(
            "Layanan bus premium ber-AC dengan kursi ergonomis tanpa penumpang "
            "berdiri khusus jam kerja sibuk."
        ),
    ),
    # -----------------------------------------------------------------------
    # 4. Transjabodetabek Tangerang & Tangerang Selatan
    # -----------------------------------------------------------------------
    TransjakartaRoute(
        route_id="13A",
        name="Puri Beta Ciledug ⇄ Blok M",
        corridor="Transjabodetabek Ciledug Tangerang — Blok M",
        service_type="BRT",
        color="#9333ea",
        fare=3500,
        operational_hours="05:00 — 22:00 WIB",
        headway_min=8,
        area="tangerang",
        area_name="Tangerang & Tangsel",
        connecting_stations=[],
        stops=[
            "Halte Puri Beta 2 (Tangerang)",
            "Puri Beta 1",
            "Adam Malik",
            "Velbak Kebayoran Lama",
            "Mayestik",
            "CSW ASEAN (Integrasi MRT ASEAN)",
            "Terminal Blok M",
        ],
        description=(
            "Akses langsung komuter Ciledug Raya menuju pusat perbelanjaan dan terminal "
            "Blok M via jalur layang."
        ),
    ),
    TransjakartaRoute(
        route_id="T11",
        name="Poris Plawad Tangerang ⇄ Bundaran Senayan",
        corridor="Transjabodetabek Kota Tangerang — Senayan",
        service_type="Non-BRT",
        color="#0284c7",
        fare=3500,
        operational_hours="05:00 — 21:00 WIB",
        headway_min=15,
        area="tangerang",
        area_name="Tangerang & Tangsel",
        connecting_stations=["BPR", "PIW"],
        stops=[
            "Terminal Poris Plawad (Integrasi KRL Stasiun Batu Ceper)",
            "Kebon Nanas",
            "Tol Jakarta-Tangerang",
            "Rest Area Karang Tengah",
            "Slipi Petamburan",
            "Gelora Bung Karno",
            "Bundaran Senayan (Integrasi MRT)",
        ],
        description=(
            "Rute utama komuter Kota Tangerang menuju pusat bisnis Sudirman-Senayan via "
            "tol Jakarta-Merak."
        ),
    ),
    TransjakartaRoute(
        route_id="T12",
        name="Poris Plawad Tangerang ⇄ Juanda via Tomang",
        corridor="Transjabodetabek Kota Tangerang — Jakarta Pusat",
        service_type="Non-BRT",
        color="#0284c7",
        fare=3500,
        operational_hours="05:00 — 21:00 WIB",
        headway_min=15,
        area="tangerang",
        area_name="Tangerang & Tangsel",
        connecting_stations=["BPR", "JUDA"],
        stops=[
            "Terminal Poris Plawad",
            "Kebon Nanas Tangerang",
            "Tol Tangerang-Jakarta",
            "Tomang Mandala",
            "Petojo",
            "Monas",
            "Halte Juanda (Integrasi KRL Stasiun Juanda)",
        ],
        description=(
            "Menghubungkan Kota Tangerang langsung ke pusat pemerintahan dan Stasiun KRL Juanda."
        ),
    ),
    TransjakartaRoute(
        route_id="S11",
        name="BSD Serpong ⇄ Jelambar / Grogol",
        corridor="Transjabodetabek Tangerang Selatan — Jakarta Barat",
        service_type="Non-BRT",
        color="#0284c7",
        fare=3500,
        operational_hours="05:00 — 21:00 WIB",
        headway_min=15,
        area="tangerang",
        area_name="Tangerang & Tangsel",
        connecting_stations=["RU"],
        stops=[
            "Terminal BSD Serpong",
            "Teraskota BSD",
            "WTC Serpong",
            "Tol BSD-Jakarta",
            "Kebon Jeruk",
            "S. Parman Central Park",
            "Halte Jelambar / Grogol 2 (Integrasi Koridor 3, 8 & 9)",
        ],
        description=(
            "Menghubungkan kawasan mandiri BSD City dan Serpong Tangsel menuju koridor "
            "barat Jakarta."
        ),
    ),
    TransjakartaRoute(
        route_id="S21",
        name="Ciputat ⇄ CSW / Blok M",
        corridor="Transjabodetabek Ciputat Tangsel — Blok M",
        service_type="Non-BRT",
        color="#0284c7",
        fare=3500,
        operational_hours="05:00 — 22:00 WIB",
        headway_min=12,
        area="tangerang",
        area_name="Tangerang & Tangsel",
        connecting_stations=[],
        stops=[
            "Pool Ciputat (Tangerang Selatan)",
            "UIN Syarif Hidayatullah Jakarta",
            "Pondok Pinang",
            "Radio Dalam",
            "CSW ASEAN (Integrasi MRT ASEAN & Koridor 13)",
            "Terminal Blok M",
        ],
        description=(
            "Koneksi favorit mahasiswa UIN dan warga Ciputat Tangsel menuju simpul MRT "
            "& Transjakarta CSW."
        ),
    ),
    TransjakartaRoute(
        route_id="S22",
        name="Ciputat ⇄ Kampung Rambutan via TB Simatupang",
        corridor="Transjabodetabek Ciputat Tangsel — Jakarta Timur",
        service_type="Non-BRT",
        color="#0284c7",
        fare=3500,
        operational_hours="05:00 — 21:30 WIB",
        headway_min=15,
        area="tangerang",
        area_name="Tangerang & Tangsel",
        connecting_stations=[],
        stops=[
            "Pool Ciputat",
            "Flyover Ciputat",
            "UIN Jakarta",
            "Poins Square Lebak Bulus (Integrasi MRT)",
            "Cilandak Town Square (Citos)",
            "Rancho Indah",
            "Pasar Rebo",
            "Terminal Kampung Rambutan (Integrasi Koridor 7)",
        ],
        description=(
            "Rute menyusuri koridor perkantoran TB Simatupang dari Ciputat Tangsel "
            "tembus ke Kampung Rambutan."
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
