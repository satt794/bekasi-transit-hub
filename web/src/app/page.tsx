"use client";
import { useEffect, useState } from "react";
import { CardBalance } from "@/components/CardBalance";
import { CrowdGuide } from "@/components/CrowdGuide";
import { MultimodalPlanner } from "@/components/MultimodalPlanner";
import { JourneyAccess } from "@/components/JourneyAccess";
import { FareGuide } from "@/components/FareGuide";
import { JourneyShortcuts, rememberJourney } from "@/components/JourneyShortcuts";
import { networkStations, suggestRoute, stationNames, networkSources } from "@/lib/network";
import { ConnectedJourney } from "@/components/ConnectedJourney";
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
type Tab="Beranda"|"Rute"|"Sekitar"|"Panduan"|"KRL"|"Bus"|"MRT"|"LRT"|"Tarif"|"Antarmoda"|"Saldo";
function Icon({name}:{name:string}){
 const paths:Record<string,ReactNode>={
 wallet:<><rect x="3" y="5" width="18" height="15" rx="3"/><path d="M3 8V6a3 3 0 0 1 3-3h11M21 11h-6a2.5 2.5 0 0 0 0 5h6M16 13.5h.01"/></>,
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
const wibClock=new Intl.DateTimeFormat("en-GB",{timeZone:"Asia/Jakarta",hour:"2-digit",minute:"2-digit",second:"2-digit",hourCycle:"h23"});
const wibDate=new Intl.DateTimeFormat("id-ID",{timeZone:"Asia/Jakarta",weekday:"long",day:"numeric",month:"long",year:"numeric"});
const guides=["Pilih stasiun asal dan tujuan pada menu Rute.","Periksa tujuan akhir kereta dan informasi keberangkatan. Siapkan metode pembayaran yang diterima operator.","Ikuti papan petunjuk dan konfirmasi peron kepada petugas. Jangan mengandalkan perkiraan peron.","Jika perlu berganti kereta, ikuti petunjuk transit dan periksa arah kereta berikutnya.","Setelah tiba, gunakan menu Sekitar untuk mencari halte atau patokan penjemputan."];
export default function DashboardPage(){
 const [tab,setTab]=useState<Tab>("Beranda");
 const [selection,setSelection]=useState({origin:"",destination:""});const {origin,destination}=selection;
 const setOrigin=(origin:string)=>setSelection(prev=>({...prev,origin}));const setDestination=(destination:string)=>setSelection(prev=>({...prev,destination}));
 const [originFilter,setOriginFilter]=useState("");const [destinationFilter,setDestinationFilter]=useState("");
 const [query,setQuery]=useState<{from:string;to:string}|null>(null);
 const [stationId,setStationId]=useState("BKS");
 const [expanded,setExpanded]=useState(false);
 const [train,setTrain]=useState<Departure|null>(null);
 const [bus,setBus]=useState<TransjakartaRoute|null>(null);
 const [step,setStep]=useState(0);
 const [notice,setNotice]=useState("");
 useEffect(()=>{const p=new URLSearchParams(window.location.search);const from=p.get("from")||"",to=p.get("to")||"";if(Object.prototype.hasOwnProperty.call(stationNames,from)&&Object.prototype.hasOwnProperty.call(stationNames,to)&&from!==to){setSelection({origin:from,destination:to});setQuery({from,to});setTab("Rute");}},[]);
 const now=useNow();
 const wp=now===null?[]:new Intl.DateTimeFormat("en-GB",{timeZone:"Asia/Jakarta",weekday:"short",hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).formatToParts(now);const part=(k:string)=>wp.find(p=>p.type===k)?.value;const minute=Number(part("hour"))*60+Number(part("minute"));const weekday=!!part("weekday")&&!["Sat","Sun"].includes(part("weekday")!);const crowdLabel=now===null?"Memuat waktu":!weekday?"Akhir pekan":minute>=330&&minute<450?"Jam sibuk acuan (pagi)":minute>=960&&minute<1080?"Jam sibuk acuan (sore)":"Di luar jam sibuk acuan";
 const stations=useApi<StationsResponse>(endpoints.stations());
 const all=networkStations(stations.data?.all??BEKASI_STATIONS);
 const schedule=useApi<DeparturesResponse>(tab==="KRL"?endpoints.departures(stationId,expanded?16:8):null,15000);
 const trips=useApi<TripsResponse>(tab==="Rute"&&query?endpoints.trips(query.from,query.to,8):null,30000);
 const suggested=query?suggestRoute(query.from,query.to):null;
 const station=schedule.data?.station||all.find(s=>s.id===stationId)||BEKASI_STATIONS[1];
 function go(t:Tab){setTab(t);setNotice("");window.scrollTo({top:0,behavior:"instant"});}
 function openJourney(from:string,to:string){if(!from||!to||from===to)return;setSelection({origin:from,destination:to});setOriginFilter("");setDestinationFilter("");setQuery({from,to});const url=new URL(window.location.href);url.searchParams.set("from",from);url.searchParams.set("to",to);window.history.replaceState(null,"",url);rememberJourney({from,to});go("Rute");}
 function search(){if(!origin||!destination||origin===destination){setNotice("Pilih dua stasiun yang berbeda.");return;}openJourney(origin,destination);}
 const matchStation=(s:{id:string;name:string},filter:string,selected:string)=>s.id===selected||(s.name+" "+s.id).toLocaleLowerCase("id").includes(filter.trim().toLocaleLowerCase("id"));
 const planner=<form className="tk-card tk-planner" onSubmit={e=>{e.preventDefault();search();}}>
 <h2><Icon name="route"/> Rencanakan perjalanan</h2><p className="tk-muted">Cari nama stasiun KRL, lalu pilih dari daftar. Untuk MRT dan LRT gunakan Rute antarmoda.</p><button type="button" className="tk-locate-link" onClick={()=>go("Sekitar")}><Icon name="map"/> Cari stasiun dari lokasi saya</button>
 <input aria-label="Cari stasiun asal" placeholder="Berangkat dari? (nama stasiun)" value={originFilter} onChange={e=>setOriginFilter(e.target.value)} style={{width:"100%",padding:10,border:"1px solid var(--border, #cbd5e1)",borderRadius:10,background:"transparent",color:"inherit"}}/>
 <label className="tk-field"><span className="tk-origin"><Icon name="dot"/></span><span>Berangkat dari<select required value={origin} onChange={e=>setOrigin(e.target.value)}><option value="">Pilih stasiun awal</option>{all.filter(s=>matchStation(s,originFilter,origin)).map(s=><option value={s.id} key={s.id}>{s.name} ({s.id})</option>)}</select></span></label>
 <button type="button" className="tk-swap" aria-label="Tukar asal dan tujuan" onClick={()=>{setSelection(prev=>({origin:prev.destination,destination:prev.origin}));setOriginFilter("");setDestinationFilter("");}}><Icon name="swap"/></button>
 <input aria-label="Cari stasiun tujuan" placeholder="Mau ke mana? (nama stasiun)" value={destinationFilter} onChange={e=>setDestinationFilter(e.target.value)} style={{width:"100%",padding:10,border:"1px solid var(--border, #cbd5e1)",borderRadius:10,background:"transparent",color:"inherit"}}/>
 <label className="tk-field"><span className="tk-dest"><Icon name="map"/></span><span>Tujuan perjalanan<select required value={destination} onChange={e=>setDestination(e.target.value)}><option value="">Pilih stasiun tujuan</option>{all.filter(s=>matchStation(s,destinationFilter,destination)).map(s=><option value={s.id} key={s.id}>{s.name} ({s.id})</option>)}</select></span></label>
 {stations.error&&<p className="tk-muted">API stasiun belum tersedia. Menampilkan direktori jaringan lokal; jadwal mungkin tidak tersedia.</p>}
 <button className="tk-primary" type="submit"><Icon name="search"/> Cari perjalanan</button>
 {notice&&<p role="status">{notice}</p>}
 </form>;
 return <div className="tk-shell">
 <header className="tk-header"><div className="tk-headerinner"><div className="tk-brand"><Icon name="train"/><strong>TransitKita</strong><nav className="tk-nav" aria-label="Navigasi utama">{([{n:"Beranda",i:"home"},{n:"Rute",i:"route"},{n:"Sekitar",i:"map"},{n:"Panduan",i:"book"}] as const).map(t=><button key={t.n} aria-current={(tab===t.n||(t.n==="Rute"&&["Antarmoda","KRL","Bus","MRT","LRT"].includes(tab))||(t.n==="Beranda"&&["Saldo","Tarif"].includes(tab)))?"page":undefined} onClick={()=>go(t.n)}><Icon name={t.i}/>{t.n}</button>)}</nav><div className="tk-theme"><ThemeToggle/></div></div><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap",marginTop:12}}><p style={{margin:0}}>Jelajahi Jabodetabek</p><div style={{display:"flex",alignItems:"center",gap:9,border:"1px solid #ffffff40",borderRadius:12,padding:"7px 11px",background:"#ffffff12",color:"#fff"}}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg><div><div style={{fontSize:17,fontWeight:700,fontVariantNumeric:"tabular-nums",whiteSpace:"nowrap",lineHeight:1.2}}><time dateTime={now===null?undefined:new Date(now).toISOString()}>{now===null?"--:--:--":wibClock.format(now)}</time> <span style={{fontSize:10,fontWeight:500}}>WIB</span></div><div style={{fontSize:10,opacity:.9}}>{now===null?"Waktu Jakarta":wibDate.format(now)}</div><div className="tk-clock-status" title="Pola hari kerja, bukan kondisi lalu lintas aktual">{crowdLabel}</div></div></div></div><h1>{tab==="Beranda"?"Mau ke mana hari ini?":tab==="Sekitar"?"Transportasi di sekitar":tab==="Panduan"?"Panduan perjalanan":tab==="KRL"?"Jadwal KRL":tab==="Bus"?"Informasi bus":tab==="MRT"?"MRT Jakarta":tab==="LRT"?"LRT Jabodebek":tab==="Tarif"?"Tarif dan pembayaran":tab==="Antarmoda"?"Rute antarmoda":tab==="Saldo"?"Cek saldo terakhir":"Cari rute perjalanan"}</h1><small>Temukan perjalananmu tanpa ribet.</small></div></header>
 <main className="tk-main" data-view={tab}>
 {tab==="Beranda"&&<div className="tk-home-layout"><div className="tk-home-left">{planner}<section className="tk-quick"><div className="tk-quick-heading"><h2>Akses cepat</h2><small>Siapkan perjalananmu</small></div><div className="tk-quick-grid">{([{tab:"Saldo",icon:"wallet",title:"Cek saldo terakhir",desc:"Hitung sisa saldo"},{tab:"Antarmoda",icon:"route",title:"Rute antarmoda",desc:"KRL, MRT & LRT"},{tab:"Tarif",icon:"book",title:"Tarif perjalanan",desc:"Cek biaya & pembayaran"},{tab:"Sekitar",icon:"map",title:"Transportasi sekitar",desc:"Cari halte & stasiun"}] as const).map(a=><button type="button" key={a.tab} onClick={()=>go(a.tab)}><span className="tk-quick-icon"><Icon name={a.icon}/></span><span><strong>{a.title}</strong><small>{a.desc}</small></span><span aria-hidden="true" className="tk-quick-chevron">›</span></button>)}</div></section><section className="tk-mode-section"><div className="tk-sectionhead"><h2>Pilih transportasi</h2><button onClick={()=>go("KRL")}>Lihat jadwal</button></div><div className="tk-modes">{([{n:"KRL",i:"train",c:"rail",logo:"https://upload.wikimedia.org/wikipedia/commons/f/f2/Logo_KAI_Commuter.svg"},{n:"Bus",i:"bus",c:"bus",logo:"https://upload.wikimedia.org/wikipedia/commons/d/de/TransJakarta_Logo_%28cropped%29.svg"},{n:"MRT",i:"train",c:"mrt",logo:"https://upload.wikimedia.org/wikipedia/commons/d/d4/MRT_Jakarta_%28logo_only%29.svg"},{n:"LRT",i:"train",c:"lrt",logo:"https://upload.wikimedia.org/wikipedia/commons/3/3b/Jabodebek_LRT.svg"}]).map(m=><button className="tk-mode-brand" data-mode={m.n} aria-label={m.n==="Bus"?"Transjakarta (TJ)":m.n==="LRT"?"LRT Jabodebek":m.n==="MRT"?"MRT Jakarta":"KRL Commuter Line"} key={m.n} onClick={()=>{go(m.n as Tab);}}><span className={m.c}><img alt="" src={m.logo} referrerPolicy="no-referrer" onError={e=>{e.currentTarget.style.display="none";e.currentTarget.nextElementSibling?.removeAttribute("hidden");}}/><span className="tk-mode-fallback" hidden>{m.n==="Bus"?"TJ":m.n}</span></span><strong>{m.n==="Bus"?"TJ":m.n}</strong></button>)}</div><p className="tk-muted">Pilih moda untuk informasi perjalanan dan tarif.</p></section><button className="tk-guide tk-beginner" onClick={()=>go("Panduan")}><Icon name="book"/><span><strong>Pertama kali naik transportasi umum?</strong><small>Pelajari cara naik, transit, dan sampai tujuan dengan mudah.</small><b>Lihat Panduan →</b></span></button><JourneyShortcuts from={origin} to={destination} onOpen={openJourney}/></div><aside className="tk-home-right" aria-label="Informasi transportasi sekitar"><NearbyTransit compact onOpen={()=>go("Sekitar")}/><CrowdGuide now={now}/></aside></div>}
 {tab==="Rute"&&planner}
 {tab==="Rute"&&<JourneyShortcuts from={origin} to={destination} onOpen={openJourney}/>}

 {tab==="Sekitar"&&<NearbyTransit/>}
 
 {tab==="Tarif"&&<FareGuide/>}
 {tab==="Saldo"&&<CardBalance/>}
 {(tab==="KRL"||tab==="Rute")&&<CrowdGuide now={now}/>}
 {(tab==="Tarif"||tab==="Rute")&&<button className="tk-guide" onClick={()=>go("Saldo")}><Icon name="wallet"/><span><strong>Cek saldo terakhir</strong><small>Masukkan saldo awal, hitung biaya perjalanan, dan lihat estimasi sisa saldo.</small></span></button>}
 {tab==="Antarmoda"&&<MultimodalPlanner/>}
 {(tab==="Rute"||tab==="MRT"||tab==="LRT")&&<button className="tk-guide" onClick={()=>go("Antarmoda")}><Icon name="route"/><span><strong>Rute antarmoda KRL, MRT &amp; LRT</strong><small>Cari perjalanan lintas jaringan kereta.</small></span></button>}
 {tab==="MRT"&&<><FareGuide mode="MRT Jakarta"/><section className="tk-card"><h2>Informasi perjalanan MRT</h2><p>Jadwal dan rute resmi tersedia melalui operator. Jadwal otomatis MRT belum terintegrasi.</p><a href="https://jakartamrt.co.id/" target="_blank" rel="noreferrer">Buka situs MRT Jakarta</a></section><button className="tk-primary" onClick={()=>go("Sekitar")}>Cari stasiun sekitar</button></>}
 {tab==="LRT"&&<><FareGuide mode="LRT Jabodebek"/><section className="tk-card"><h2>Informasi perjalanan LRT</h2><p>Lin Bekasi dan Lin Cibubur. Jadwal otomatis belum terintegrasi.</p><a href="https://lrtjabodebek.kai.id/jadwal-keberangkatan" target="_blank" rel="noreferrer">Lihat jadwal resmi LRT Jabodebek</a></section><button className="tk-primary" onClick={()=>go("Sekitar")}>Cari stasiun sekitar</button></>}
 {tab==="Rute"&&query&&<section className="tk-card"><h2>Hasil perjalanan</h2><p className="tk-muted">Jadwal kereta langsung berdasarkan penyedia data, bukan posisi kereta langsung.</p>{trips.loading?<p>Memuat jadwal…</p>:trips.error?<p>Jadwal tidak dapat dimuat. Coba lagi. <button onClick={trips.reload}>Muat ulang</button></p>:!trips.data?.trips.length?<p>Belum ditemukan jadwal kereta langsung. Lihat panduan jaringan di bawah.</p>:trips.data.trips.map(t=><article className="tk-place" key={t.train_id+t.departs_at}><strong>{t.destination_name} · KA {t.train_id}</strong><p>{formatClock(t.departs_at)} → {formatClock(t.arrives_at)} WIB · {formatDuration(t.duration_min)}</p><button onClick={()=>setTrain({train_id:t.train_id,line:t.line,origin_id:query.from,origin_name:trips.data!.origin.name,destination_id:query.to,destination_name:t.destination_name,departs_at:t.departs_at,arrives_at:t.arrives_at,direction:"jakarta",color:t.color,is_passenger:true})}>Detail kereta</button></article>)}{suggested&&suggested.length>1&&<ConnectedJourney key={query.from+":"+query.to} from={query.from} to={query.to}/>}{suggested&&<div className="tk-network"><h3>Panduan rute jaringan · {suggested.length-1} transit</h3><p className="tk-muted">Rute berdasarkan konektivitas, bukan jadwal terkonfirmasi. Periksa tujuan kereta, pola berhenti, dan jam operasi sebelum naik.</p>{suggested.map((leg,i)=><article className="tk-place" key={i}><strong>{i? "Transit di ":"Berangkat dari "}{stationNames[leg.from]}</strong><p>Lin {leg.line} · arah {stationNames[leg.toward]}</p><p>Turun di {stationNames[leg.to]}</p><details><summary>{leg.stops.length-1} pemberhentian jaringan</summary><ol>{leg.stops.map(s=><li key={s}>{stationNames[s]}</li>)}</ol></details></article>)}<a href={networkSources[0]} target="_blank" rel="noreferrer">Peta dan panduan operator</a></div>}{trips.data&&<p className="tk-muted">Sumber: {trips.data.source.provider} · {trips.data.source.stale?"Data cadangan / mungkin kedaluwarsa":"Data jadwal"} · {formatClock(trips.data.source.fetched_at)} WIB</p>}</section>}
 {tab==="Rute"&&query&&<JourneyAccess key={query.from+":"+query.to} from={query.from} to={query.to} onBus={setBus}/>}
 {(tab==="KRL"||tab==="Bus")&&<><div className="tk-card"><label>Stasiun<select value={stationId} onChange={e=>setStationId(e.target.value)}>{all.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label></div>{tab==="KRL"?<><p className="tk-muted">Jadwal terbit, bukan pelacakan GPS kereta. Konfirmasi peron di stasiun.</p><StationSummary station={station} summary={schedule.data?.summary||null} loading={schedule.loading} now={now}/><DepartureBoard data={schedule.data?{...schedule.data,departures:{jakarta:schedule.data.departures.jakarta.map(d=>({...d,platform:null})),cikarang:schedule.data.departures.cikarang.map(d=>({...d,platform:null}))}}:null} loading={schedule.loading} error={schedule.error} now={now} expanded={expanded} onToggleExpanded={()=>setExpanded(v=>!v)} onSelectTrain={setTrain} onRetry={schedule.reload}/></>:<TransjakartaSection currentStation={station} onSelectRoute={setBus}/>}</>}
 {tab==="Panduan"&&<section className="tk-card tk-steps"><h2>Panduan pengguna pemula</h2><p>Langkah {step+1} dari {guides.length}</p><progress value={step+1} max={guides.length}/><ol>{guides.map((g,i)=><li key={g} aria-current={i===step?"step":undefined}>{g}</li>)}</ol><button className="tk-primary" onClick={()=>step===guides.length-1?go("Sekitar"):setStep(s=>s+1)}>{step===guides.length-1?"Cari transportasi sekitar":"Langkah berikutnya"}</button><button onClick={()=>setStep(s=>Math.max(0,s-1))} disabled={step===0}>Kembali</button></section>}
 <footer className="tk-footer">TransitKita · Perjalanan lebih mudah, ke mana saja.</footer>
 </main>

 {train&&<TrainModal train={train} now={now} onClose={()=>setTrain(null)}/>}
 {bus&&<TransjakartaModal route={bus} onClose={()=>setBus(null)}/>}
 </div>;
}
