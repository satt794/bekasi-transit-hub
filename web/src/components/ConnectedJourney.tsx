"use client";
import { useEffect, useState } from "react";
import { endpoints, getJSON, type Trip, type TripsResponse } from "@/lib/api";
import { suggestRoute, stationNames, type Leg } from "@/lib/network";
import { formatClock } from "@/lib/time";
const BUFFER = 10 * 60_000;
type Segment = { leg: Leg; trip: Trip; provider: string; stale: boolean };
type Result = { key: string; segments: Segment[] | null; error: boolean };
export function ConnectedJourney({from,to}:{from:string;to:string}) {
 const key=from+":"+to;
 const [result,setResult]=useState<Result|null>(null);
 const [retry,setRetry]=useState(0);
 useEffect(()=>{
  const legs=suggestRoute(from,to);
  if(!legs||legs.length<2)return;
  const controller=new AbortController();
  let active=true;
  async function load(){
   try {
    const data=await Promise.all(legs!.map(l=>getJSON<TripsResponse>(endpoints.trips(l.from,l.to,30),controller.signal)));
    let earliest=Date.now();
    const segments:Segment[]=[];
    for(let i=0;i<data.length;i++){
     const item=data[i];
     const trip=item.trips.filter(t=>Date.parse(t.departs_at)>=earliest&&Date.parse(t.arrives_at)>Date.parse(t.departs_at))
      .sort((a,b)=>Date.parse(a.arrives_at)-Date.parse(b.arrives_at))[0];
     if(!trip){if(active)setResult({key,segments:null,error:false});return;}
     segments.push({leg:legs![i],trip,provider:item.source.provider,stale:item.source.stale});
     earliest=Date.parse(trip.arrives_at)+BUFFER;
    }
    if(active)setResult({key,segments,error:false});
   }catch{if(active)setResult({key,segments:null,error:true});}
  }
  void load();
  return()=>{active=false;controller.abort();};
 },[from,to,key,retry]);
 const current=result?.key===key?result:null;
 const segments=current?.segments;
 return <div className="tk-network" data-testid="connected-journey">
  <h3>Jadwal sambungan kereta</h3>
  <p className="tk-muted">Estimasi berdasarkan jadwal penyedia data. Minimal 10 menit untuk perpindahan; bukan jaminan koneksi atau kondisi kereta langsung.</p>
  {!current?<p>Memuat jadwal sambungan…</p>:!segments?<p>{current.error?"Jadwal sambungan tidak dapat dimuat.":"Belum ditemukan sambungan dalam jadwal yang tersedia. Gunakan panduan jaringan."}</p>:<>
   {segments.map(({leg,trip,provider,stale},i)=><article className="tk-place" key={leg.from+leg.to}>
    <strong>{i?"Transit di ":"Berangkat dari "}{stationNames[leg.from]}</strong>
    {i>0&&<p>Waktu tunggu: {Math.round((Date.parse(trip.departs_at)-Date.parse(segments[i-1].trip.arrives_at))/60000)} menit</p>}
    <p>KA {trip.train_id} · tujuan akhir {trip.destination_name}</p>
    <p>{formatClock(trip.departs_at)} WIB → {stationNames[leg.to]} · {formatClock(trip.arrives_at)} WIB</p>
    <small>Sumber: {provider}{stale?" · Data cadangan / mungkin kedaluwarsa":""}</small>
   </article>)}
   <p>Total estimasi: {Math.round((Date.parse(segments[segments.length-1].trip.arrives_at)-Date.parse(segments[0].trip.departs_at))/60000)} menit · {segments.length-1} transit</p>
  </>}
  <button type="button" onClick={()=>{setResult(null);setRetry(n=>n+1);}}>Perbarui jadwal sambungan</button>
 </div>;
}
