import type { Station } from "./api";

/**
 * Stasiun KRL di wilayah Bekasi, urut dari barat (arah Jakarta) ke timur.
 * Disalin dari backend/app/stations.py supaya peta koridor bisa dirender
 * statis tanpa menunggu API.
 */
export const BEKASI_STATIONS: Station[] = [
  { id: "KRI", name: "Kranji", region: "Kota Bekasi", is_bekasi: true, order: 1 },
  { id: "BKS", name: "Bekasi", region: "Kota Bekasi", is_bekasi: true, order: 2 },
  { id: "BKST", name: "Bekasi Timur", region: "Kota Bekasi", is_bekasi: true, order: 3 },
  { id: "TB", name: "Tambun", region: "Kab. Bekasi", is_bekasi: true, order: 4 },
  { id: "CIT", name: "Cibitung", region: "Kab. Bekasi", is_bekasi: true, order: 5 },
  { id: "TLM", name: "Metland Telagamurni", region: "Kab. Bekasi", is_bekasi: true, order: 6 },
  { id: "CKR", name: "Cikarang", region: "Kab. Bekasi", is_bekasi: true, order: 7 },
];

export const DEFAULT_STATION = "BKS";

export const isBekasiStation = (id: string | null | undefined) =>
  !!id && BEKASI_STATIONS.some((s) => s.id === id.toUpperCase());

export const findBekasiStation = (id: string) =>
  BEKASI_STATIONS.find((s) => s.id === id.toUpperCase()) ?? null;

/** Tujuan populer untuk perencana perjalanan, ditampilkan paling atas. */
export const POPULAR_DESTINATIONS = ["MRI", "JNG", "SUD", "THB", "JAKK", "KPB", "AK", "PSE", "DU"];
