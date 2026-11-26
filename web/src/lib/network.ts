import type { Station } from "./api";
// Topological guidance, not a timetable. Based on operator network map and
// FDTJ June 2026 integration map. Confirm service and direction at station.
export const networkSources=["https://commuterline.id/files/download/documents/Pedoman-Naik-KRL-KAI-Commuter_compressed.pdf","https://transportforjakarta.or.id/wp-content/uploads/2026/06/2026-06a-Peta-Integrasi-Jakarta-FDTJ-Web.pdf"];
const patterns=[
 ["Bogor","JAKK JAY MGB SW JUA GDD CKI MRI TEB CW DRN PSMB PSM TNT LNA UP UI POC DPB DP CTA BJD CLT BOO"],
 ["Nambo","JAKK JAY MGB SW JUA GDD CKI MRI TEB CW DRN PSMB PSM TNT LNA UP UI POC DPB DP CTA PDRG CBN NMO"],
 ["Cikarang via Manggarai","CKR TLM CIT TB BKST BKS KRI CUK KLDB BUA KLD JNG MTR MRI SUD KAT THB DU AK KPB"],
 ["Cikarang via Pasar Senen","CKR TLM CIT TB BKST BKS KRI CUK KLDB BUA KLD JNG POK KMT GST PSE KMO RJW KPB"],
 ["Rangkasbitung","THB PLM KBY PDJ JMU SDM RU SRP CSK CC PRP CJT DAR TEJ TGS CKY MJ CTR RK"],
 ["Tangerang","DU GGL PSG TKO BOI RW KDS PI BPR TTI TNG"],
 ["Tanjung Priok","JAKK KPB AC TPK"]
].map(([line,ids])=>({line,ids:ids.split(" ")}));
const names="JAKK:Jakarta Kota|JAY:Jayakarta|MGB:Mangga Besar|SW:Sawah Besar|JUA:Juanda|GDD:Gondangdia|CKI:Cikini|MRI:Manggarai|TEB:Tebet|CW:Cawang|DRN:Duren Kalibata|PSMB:Pasar Minggu Baru|PSM:Pasar Minggu|TNT:Tanjung Barat|LNA:Lenteng Agung|UP:Universitas Pancasila|UI:Universitas Indonesia|POC:Pondok Cina|DPB:Depok Baru|DP:Depok|CTA:Citayam|BJD:Bojonggede|CLT:Cilebut|BOO:Bogor|PDRG:Pondok Rajeg|CBN:Cibinong|NMO:Nambo|CKR:Cikarang|TLM:Metland Telagamurni|CIT:Cibitung|TB:Tambun|BKST:Bekasi Timur|BKS:Bekasi|KRI:Kranji|CUK:Cakung|KLDB:Klender Baru|BUA:Buaran|KLD:Klender|JNG:Jatinegara|MTR:Matraman|SUD:Sudirman|KAT:Karet|THB:Tanah Abang|DU:Duri|AK:Angke|KPB:Kampung Bandan|POK:Pondok Jati|KMT:Kramat|GST:Gang Sentiong|PSE:Pasar Senen|KMO:Kemayoran|RJW:Rajawali|PLM:Palmerah|KBY:Kebayoran|PDJ:Pondok Ranji|JMU:Jurang Mangu|SDM:Sudimara|RU:Rawa Buntu|SRP:Serpong|CSK:Cisauk|CC:Cicayur|PRP:Parung Panjang|CJT:Cilejit|DAR:Daru|TEJ:Tenjo|TGS:Tigaraksa|CKY:Cikoya|MJ:Maja|CTR:Citeras|RK:Rangkasbitung|GGL:Grogol|PSG:Pesing|TKO:Taman Kota|BOI:Bojong Indah|RW:Rawa Buaya|KDS:Kalideres|PI:Poris|BPR:Batu Ceper|TTI:Tanah Tinggi|TNG:Tangerang|AC:Ancol|TPK:Tanjung Priok";
export const stationNames:Record<string,string>=Object.fromEntries(names.split("|").map(s=>s.split(":")));
export function networkStations(api:Station[]):Station[]{
 const known=new Map(api.map(s=>[s.id,s]));
 return Object.entries(stationNames).map(([id,name])=>known.get(id)??{id,name,region:null,is_bekasi:false,order:null}).sort((a,b)=>a.name.localeCompare(b.name,"id"));
}
export type Leg={line:string;from:string;to:string;stops:string[];toward:string};
// Search only contiguous segments within a service pattern; no invented times.
// Prefer fewer transfers, then fewer stops. A transfer is a new boarding.
export function suggestRoute(from:string,to:string):Leg[]|null{
 if(from===to||!stationNames[from]||!stationNames[to])return null;
 type State={at:string;legs:Leg[];cost:number};
 const queue:State[]=[{at:from,legs:[],cost:0}];const best=new Map<string,number>([[from,0]]);
 while(queue.length){
  queue.sort((a,b)=>a.cost-b.cost);const current=queue.shift()!;
  if(current.cost!==best.get(current.at))continue;
  if(current.at===to)return current.legs;
  for(const p of patterns){
   const i=p.ids.indexOf(current.at);if(i<0)continue;
   for(let j=0;j<p.ids.length;j++){
    if(j===i)continue;const dest=p.ids[j];const cost=current.cost+1000+Math.abs(j-i);
    if(cost>=(best.get(dest)??Infinity))continue;
    const stops=p.ids.slice(Math.min(i,j),Math.max(i,j)+1);if(j<i)stops.reverse();
    best.set(dest,cost);queue.push({at:dest,cost,legs:[...current.legs,{line:p.line,from:current.at,to:dest,stops,toward:p.ids[j>i?p.ids.length-1:0]}]});
   }
  }
 }
 return null;
}
