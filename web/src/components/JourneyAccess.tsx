"use client";
import { useState } from "react";
import { stationNames } from "@/lib/network";
import { endpoints, type StationTransitHubResponse, type TransjakartaRoute } from "@/lib/api";
import { useApi } from "@/hooks/useApi";
function directions(station:string,mode:"walking"|"transit"){
 const q=new URLSearchParams({api:"1",destination:"Stasiun KRL "+(stationNames[station]||station)+", Indonesia",travelmode:mode});
 return "https://www.google.com/maps/dir/?"+q.toString();
}
function Hub({id,label,onBus}:{id:string;label:string;onBus:(r:TransjakartaRoute)=>void}){
 const hub=useApi<StationTransitHubResponse>(endpoints.stationTransjakarta(id));
 const info=hub.data?.integration;
 return <article className="tk-place">
 <h3>{label}: {stationNames[id]}</h3>
 <p><a href={directions(id,"walking")} target="_blank" rel="noreferrer">Petunjuk jalan kaki ↗</a> · <a href={directions(id,"transit")} target="_blank" rel="noreferrer">Petunjuk transportasi umum ↗</a></p>
 {hub.loading?<p>Memuat koneksi bus…</p>:hub.error||!info?.routes.length?<p className="tk-muted">Belum ada koneksi bus tercatat di direktori TransitKita. Cek peta dan operator.</p>:<>
 <p className="tk-muted">Referensi koneksi bus: {info.nearest_bus_stop}. Periksa kembali lokasi halte dan arah bus.</p>
 {info.routes.map(r=><button key={r.route_id} type="button" onClick={()=>onBus(r)} style={{display:"block",margin:"6px 0",textAlign:"left"}}>{r.route_id} · {r.name}</button>)}
 </>}
 </article>;
}
export function JourneyAccess({from,to,onBus}:{from:string;to:string;onBus:(r:TransjakartaRoute)=>void}){
 const [status,setStatus]=useState("");const [manual,setManual]=useState("");
 async function share(){
  const url=new URL("/",window.location.origin);url.searchParams.set("from",from);url.searchParams.set("to",to);
  const message="TransitKita: "+stationNames[from]+" → "+stationNames[to];
  setManual("");setStatus("");
  try{
   if(navigator.share){await navigator.share({title:message,text:message,url:url.href});setStatus("Menu berbagi selesai.");}
   else if(navigator.clipboard){await navigator.clipboard.writeText(url.href);setStatus("Tautan perjalanan disalin.");}
   else setManual(url.href);
  }catch(e){if((e as Error).name!=="AbortError"){setManual(url.href);setStatus("Salin tautan secara manual.");}}
 }
 return <section className="tk-card">
 <h2>Akses &amp; koneksi antarmoda</h2>
 <p className="tk-muted">Panduan menuju stasiun dan opsi bus berdasarkan direktori lokal. Bukan jadwal multimoda yang telah terkonfirmasi. Google Maps menentukan titik awal di aplikasinya sendiri.</p>
 <Hub id={from} label="Stasiun awal" onBus={onBus}/><Hub id={to} label="Stasiun tujuan" onBus={onBus}/>
 <button className="tk-primary" type="button" onClick={()=>void share()}>Bagikan rute perjalanan</button>
 <p role="status">{status}</p>{manual&&<input aria-label="Tautan perjalanan" readOnly value={manual} onFocus={e=>e.target.select()} style={{width:"100%"}}/>}
 <small>Tautan hanya berisi kode stasiun asal dan tujuan. Tidak menyertakan GPS atau riwayat Anda.</small>
 </section>;
}
