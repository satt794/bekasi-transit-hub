"use client";
import { useState } from "react";
import { networkStations, suggestRoute, stationNames, networkSources } from "@/lib/network";
import { NearbyTransit } from "@/components/NearbyTransit";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DepartureBoard } from "@/components/DepartureBoard";
import { StationSummary } from "@/components/StationSummary";
import { TrainModal } from "@/components/TrainModal";
import { TransjakartaModal } from "@/components/TransjakartaModal";
import { TransjakartaSection } from "@/components/TransjakartaSection";
import { endpoints, type Departure, type DeparturesResponse, type StationsResponse, type TransjakartaRoute, type TripsResponse } from "@/lib/api";
import { BEKASI_STATIONS } from "@/lib/stations";
import { useApi } from "@/hooks/useApi";
import { useNow } from "@/hooks/useNow";
import { formatClock, formatDuration } from "@/lib/time";
import type { ReactNode } from "react";
type Tab="Beranda"|"Rute"|"Sekitar"|"Panduan"|"KRL"|"Bus";
function Icon({name}:{name:string}){
 const paths:Record<string,ReactNode>={
 train:<><rect x="5" y="3" width="14" height="16" rx="4"/><path d="M5 11h14M9 19l-3 3m9-3 3 3M9 15h.01M15 15h.01"/></>,
 bus:<><rect x="4" y="3" width="16" height="16" rx="3"/><path d="M4 11h16M7 19v3m10-3v3M8 15h.01M16 15h.01"/></>,
 home:<><path d="m3 10 9-7 9 7v11H3zM9 21v-8h6v8"/></>,
 route:<><circle cx="5" cy="5" r="2"/><circle cx="19" cy="19" r="2"/><path d="M7 5h9a4 4 0 0 1 0 8H8a3 3 0 0 0 0 6h9"/></>,
 map:<><path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
 book:<><path d="M12 5v16M3 3c4-1 7 0 9 2 2-2 5-3 9-2v16c-4-1-7 0-9 2-2-2-5-3-9-2z"/></>,
 search:<><circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/></>,
 swap:<path d="M8 3v18m-4-4 4 4 4-4M16 21V3m-4 4 4-4 4 4"/>,
 dot:<><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2"/></>};
 return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]||paths.train}</svg>;
}
const guides=["Pilih stasiun asal dan tujuan pada menu Rute.","Periksa tujuan akhir kereta dan informasi keberangkatan. Siapkan metode pembayaran yang diterima operator.","Ikuti papan petunjuk dan konfirmasi peron kepada petugas. Jangan mengandalkan perkiraan peron.","Jika perlu berganti kereta, ikuti petunjuk transit dan periksa arah kereta berikutnya.","Setelah tiba, gunakan menu Sekitar untuk mencari halte atau patokan penjemputan."];
export default function DashboardPage(){
 const [tab,setTab]=useState<Tab>("Beranda");
 const [origin,setOrigin]=useState("");const [destination,setDestination]=useState("");
 const [query,setQuery]=useState<{from:string;to:string}|null>(null);
 const [stationId,setStationId]=useState("BKS");
 const [expanded,setExpanded]=useState(false);
 const [train,setTrain]=useState<Departure|null>(null);
 const [bus,setBus]=useState<TransjakartaRoute|null>(null);
 const [step,setStep]=useState(0);
 const [notice,setNotice]=useState("");
 const now=useNow();
 const stations=useApi<StationsResponse>(endpoints.stations());
 const all=networkStations(stations.data?.all??BEKASI_STATIONS);
 const schedule=useApi<DeparturesResponse>(tab==="KRL"?endpoints.departures(stationId,expanded?16:8):null,15000);
 const trips=useApi<TripsResponse>(tab==="Rute"&&query?endpoints.trips(query.from,query.to,8):null,30000);
 const suggested=query?suggestRoute(query.from,query.to):null;
 const station=schedule.data?.station||all.find(s=>s.id===stationId)||BEKASI_STATIONS[1];
 function go(t:Tab){setTab(t);setNotice("");window.scrollTo({top:0,behavior:"instant"});}
 function search(){if(!origin||!destination||origin===destination){setNotice("Pilih dua stasiun yang berbeda.");return;}setQuery({from:origin,to:destination});go("Rute");}
 const planner=<form className="tk-card tk-planner" onSubmit={e=>{e.preventDefault();search();}}>
 <h2><Icon name="route"/> Rencanakan perjalanan</h2>
 <label className="tk-field"><span className="tk-origin"><Icon name="dot"/></span><span>Berangkat dari<select required value={origin} onChange={e=>setOrigin(e.target.value)}><option value="">Lokasi atau stasiun awal</option>{all.map(s=><option value={s.id} key={s.id}>{s.name} ({s.id})</option>)}</select></span></label>
 <button type="button" className="tk-swap" aria-label="Tukar asal dan tujuan" onClick={()=>{setOrigin(destination);setDestination(origin);}}><Icon name="swap"/></button>
 <label className="tk-field"><span className="tk-dest"><Icon name="map"/></span><span>Tujuan perjalanan<select required value={destination} onChange={e=>setDestination(e.target.value)}><option value="">Mau ke mana?</option>{all.map(s=><option value={s.id} key={s.id}>{s.name} ({s.id})</option>)}</select></span></label>
 {stations.error&&<p className="tk-muted">API stasiun belum tersedia. Menampilkan direktori jaringan lokal; jadwal mungkin tidak tersedia.</p>}
 <button className="tk-primary" type="submit"><Icon name="search"/> Cari perjalanan</button>
 {notice&&<p role="status">{notice}</p>}
 </form>;
 return <div className="tk-shell">
 <header className="tk-header"><div className="tk-headerinner"><div className="tk-brand"><Icon name="train"/><strong>TransitKita</strong><div className="tk-theme"><ThemeToggle/></div></div><p>Jelajahi Jabodetabek</p><h1>{tab==="Beranda"?"Mau ke mana hari ini?":tab==="Sekitar"?"Transportasi di sekitar":tab==="Panduan"?"Panduan perjalanan":tab==="KRL"?"Jadwal KRL":tab==="Bus"?"Informasi bus":"Cari rute perjalanan"}</h1><small>Temukan perjalananmu tanpa ribet.</small></div></header>
 <main className="tk-main">
 {(tab==="Beranda"||tab==="Rute")&&planner}
 {tab==="Beranda"&&<><section><div className="tk-sectionhead"><h2>Pilih transportasi</h2><button onClick={()=>go("KRL")}>Lihat jadwal</button></div><div className="tk-modes">{([{n:"KRL",i:"train",c:"rail"},{n:"Bus",i:"bus",c:"bus"},{n:"MRT",i:"train",c:"mrt"},{n:"LRT",i:"train",c:"lrt"}]).map(m=><button key={m.n} onClick={()=>{if(m.n==="KRL"||m.n==="Bus")go(m.n);else{go("Sekitar");}}}><span className={m.c}><Icon name={m.i}/></span>{m.n}</button>)}</div><p className="tk-muted">Jadwal MRT/LRT belum terintegrasi; gunakan peta sekitar untuk mencari stasiun.</p></section><NearbyTransit compact onOpen={()=>go("Sekitar")}/><button className="tk-guide" onClick={()=>go("Panduan")}><Icon name="book"/><span><strong>Pertama kali naik transportasi umum?</strong><small>Pelajari cara naik, transit, dan sampai tujuan dengan mudah.</small><b>Lihat panduan →</b></span></button></>}
 {tab==="Sekitar"&&<NearbyTransit/>}
 {tab==="Rute"&&query&&<section className="tk-card"><h2>Hasil perjalanan</h2><p className="tk-muted">Jadwal kereta langsung berdasarkan penyedia data, bukan posisi kereta langsung.</p>{trips.loading?<p>Memuat jadwal…</p>:trips.error?<p>Jadwal tidak dapat dimuat. Coba lagi. <button onClick={trips.reload}>Muat ulang</button></p>:!trips.data?.trips.length?<p>Belum ditemukan jadwal kereta langsung. Lihat panduan jaringan di bawah.</p>:trips.data.trips.map(t=><article className="tk-place" key={t.train_id+t.departs_at}><strong>{t.destination_name} · KA {t.train_id}</strong><p>{formatClock(t.departs_at)} → {formatClock(t.arrives_at)} WIB · {formatDuration(t.duration_min)}</p><button onClick={()=>setTrain({train_id:t.train_id,line:t.line,origin_id:query.from,origin_name:trips.data!.origin.name,destination_id:query.to,destination_name:t.destination_name,departs_at:t.departs_at,arrives_at:t.arrives_at,direction:"jakarta",color:t.color,is_passenger:true})}>Detail kereta</button></article>)}{suggested&&<div className="tk-network"><h3>Panduan rute jaringan · {suggested.length-1} transit</h3><p className="tk-muted">Rute berdasarkan konektivitas, bukan jadwal terkonfirmasi. Periksa tujuan kereta, pola berhenti, dan jam operasi sebelum naik.</p>{suggested.map((leg,i)=><article className="tk-place" key={i}><strong>{i? "Transit di ":"Berangkat dari "}{stationNames[leg.from]}</strong><p>Lin {leg.line} · arah {stationNames[leg.toward]}</p><p>Turun di {stationNames[leg.to]}</p><details><summary>{leg.stops.length-1} pemberhentian jaringan</summary><ol>{leg.stops.map(s=><li key={s}>{stationNames[s]}</li>)}</ol></details></article>)}<a href={networkSources[0]} target="_blank" rel="noreferrer">Peta dan panduan operator</a></div>}{trips.data&&<p className="tk-muted">Sumber: {trips.data.source.provider} · {trips.data.source.stale?"Data cadangan / mungkin kedaluwarsa":"Data jadwal"} · {formatClock(trips.data.source.fetched_at)} WIB</p>}</section>}
 {(tab==="KRL"||tab==="Bus")&&<><div className="tk-card"><label>Stasiun<select value={stationId} onChange={e=>setStationId(e.target.value)}>{all.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label></div>{tab==="KRL"?<><p className="tk-muted">Jadwal terbit, bukan pelacakan GPS kereta. Konfirmasi peron di stasiun.</p><StationSummary station={station} summary={schedule.data?.summary||null} loading={schedule.loading} now={now}/><DepartureBoard data={schedule.data?{...schedule.data,departures:{jakarta:schedule.data.departures.jakarta.map(d=>({...d,platform:null})),cikarang:schedule.data.departures.cikarang.map(d=>({...d,platform:null}))}}:null} loading={schedule.loading} error={schedule.error} now={now} expanded={expanded} onToggleExpanded={()=>setExpanded(v=>!v)} onSelectTrain={setTrain} onRetry={schedule.reload}/></>:<TransjakartaSection currentStation={station} onSelectRoute={setBus}/>}</>}
 {tab==="Panduan"&&<section className="tk-card tk-steps"><h2>Panduan pengguna pemula</h2><p>Langkah {step+1} dari {guides.length}</p><progress value={step+1} max={guides.length}/><ol>{guides.map((g,i)=><li key={g} aria-current={i===step?"step":undefined}>{g}</li>)}</ol><button className="tk-primary" onClick={()=>step===guides.length-1?go("Sekitar"):setStep(s=>s+1)}>{step===guides.length-1?"Cari transportasi sekitar":"Langkah berikutnya"}</button><button onClick={()=>setStep(s=>Math.max(0,s-1))} disabled={step===0}>Kembali</button></section>}
 <footer className="tk-footer">TransitKita · Perjalanan lebih mudah, ke mana saja.</footer>
 </main>
 <nav className="tk-nav" aria-label="Navigasi utama">{([{n:"Beranda",i:"home"},{n:"Rute",i:"route"},{n:"Sekitar",i:"map"},{n:"Panduan",i:"book"}] as const).map(t=><button key={t.n} aria-current={tab===t.n?"page":undefined} onClick={()=>go(t.n)}><Icon name={t.i}/>{t.n}</button>)}</nav>
 {train&&<TrainModal train={train} now={now} onClose={()=>setTrain(null)}/>}
 {bus&&<TransjakartaModal route={bus} onClose={()=>setBus(null)}/>}
 </div>;
}
