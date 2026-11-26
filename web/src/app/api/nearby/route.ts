import { NextRequest, NextResponse } from "next/server";
export const maxDuration = 35;
const providers=["https://overpass-api.de/api/interpreter","https://overpass.kumi.systems/api/interpreter"];
export async function POST(request:NextRequest){
 let lat:number,lon:number;
 try {const b=await request.json();lat=b.lat;lon=b.lon;if(typeof lat!=="number"||typeof lon!=="number"||!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>85||Math.abs(lon)>180)throw Error("invalid");}catch{return NextResponse.json({error:"Koordinat tidak valid."},{status:400});}
 const a="(around:500,"+lat.toFixed(6)+","+lon.toFixed(6)+")";
 const q='[out:json][timeout:12];(nwr'+a+'["railway"~"^(station|halt|tram_stop|subway_entrance)$"];nwr'+a+'["highway"="bus_stop"];nwr'+a+'["public_transport"~"^(platform|station)$"];nwr'+a+'["amenity"~"^(bus_station|taxi)$"];nwr'+a+'["shop"~"^(convenience|supermarket|mall)$"];);out center;';
 for(const provider of providers){
  const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),14000);
  try{
   const r=await fetch(provider,{method:"POST",body:new URLSearchParams({data:q}),signal:controller.signal,cache:"no-store",headers:{Accept:"application/json"}});
   if(!r.ok)continue;
   const data=await r.json();
   if(!Array.isArray(data.elements)||data.remark)continue;
   return NextResponse.json({elements:data.elements},{headers:{"Cache-Control":"no-store"}});
  }catch{/* Try the other provider. */}finally{clearTimeout(timeout);}
 }
 return NextResponse.json({error:"Penyedia data peta sedang tidak tersedia. Lokasi Anda tetap dapat ditampilkan."},{status:503,headers:{"Cache-Control":"no-store"}});
}
