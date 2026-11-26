"use client";
import {useApi} from "@/hooks/useApi";
import {endpoints,type TransjakartaResponse} from "@/lib/api";
import {multiStations} from "@/lib/multimodal";
export function BusAlternatives({from,to}:{from:string;to:string}){
 const data=useApi<TransjakartaResponse>(endpoints.transjakartaRoutes());
 const matches=data.data?.routes.filter(r=>r.connecting_stations.includes(from)&&r.connecting_stations.includes(to))??[];
 return <details className="tk-place"><summary>Alternatif bus dari direktori</summary>
 <p className="tk-muted">Hanya mencocokkan kode stasiun yang tercatat pada kedua ujung rute. Bukan rute jalan kaki, arah, jadwal, atau sambungan yang telah diverifikasi.</p>
 {data.loading?<p>Memuat direktori…</p>:data.error?<p>Direktori belum tersedia.</p>:!matches.length?<p>Belum ada rute bus yang mencantumkan kedua stasiun ini.</p>:matches.map(r=><article key={r.route_id} className="tk-place"><strong>{r.route_id} · {r.name}</strong><p>{multiStations[from]} – {multiStations[to]}</p><p>Tarif tercatat: Rp{r.fare.toLocaleString("id-ID")} (cek operator)</p><details><summary>Daftar halte referensi</summary><ul>{r.stops.map((s,i)=><li key={i}>{s}</li>)}</ul></details></article>)}
 <a href="https://transjakarta.co.id/" target="_blank" rel="noreferrer">Verifikasi rute di situs Transjakarta</a>
 </details>;
}
