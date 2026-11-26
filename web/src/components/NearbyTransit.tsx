"use client";
import { useState } from "react";
type Point={id:string;name:string;lat:number;lon:number;kind:string;distance:number};
type Location={lat:number;lon:number;accuracy:number};
type Element={id:number;type:string;lat?:number;lon?:number;center?:{lat:number;lon:number};tags?:Record<string,string>};
export function distanceMeters(a:{lat:number;lon:number},b:{lat:number;lon:number}){
 const rad=Math.PI/180;const x=Math.sin((b.lat-a.lat)*rad/2)**2+Math.cos(a.lat*rad)*Math.cos(b.lat*rad)*Math.sin((b.lon-a.lon)*rad/2)**2;
 return 6371000*2*Math.asin(Math.sqrt(Math.min(1,x)));
}
export function NearbyTransit({compact=false,onOpen}:{compact?:boolean;onOpen?:()=>void}){
 const [location,setLocation]=useState<Location|null>(null);
 const [points,setPoints]=useState<Point[]>([]);
 const [status,setStatus]=useState("");
 const [busy,setBusy]=useState(false);
 const [filter,setFilter]=useState("Semua");
 const [selected,setSelected]=useState<Point|null>(null);
 const [manual,setManual]=useState(false);
 const [lat,setLat]=useState("");const [lon,setLon]=useState("");
 async function search(pos:Location){
  setLocation(pos);setBusy(true);setStatus("");setPoints([]);setSelected(null);
  const around="(around:500,"+pos.lat+","+pos.lon+")";
  const query="[out:json][timeout:20];(nwr"+around+'["railway"~"^(station|halt|tram_stop|subway_entrance)$"];nwr'+around+'["highway"="bus_stop"];nwr'+around+'["public_transport"~"^(platform|station)$"];nwr'+around+'["amenity"~"^(bus_station|taxi)$"];nwr'+around+'["shop"~"^(convenience|supermarket|mall)$"];);out center;';
  try{
   const res=await fetch("https://overpass-api.de/api/interpreter",{method:"POST",body:new URLSearchParams({data:query}),signal:AbortSignal.timeout(25000)});
   if(!res.ok)throw Error("provider");
   const data=await res.json() as {elements:Element[]};
   const found:Point[]=[];const seen=new Set<string>();
   for(const el of data.elements){
    const p=el.center??{lat:el.lat,lon:el.lon};const t=el.tags??{};
    if(typeof p.lat!=="number"||typeof p.lon!=="number")continue;
    const d=distanceMeters(pos,{lat:p.lat,lon:p.lon});if(d>500)continue;
    const kind=t.shop||t.amenity==="taxi"?"Patokan":t.railway?"Stasiun":"Halte";
    const name=t.name||t.ref||kind+" tanpa nama";
    const key=kind+name+":"+p.lat.toFixed(4)+":"+p.lon.toFixed(4);if(seen.has(key))continue;seen.add(key);
    found.push({id:el.type+el.id,name,lat:p.lat,lon:p.lon,kind,distance:d});
   }
   setPoints(found.sort((a,b)=>a.distance-b.distance));
   setStatus(found.length?"":"Tidak ditemukan transportasi atau patokan dalam radius 500 meter.");
  }catch{setStatus("Data peta belum tersedia. Coba lagi nanti.");}finally{setBusy(false);}
 }
 function locate(){
  if(!navigator.geolocation){setStatus("GPS tidak tersedia. Masukkan koordinat manual.");return;}
  setBusy(true);setStatus("Meminta izin lokasi…");
  navigator.geolocation.getCurrentPosition(p=>void search({lat:p.coords.latitude,lon:p.coords.longitude,accuracy:p.coords.accuracy}),()=>{setBusy(false);setStatus("Lokasi tidak tersedia atau izin ditolak. Gunakan koordinat manual.");},{enableHighAccuracy:true,timeout:15000,maximumAge:30000});
 }
 const visible=points.filter(p=>filter==="Semua"||p.kind===filter);
 const zoom=16;
 const scale=256*2**zoom;
 function project(p:{lat:number;lon:number}){
  const sin=Math.sin(Math.max(-85.05112878,Math.min(85.05112878,p.lat))*Math.PI/180);
  return {x:(p.lon+180)/360*scale,y:(.5-Math.log((1+sin)/(1-sin))/(4*Math.PI))*scale};
 }
 const center=location?project(location):null;
 const radius=location?500/(40075016.686*Math.cos(location.lat*Math.PI/180)/scale):0;
 const size=Math.max(440,Math.ceil(radius*2+64));
 const left=center?center.x-size/2:0;const top=center?center.y-size/2:0;
 const tiles:{x:number;y:number}[]=[];
 if(center&&size<2048)for(let y=Math.floor(top/256);y<=Math.floor((top+size)/256);y++)for(let x=Math.floor(left/256);x<=Math.floor((left+size)/256);x++)if(y>=0&&y<2**zoom)tiles.push({x,y});
 const mapPoint=(p:{lat:number;lon:number})=>{const q=project(p);return{x:q.x-left,y:q.y-top};};

 return <section className="tk-nearby">
  <div className="tk-sectionhead"><h2>Transportasi terdekat</h2><span>500 m</span></div>
  <div className="tk-card tk-mapcard">
   {location&&center&&size<2048?<div style={{position:"relative",background:"#e5e7eb",overflow:"hidden"}}>
    <svg role="img" aria-label="Peta lokasi dan titik transportasi dalam radius 500 meter" viewBox={"0 0 "+size+" "+size} style={{width:"100%",maxHeight:360,display:"block"}} xmlns="http://www.w3.org/2000/svg">
     {tiles.map(t=><image key={t.x+":"+t.y} x={t.x*256-left} y={t.y*256-top} width={256} height={256} href={"https://tile.openstreetmap.org/"+zoom+"/"+((t.x%2**zoom+2**zoom)%2**zoom)+"/"+t.y+".png"}/>)}
     <circle cx={size/2} cy={size/2} r={radius} fill="#0d9488" fillOpacity=".10" stroke="#0f766e" strokeWidth="2" strokeDasharray="7 4"/>
     {visible.map(p=>{const q=mapPoint(p);return <g key={p.id}><title>{p.name+" · "+Math.round(p.distance)+" m"}</title><circle cx={q.x} cy={q.y} r={selected?.id===p.id?10:6} fill={p.kind==="Stasiun"?"#dc2626":p.kind==="Halte"?"#2563eb":"#d97706"} stroke="white" strokeWidth="2"/></g>;})}
     <circle cx={size/2} cy={size/2} r="9" fill="#2563eb" stroke="white" strokeWidth="3"/>
    </svg>
    <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" style={{position:"absolute",bottom:0,right:0,background:"#fff",color:"#334155",fontSize:10,padding:"2px 4px"}}>© OpenStreetMap contributors</a>
    <div style={{padding:8,background:"var(--tk-card)",fontSize:11}}>🔵 Lokasi Anda · 🔴 Stasiun · 🟦 Halte · 🟠 Patokan · Lingkaran 500 m</div>
   </div>:<div className="tk-mapempty"><span aria-hidden="true">◎</span><strong>Temukan transportasi di sekitar Anda</strong><small>{location?"Lokasi di luar jangkauan tampilan peta.":"Aktifkan lokasi untuk melihat peta 500 meter."}</small></div>}

   <div className="tk-mapactions"><button className="tk-primary" disabled={busy} onClick={compact&&onOpen?onOpen:locate}>{compact?"Jelajahi sekitar saya":"Gunakan lokasi saya"}</button>{!compact&&<button onClick={()=>setManual(v=>!v)}>Lokasi manual</button>}</div>
   {!compact&&<><p className="tk-muted">Koordinat dikirim ke OpenStreetMap dan Overpass untuk mencari lokasi. Jarak dihitung garis lurus, bukan jarak jalan kaki.</p>
   {manual&&<form className="tk-manual" onSubmit={e=>{e.preventDefault();const a=Number(lat),b=Number(lon);if(lat&&lon&&Number.isFinite(a)&&Number.isFinite(b)&&Math.abs(a)<=85&&Math.abs(b)<=180)void search({lat:a,lon:b,accuracy:0});else setStatus("Koordinat tidak valid.");}}><label>Lintang<input required type="number" step="any" value={lat} onChange={e=>setLat(e.target.value)}/></label><label>Bujur<input required type="number" step="any" value={lon} onChange={e=>setLon(e.target.value)}/></label><button disabled={busy} className="tk-primary">Cari sekitar</button></form>}
   {location&&<p className="tk-muted">{location.accuracy?"Akurasi GPS ±"+Math.round(location.accuracy)+" m":"Lokasi manual"} · Radius pencarian 500 m</p>}
   <p role="status">{busy?"Memuat lokasi…":status}</p>
   <div className="tk-filters">{["Semua","Stasiun","Halte","Patokan"].map(f=><button key={f} aria-pressed={filter===f} onClick={()=>setFilter(f)}>{f}</button>)}</div>
   {visible.map(p=><article className="tk-place" key={p.id}><button onClick={()=>setSelected(p)}><strong>{p.name}</strong><small>{p.kind} · {Math.round(p.distance)} m</small></button>{p.kind==="Patokan"&&<small>Patokan alternatif — pastikan kendaraan dapat berhenti di sini.</small>}<div><a target="_blank" rel="noreferrer" href={"https://www.google.com/maps/search/?api=1&query="+p.lat+","+p.lon}>Buka Maps</a><button onClick={async()=>{try{await navigator.clipboard.writeText(p.name+" "+p.lat+","+p.lon);setStatus("Lokasi disalin.");}catch{setStatus("Tidak dapat menyalin lokasi.");}}}>Salin lokasi</button></div></article>)}</>}
  </div>
 </section>;
}
