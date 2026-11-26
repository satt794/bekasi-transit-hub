"use client";
const source="https://kci.id/informasi-publik/berita/hingga-pukul-10-00-wib-kai-commuter-layani-296-ribu-lebih-pengguna-dengan-mengoperasikan-397-perjalanan-commuterline";
export function CrowdGuide({now}:{now:number|null}){
 const parts=now===null?[]:new Intl.DateTimeFormat("en-GB",{timeZone:"Asia/Jakarta",weekday:"short",hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).formatToParts(now);
 const val=(k:string)=>parts.find(p=>p.type===k)?.value;
 const minute=Number(val("hour"))*60+Number(val("minute"));
 const weekday=!!val("weekday")&&!["Sat","Sun"].includes(val("weekday")!);
 const busy=weekday&&((minute>=330&&minute<450)||(minute>=960&&minute<1080));
 return <section className="tk-card"><h2>Potensi kepadatan KRL</h2>
 <p className="tk-muted">Pola jam sibuk hari kerja berdasarkan publikasi KAI Commuter; bukan data jumlah penumpang real-time.</p>
 <div className="tk-place" style={{borderLeft:"4px solid "+(busy?"#dc2626":"#0d9488"),paddingLeft:12}}><strong>{now===null?"Memuat waktu WIB":!weekday?"Akhir pekan: kepadatan belum diprediksi":busy?"Waspada potensi berdesakan":"Di luar rentang sibuk acuan"}</strong><p>{busy?"Pertimbangkan berangkat di luar jam sibuk bila memungkinkan.":"Kereta tetap bisa padat karena gangguan, acara atau libur."}</p></div>
 <div aria-label="Rentang jam sibuk KRL" style={{display:"flex",height:14,borderRadius:8,overflow:"hidden",margin:"12px 0"}}>{[{w:330,c:"#94a3b8"},{w:120,c:"#dc2626"},{w:510,c:"#94a3b8"},{w:120,c:"#dc2626"},{w:360,c:"#94a3b8"}].map((x,i)=><span key={i} style={{flex:x.w,background:x.c}}/>)}</div>
 <p><strong>05.30–07.30 WIB</strong> · Pagi<br/><strong>16.00–18.00 WIB</strong> · Sore</p><p className="tk-muted">Rentang di luar jam acuan bukan jaminan sepi. Untuk kepadatan aktual, cek C-Access.</p><a href={source} target="_blank" rel="noreferrer">Sumber KAI Commuter ↗</a></section>;
}
