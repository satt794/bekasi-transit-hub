"use client";
import { useSyncExternalStore } from "react";
import { stationNames } from "@/lib/network";
type Journey={from:string;to:string};
type Saved={recent:Journey[];favorites:Journey[]};
const KEY="transitkita:journeys:v1";
const EVENT="transitkita:journeys";
const EMPTY='{"recent":[],"favorites":[]}';
function snapshot(){try{return localStorage.getItem(KEY)||EMPTY;}catch{return EMPTY;}}
function subscribe(cb:()=>void){window.addEventListener(EVENT,cb);window.addEventListener("storage",cb);return()=>{window.removeEventListener(EVENT,cb);window.removeEventListener("storage",cb);};}
function parse(raw:string):Saved{try{const v=JSON.parse(raw);const clean=(x:unknown)=>Array.isArray(x)?x.filter((j):j is Journey=>!!j&&typeof j.from==="string"&&typeof j.to==="string"&&!!stationNames[j.from]&&!!stationNames[j.to]&&j.from!==j.to):[];return{recent:clean(v.recent),favorites:clean(v.favorites)};}catch{return{recent:[],favorites:[]};}}
function write(v:Saved){try{localStorage.setItem(KEY,JSON.stringify(v));window.dispatchEvent(new Event(EVENT));}catch{/* Storage unavailable: keep planner usable. */}}
const same=(a:Journey,b:Journey)=>a.from===b.from&&a.to===b.to;
export function rememberJourney(j:Journey){const v=parse(snapshot());write({...v,recent:[j,...v.recent.filter(x=>!same(x,j))].slice(0,6)});}
export function JourneyShortcuts({from,to,onOpen}:{from:string;to:string;onOpen:(from:string,to:string)=>void}){
 const raw=useSyncExternalStore(subscribe,snapshot,()=>EMPTY);const v=parse(raw);
 const valid=!!stationNames[from]&&!!stationNames[to]&&from!==to;
 const selected={from,to};const favorite=v.favorites.some(j=>same(j,selected));
 function toggle(j:Journey){const current=parse(snapshot());write({...current,favorites:current.favorites.some(x=>same(x,j))?current.favorites.filter(x=>!same(x,j)):[j,...current.favorites].slice(0,12)});}
 return <section className="tk-card"><h2>Perjalanan tersimpan</h2><p className="tk-muted">Favorit dan riwayat tersimpan hanya di browser ini, tanpa akun.</p>
 {valid&&<button type="button" onClick={()=>toggle(selected)}>{favorite?"★ Hapus dari favorit":"☆ Simpan rute pilihan"}</button>}
 <h3>Favorit</h3>{!v.favorites.length?<p className="tk-muted">Belum ada rute favorit.</p>:v.favorites.map(j=><div className="tk-place" key={j.from+j.to}><button type="button" onClick={()=>onOpen(j.from,j.to)}>{stationNames[j.from]} → {stationNames[j.to]}</button><button type="button" aria-label={"Hapus favorit "+stationNames[j.from]+" ke "+stationNames[j.to]} onClick={()=>toggle(j)}>Hapus</button></div>)}
 <h3>Terakhir dicari</h3>{!v.recent.length?<p className="tk-muted">Riwayat pencarian masih kosong.</p>:<>{v.recent.map(j=><div className="tk-place" key={j.from+j.to}><button type="button" onClick={()=>onOpen(j.from,j.to)}>{stationNames[j.from]} → {stationNames[j.to]}</button></div>)}<button type="button" onClick={()=>write({...parse(snapshot()),recent:[]})}>Hapus riwayat</button></>}
 </section>;
}
