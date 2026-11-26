"use client";
import { useState } from "react";
import { lrtFare } from "@/lib/lrtFare";
import { mrtFare } from "@/lib/mrtFare";
import { BusAlternatives } from "@/components/BusAlternatives";
import { multiStations, multiRoute, multiSources } from "@/lib/multimodal";
const colors={"KRL":"#2563eb","MRT":"#7c3aed","LRT":"#ea580c","Jalan kaki":"#64748b"};
const stations=Object.entries(multiStations).sort((a,b)=>a[1].localeCompare(b[1],"id"));
export function MultimodalPlanner(){
 const [from,setFrom]=useState("");const [to,setTo]=useState("");
 const [q1,setQ1]=useState("");const [q2,setQ2]=useState("");
 const [result,setResult]=useState<{from:string;to:string}|null>(null);
 const [error,setError]=useState("");
 const legs=result?multiRoute(result.from,result.to):null;
 const blocks: {mode:string;from:string;to:string}[]=[];
 for(const l of legs??[]){const last=blocks[blocks.length-1];if(last&&last.mode===l.mode&&last.to===l.from&&l.mode!=="Jalan kaki")last.to=l.to;else blocks.push({mode:l.mode,from:l.from,to:l.to});}
 const fares=blocks.filter(l=>l.mode!=="Jalan kaki").map(l=>({ ...l, price:l.mode==="MRT"?mrtFare(l.from,l.to):l.mode==="LRT"?lrtFare(l.from,l.to):null}));
 const matches=(name:string,q:string)=>name.toLowerCase().includes(q.trim().toLowerCase());
 const field=(label:string,q:string,setQ:(v:string)=>void,value:string,setValue:(v:string)=>void)=><label style={{display:"block",margin:"12px 0"}}>{label}<input aria-label={"Cari "+label} placeholder="Ketik nama atau moda stasiun" value={q} onChange={e=>setQ(e.target.value)} style={{display:"block",width:"100%",padding:10,border:"1px solid #94a3b8",borderRadius:8,background:"transparent",color:"inherit",margin:"6px 0"}}/><select aria-label={label} required value={value} onChange={e=>setValue(e.target.value)} style={{width:"100%"}}><option value="">Pilih stasiun</option>{stations.filter(([id,n])=>id===value||matches(n,q)).map(([id,n])=><option key={id} value={id}>{n}</option>)}</select></label>;
 return <section className="tk-card"><h2>Rute antarmoda</h2><p className="tk-muted">Gabungkan KRL, MRT Jakarta dan LRT Jabodebek. Rute berdasarkan jaringan, bukan jadwal atau waktu tempuh terkonfirmasi. Bus belum masuk algoritma ini.</p>
 <form onSubmit={e=>{e.preventDefault();if(!from||!to||from===to){setError("Pilih dua stasiun berbeda.");return;}setError("");setResult({from,to});}}>
 {field("Stasiun asal",q1,setQ1,from,setFrom)}
 <button type="button" onClick={()=>{setFrom(to);setTo(from);setQ1("");setQ2("");}}>Tukar asal dan tujuan</button>
 {field("Stasiun tujuan",q2,setQ2,to,setTo)}
 <button type="submit" className="tk-primary">Cari rute antarmoda</button></form>
 {error&&<p role="status">{error}</p>}
 {result&&<div aria-live="polite"><h3>{multiStations[result.from]} → {multiStations[result.to]}</h3>
 {!legs?<p>Rute belum tersedia dalam jaringan ini.</p>:<>
 <p>{legs.filter(l=>l.mode!=="Jalan kaki").length} segmen kereta · {legs.filter(l=>l.mode==="Jalan kaki").length} perpindahan jalan kaki</p>
 {legs.map((l,i)=><article key={i} className="tk-place" style={{borderLeft:"4px solid "+colors[l.mode],paddingLeft:12}}><strong>{i+1}. {l.mode} · {l.line}</strong><p>{multiStations[l.from]} → {multiStations[l.to]}</p>{l.toward&&<p>Arah jaringan: {multiStations[l.toward]}</p>}{l.mode==="Jalan kaki"?<p>Ikuti petunjuk integrasi, keluar dan masuk area berbayar bila diperlukan.</p>:<details><summary>{l.stops.length-1} pemberhentian jaringan</summary><ol>{l.stops.map(id=><li key={id}>{multiStations[id]}</li>)}</ol></details>}</article>)}
 <h3>Estimasi biaya per operator</h3>{fares.map((f,i)=><div className="tk-place" key={i}><strong>{f.mode} · {multiStations[f.from]} → {multiStations[f.to]}</strong><p>{typeof f.price==="number"?"Rp"+f.price.toLocaleString("id-ID"):f.price?"Jam sibuk Rp"+f.price.peak.toLocaleString("id-ID")+" · Di luar jam sibuk Rp"+f.price.offPeak.toLocaleString("id-ID"):"Tarif belum tersedia otomatis; cek operator."}</p></div>)}<p className="tk-muted">Tarif MRT dan LRT berdasarkan tabel operator, dengan asumsi transit dalam jaringan yang sama tidak keluar area berbayar. Tarif LRT jam sibuk pada hari kerja 06.00–08.59 dan 16.00–19.59 WIB; akhir pekan dan hari libur memakai tarif di luar jam sibuk. Tarif integrasi, promo dan perubahan kebijakan dapat berbeda. Periksa jadwal masing-masing operator.</p><a href="https://lrtjabodebek.kai.id/informasi-tarif" target="_blank" rel="noreferrer">Tabel tarif LRT resmi</a></>}
 <BusAlternatives from={result.from} to={result.to}/></div>}
 <p><a href="https://www.jakartamrt.co.id/id/tarif-mrt-jakarta" target="_blank" rel="noreferrer">Tabel tarif MRT</a> · <a href={multiSources.MRT} target="_blank" rel="noreferrer">Referensi MRT</a> · <a href={multiSources.LRT} target="_blank" rel="noreferrer">Referensi LRT</a> · <a href={multiSources.dukuh} target="_blank" rel="noreferrer">Integrasi Dukuh Atas</a> · <a href={multiSources.cikoko} target="_blank" rel="noreferrer">Integrasi Cikoko</a></p>
 </section>;
}
