"use client";
import {useState,useSyncExternalStore} from "react";
const cards=[
 {name:"Flazz BCA",url:"https://www.bca.co.id/"},
 {name:"Mandiri e-money",url:"https://www.bankmandiri.co.id/e-money"},
 {name:"BRIZZI",url:"https://bri.co.id/brizzi"},
 {name:"BNI TapCash",url:"https://www.bni.co.id/"},
 {name:"KMT",url:"https://commuterline.id/"}
];
type Entry={id:string;at:string;kind:"awal"|"perjalanan"|"topup"|"koreksi";amount:number;after:number;note:string};
type Wallet={initial:number;balance:number;entries:Entry[]};
type Store=Record<string,Wallet>;
const KEY="transitkita:balance:v1",EVENT="transitkita:balance",EMPTY="{}";
function snapshot(){try{return localStorage.getItem(KEY)||EMPTY;}catch{return EMPTY;}}
function subscribe(cb:()=>void){window.addEventListener(EVENT,cb);window.addEventListener("storage",cb);return()=>{window.removeEventListener(EVENT,cb);window.removeEventListener("storage",cb);};}
function parse(raw:string):Store{try{const data=JSON.parse(raw);const out:Store={};for(const c of cards){const w=data?.[c.name];if(w&&Number.isSafeInteger(w.initial)&&w.initial>=0&&Number.isSafeInteger(w.balance)&&w.balance>=0&&Array.isArray(w.entries))out[c.name]={initial:w.initial,balance:w.balance,entries:w.entries.filter((e:Entry)=>e&&typeof e.id==="string"&&typeof e.at==="string"&&typeof e.note==="string"&&Number.isSafeInteger(e.amount)&&Number.isSafeInteger(e.after)&&["awal","perjalanan","topup","koreksi"].includes(e.kind)).slice(0,100)};}return out;}catch{return {};}}
function save(data:Store){try{localStorage.setItem(KEY,JSON.stringify(data));window.dispatchEvent(new Event(EVENT));return true;}catch{return false;}}
const fmt=(n:number)=>"Rp"+n.toLocaleString("id-ID");
const valid=(s:string)=>s.trim()!==""&&Number.isSafeInteger(Number(s))&&Number(s)>=0;
const moneyStyle={width:"100%",padding:12,border:"1px solid #94a3b8",borderRadius:10,background:"transparent",color:"inherit",margin:"6px 0"};
export function CardBalance(){
 const raw=useSyncExternalStore(subscribe,snapshot,()=>EMPTY);
 const [card,setCard]=useState("0"),[amount,setAmount]=useState(""),[kind,setKind]=useState<"perjalanan"|"topup"|"koreksi">("perjalanan"),[note,setNote]=useState(""),[status,setStatus]=useState(""),[budget,setBudget]=useState(""),[returnTrip,setReturnTrip]=useState(false),[confirmReset,setConfirmReset]=useState(false);
 const c=cards[Number(card)],w=parse(raw)[c.name];
 function record(){
  if(!valid(amount)){setStatus("Masukkan nominal rupiah yang valid.");return;}
  const all=parse(snapshot()),old=all[c.name],n=Number(amount),k=old?kind:"awal";
  if(old&&k!=="koreksi"&&n===0){setStatus("Nominal harus lebih dari nol.");return;}
  const next=!old||k==="koreksi"?n:k==="topup"?old.balance+n:old.balance-n;
  if(next<0){setStatus("Pengeluaran melebihi saldo tercatat. Koreksi saldo atau catat top up terlebih dahulu.");return;}
  if(!Number.isSafeInteger(next)){setStatus("Nominal terlalu besar.");return;}
  const entry:Entry={id:crypto.randomUUID(),at:new Date().toISOString(),kind:k,amount:n,after:next,note:note.trim().slice(0,100)};
  if(!save({...all,[c.name]:{initial:old?.initial??n,balance:next,entries:[entry,...(old?.entries??[])].slice(0,100)}})){setStatus("Penyimpanan browser tidak tersedia. Saldo belum tersimpan.");return;}
  setAmount("");setNote("");setStatus("Saldo tercatat diperbarui.");
 }
 const total=valid(budget)?Number(budget)*(returnTrip?2:1):null;
 return <section className="tk-card"><h2>Smart Balance Tracker</h2><p className="tk-muted">Catat saldo awal sekali, lalu konfirmasi biaya perjalanan atau top up. Saldo ini adalah catatan pribadi, bukan pembacaan kartu fisik.</p>
 <label>Jenis kartu<select value={card} onChange={e=>{setCard(e.target.value);setAmount("");setNote("");setStatus("");setConfirmReset(false);}}>{cards.map((x,i)=><option key={x.name} value={i}>{x.name}</option>)}</select></label>
 <div style={{background:"#0f766e",color:"white",borderRadius:18,padding:20,margin:"12px 0"}}><small>{c.name} · estimasi saldo tersisa</small><h2 style={{color:"white",fontSize:32,margin:"8px 0"}}>{w?fmt(w.balance):"Belum dicatat"}</h2>{w&&<small>Saldo awal: {fmt(w.initial)}</small>}</div>
 <form onSubmit={e=>{e.preventDefault();record();}}>
 {w&&<div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:12}}>{([{id:"perjalanan",label:"Catat perjalanan"},{id:"topup",label:"Top up"},{id:"koreksi",label:"Koreksi saldo"}] as const).map(k=><button key={k.id} type="button" aria-pressed={kind===k.id} onClick={()=>{setKind(k.id);setAmount("");setStatus("");}} style={{padding:10,borderRadius:10,border:"1px solid #94a3b8",background:kind===k.id?"#0f766e":"transparent",color:kind===k.id?"white":"inherit"}}>{k.label}</button>)}</div>}
 <label>{!w?"Saldo awal kartu (Rp)":kind==="perjalanan"?"Biaya yang benar-benar terpotong (Rp)":kind==="topup"?"Nominal top up yang berhasil (Rp)":"Saldo aktual kartu (Rp)"}<input style={moneyStyle} type="number" min="0" step="1" required value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Contoh: 20000"/></label>
 {w&&<label>Catatan (opsional)<input style={moneyStyle} value={note} onChange={e=>setNote(e.target.value)} maxLength={100} placeholder="Contoh: Bekasi – Manggarai"/></label>}
 <button className="tk-primary" type="submit">{w?"Konfirmasi dan simpan":"Simpan saldo awal"}</button></form><p role="status">{status}</p>
 {w&&<><h3>Anggaran perjalanan</h3><label>Estimasi tarif sekali jalan (Rp)<input style={moneyStyle} type="number" min="0" step="1" value={budget} onChange={e=>setBudget(e.target.value)}/></label><label><input type="checkbox" checked={returnTrip} onChange={e=>setReturnTrip(e.target.checked)}/> Pulang-pergi dengan estimasi tarif sama</label>
 {total!==null&&<p className="tk-place">Anggaran {fmt(total)} · {w.balance>=total?"Perkiraan sisa "+fmt(w.balance-total):"Perkiraan kurang "+fmt(total-w.balance)}. Ini tidak mengurangi saldo sampai biaya dikonfirmasi.</p>}
 <h3>Riwayat pencatatan</h3>{w.entries.map(e=><article key={e.id} className="tk-place"><strong>{e.kind==="awal"?"Saldo awal":e.kind==="topup"?"Top up":e.kind==="perjalanan"?"Perjalanan":"Koreksi saldo"} · {e.kind==="perjalanan"?"−":e.kind==="topup"?"+":""}{fmt(e.amount)}</strong><p>{e.note||""}</p><small>{new Date(e.at).toLocaleString("id-ID",{timeZone:"Asia/Jakarta"})} WIB · Sisa {fmt(e.after)}</small></article>)}
 {confirmReset?<div><p>Hapus saldo dan seluruh riwayat kartu ini?</p><button type="button" onClick={()=>{const all=parse(snapshot());delete all[c.name];if(save(all)){setStatus("Catatan kartu dihapus.");setConfirmReset(false);setAmount("");}else setStatus("Gagal menghapus catatan.");}}>Ya, hapus</button><button type="button" onClick={()=>setConfirmReset(false)}>Batal</button></div>:<button type="button" onClick={()=>setConfirmReset(true)}>Reset catatan kartu</button>}</>}
 <p className="tk-muted">Catat semua pemakaian dan top up agar estimasi tetap akurat. Cek saldo aktual sesekali lewat <a href={c.url} target="_blank" rel="noreferrer">kanal resmi</a>. Tidak memperhitungkan saldo minimum operator. Riwayat maksimal 100 catatan per jenis kartu, disimpan di browser ini tanpa nomor kartu, NFC, atau server. Menghapus data browser akan menghapus catatan.</p></section>;
}
