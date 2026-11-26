import { stationNames, suggestRoute } from "./network";
export type Mode="KRL"|"MRT"|"LRT"|"Jalan kaki";
export type MultiLeg={mode:Mode;line:string;from:string;to:string;stops:string[];toward?:string};
const mrt=["Lebak Bulus","Fatmawati","Cipete Raya","Haji Nawi","Blok A","Blok M","ASEAN","Senayan","Istora","Bendungan Hilir","Setiabudi","Dukuh Atas","Bundaran HI"];
const lrtShared=["Dukuh Atas","Setiabudi","Rasuna Said","Kuningan","Pancoran","Cikoko","Ciliwung","Cawang"];
const bekasi=[...lrtShared,"Halim","Jatibening Baru","Cikunir I","Cikunir II","Bekasi Barat","Jatimulya"];
const cibubur=[...lrtShared,"TMII","Kampung Rambutan","Ciracas","Harjamukti"];
const ids=(mode:string,names:string[])=>names.map(n=>mode+":"+n);
const patterns=[{mode:"MRT" as const,line:"Utara–Selatan",ids:ids("MRT",mrt)},{mode:"LRT" as const,line:"Bekasi",ids:ids("LRT",bekasi)},{mode:"LRT" as const,line:"Cibubur",ids:ids("LRT",cibubur)}];
export const multiStations:Record<string,string>={...Object.fromEntries(Object.entries(stationNames).map(([id,n])=>[id,"KRL · "+n])),...Object.fromEntries([...ids("MRT",mrt),...ids("LRT",bekasi),...ids("LRT",cibubur)].map(id=>[id,id.replace(":"," · ")]))};
const links=[["SUD","MRT:Dukuh Atas"],["SUD","LRT:Dukuh Atas"],["MRT:Dukuh Atas","LRT:Dukuh Atas"],["CW","LRT:Cikoko"]];
const hubs=["SUD","CW"];
export function multiRoute(from:string,to:string):MultiLeg[]|null{
 if(from===to||!Object.prototype.hasOwnProperty.call(multiStations,from)||!Object.prototype.hasOwnProperty.call(multiStations,to))return null;
 type State={at:string;cost:number;legs:MultiLeg[]};
 const queue:State[]=[{at:from,cost:0,legs:[]}],best=new Map<string,number>([[from,0]]);
 const railNodes=[...new Set([from,to,...hubs].filter(id=>Object.prototype.hasOwnProperty.call(stationNames,id)))];
 const krlCache=new Map<string,MultiLeg[]>();
 const add=(state:State,legs:MultiLeg[])=>{
  if(!legs.length)return;const end=legs[legs.length-1].to;
  const cost=state.cost+legs.reduce((n,l)=>n+(l.mode==="Jalan kaki"?300:1000+l.stops.length-1),0);
  if(cost>=(best.get(end)??Infinity))return;
  best.set(end,cost);queue.push({at:end,cost,legs:[...state.legs,...legs]});
 };
 while(queue.length){
  queue.sort((a,b)=>a.cost-b.cost);const s=queue.shift()!;
  if(s.cost!==best.get(s.at))continue;if(s.at===to)return s.legs;
  if(railNodes.includes(s.at))for(const target of railNodes){
   if(target===s.at)continue;const key=s.at+":"+target;
   if(!krlCache.has(key))krlCache.set(key,(suggestRoute(s.at,target)||[]).map(l=>({...l,mode:"KRL" as const})));
   add(s,krlCache.get(key)!);
  }
  for(const p of patterns){
   const i=p.ids.indexOf(s.at);if(i<0)continue;
   for(let j=0;j<p.ids.length;j++){
    if(i===j)continue;
    const stops=p.ids.slice(Math.min(i,j),Math.max(i,j)+1);if(j<i)stops.reverse();
    add(s,[{mode:p.mode,line:p.line,from:s.at,to:p.ids[j],stops,toward:p.ids[j>i?p.ids.length-1:0]}]);
   }
  }
  for(const [a,b] of links){const target=s.at===a?b:s.at===b?a:null;if(target)add(s,[{mode:"Jalan kaki",line:"Perpindahan antarmoda",from:s.at,to:target,stops:[s.at,target]}]);}
 }
 return null;
}
export const multiSources={MRT:"https://jakartamrt.co.id/id/daftar-stasiun",LRT:"https://lrtjabodebek.kai.id/informasi-peta-rute",dukuh:"https://jakartamrt.co.id/id/info-terkini/transport-hub-simpang-temu-dukuh-atas-selesai-dibangun",cikoko:"https://lrtjabodebek.kai.id/pers/kai-layani-156490-pengguna-lrt-jabodebek-selama-momen-pergantian-tahun"};
