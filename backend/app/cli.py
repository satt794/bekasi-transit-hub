"""CLI scraper.

Contoh:
    uv run python -m app.cli scrape BKS            # cetak jadwal mentah satu stasiun
    uv run python -m app.cli scrape BKS --json     # dalam format JSON
    uv run python -m app.cli snapshot              # perbarui data/snapshot dari sumber online
"""

from __future__ import annotations

import argparse
import asyncio
import json
import sys
from datetime import datetime

from app.config import WIB, settings
from app.models import RawDeparture
from app.scrapers import ProviderError, build_providers
from app.scrapers.timeparse import clock_str
from app.stations import BEKASI_IDS, CORRIDOR

ONLINE = [name for name in settings.providers if name != "snapshot"]


def _serialize(dep: RawDeparture) -> dict:
    return {
        "train_id": dep.train_id,
        "line": dep.line,
        "origin_id": dep.origin_id,
        "origin_name": dep.origin_name,
        "destination_id": dep.destination_id,
        "destination_name": dep.destination_name,
        "departs": clock_str(dep.departs),
        "arrives": clock_str(dep.arrives) if dep.arrives else None,
        "color": dep.color,
    }


async def _first_success(op):
    providers = [p for p in build_providers(ONLINE) if p.enabled]
    errors = []
    try:
        for provider in providers:
            try:
                return provider.name, await op(provider)
            except ProviderError as exc:
                errors.append(f"{provider.name}: {exc}")
        raise SystemExit(
            "Semua provider online gagal:\n  " + "\n  ".join(errors or ["(tidak ada)"])
        )
    finally:
        for provider in providers:
            await provider.aclose()


async def cmd_scrape(station_id: str, as_json: bool) -> None:
    name, rows = await _first_success(lambda p: p.fetch_schedule(station_id))
    rows = sorted(rows, key=lambda r: r.departs)
    if as_json:
        json.dump([_serialize(r) for r in rows], sys.stdout, ensure_ascii=False, indent=2)
        print()
        return
    print(f"# {station_id.upper()} — {len(rows)} perjalanan (sumber: {name})")
    for r in rows:
        print(f"{clock_str(r.departs)}  {r.train_id:<8} {r.origin_name} → {r.destination_name}")


async def cmd_snapshot() -> None:
    out = settings.snapshot_dir
    (out / "schedules").mkdir(parents=True, exist_ok=True)

    name, stations = await _first_success(lambda p: p.fetch_stations())
    by_id = {s.id: s for s in stations}
    rows = []
    for sid in sorted(by_id):
        st = by_id[sid]
        rows.append({"id": st.id, "name": st.name, "is_bekasi": sid in BEKASI_IDS})
    (out / "stations.json").write_text(json.dumps(rows, ensure_ascii=False, indent=1))
    print(f"stations.json: {len(rows)} stasiun ({name})")

    failed: list[str] = []
    for sid in CORRIDOR:
        try:
            provider_name, deps = await _first_success(lambda p, sid=sid: p.fetch_schedule(sid))
        except SystemExit as exc:
            # Jangan batalkan seluruh snapshot karena satu stasiun; file lama dipertahankan.
            print(f"schedules/{sid}.json: GAGAL — {exc}", file=sys.stderr)
            failed.append(sid)
            continue
        deps = sorted(deps, key=lambda r: r.departs)
        path = out / "schedules" / f"{sid}.json"
        path.write_text(json.dumps([_serialize(d) for d in deps], ensure_ascii=False))
        print(f"schedules/{sid}.json: {len(deps)} perjalanan ({provider_name})")
        await asyncio.sleep(0.5)  # sopan ke server sumber

    meta = {
        "generated_at": datetime.now(WIB).isoformat(timespec="seconds"),
        "provider": name,
        "stations": [sid for sid in CORRIDOR if sid not in failed],
        "failed": failed,
    }
    (out / "meta.json").write_text(json.dumps(meta, indent=2))
    print(f"selesai → {out}")
    if failed:
        raise SystemExit(f"{len(failed)} stasiun gagal: {', '.join(failed)}")


def main() -> None:
    parser = argparse.ArgumentParser(prog="app.cli", description="Scraper jadwal KRL Bekasi")
    sub = parser.add_subparsers(dest="command", required=True)

    scrape = sub.add_parser("scrape", help="Ambil jadwal mentah satu stasiun")
    scrape.add_argument("station", help="Kode stasiun, mis. BKS")
    scrape.add_argument("--json", action="store_true", help="Output JSON")

    sub.add_parser("snapshot", help="Perbarui snapshot fallback di data/snapshot")

    args = parser.parse_args()
    if args.command == "scrape":
        asyncio.run(cmd_scrape(args.station, args.json))
    elif args.command == "snapshot":
        asyncio.run(cmd_snapshot())


if __name__ == "__main__":
    main()
