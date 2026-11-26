"use client";
import {useState} from "react";
const cards=[
 {name:"Flazz BCA",app:"BCA mobile",url:"https://www.bca.co.id/id/Individu/layanan/e-banking/BCA-Mobile"},
 {name:"Mandiri e-money",app:"Livin’ by Mandiri",url:"https://www.bankmandiri.co.id/e-money"},
 {name:"BRIZZI",app:"BRImo",url:"https://bri.co.id/brizzi"},
 {name:"BNI TapCash",app:"wondr by BNI / TapCash Go",url:"https://www.bni.co.id/id-id/e-banking/tapcash"},
 {name:"KMT",app:"Mesin cek saldo atau petugas stasiun",url:"https://commuterline.id/"}
];
export function CardBalance(){
 const [card,setCard]=useState("0"),[balance,setBalance]=useState(""),[fare,setFare]=useState(""),[status,setStatus]=useState("");
 const c=cards[Number(card)];
 const valid=(s:string)=>s.trim()!==""&&Number.isFinite(Number(s))&&Number(s)>=0;
 const fmt=(n:number)=>"Rp"+n.toLocaleString("id-ID");
 return <section className="tk-card"><h2>Cek saldo kartu</h2><p className="tk-muted">Persiapkan saldo sebelum berangkat. Browser tidak dapat membaca saldo chip kartu uang elektronik secara langsung.</p>
 <label>Jenis kartu<select value={card} onChange={e=>{setCard(e.target.value);setBalance("");}}>{cards.map((x,i)=><option key={x.name} value={i}>{x.name}</option>)}</select></label>
 <button type="button" className="tk-primary" onClick={()=>setStatus("NDEFReader" in window?"Web NFC terdeteksi. Dukungan ini tidak mencakup pembacaan saldo chip kartu. Gunakan aplikasi penerbit.":"Web NFC tidak tersedia pada browser ini. NFC native mungkin tetap tersedia melalui aplikasi penerbit.")}>Periksa dukungan NFC browser</button><p role="status">{status}</p>
 <div className="tk-place"><strong>{c.app}</strong><p>Gunakan kanal resmi untuk membaca saldo kartu, lalu masukkan saldo yang terlihat di bawah.</p><a href={c.url} target="_blank" rel="noreferrer">Panduan resmi ↗</a></div>
 <label>Saldo kartu (Rp)<input type="number" min="0" value={balance} onChange={e=>setBalance(e.target.value)} placeholder="Contoh: 20000"/></label>
 <label>Anggaran perjalanan (Rp)<input type="number" min="0" value={fare} onChange={e=>setFare(e.target.value)} placeholder="Contoh: 10000"/></label>
 {valid(balance)&&valid(fare)&&<div className="tk-place" role="status"><strong>{Number(balance)>=Number(fare)?"Saldo mencukupi anggaran":"Saldo kurang "+fmt(Number(fare)-Number(balance))}</strong><p>Saldo manual: {fmt(Number(balance))} · Anggaran: {fmt(Number(fare))}</p><small>Belum memperhitungkan saldo minimum, deposit atau biaya lain dari operator.</small></div>}
 <small>Data saldo hanya berada dalam sesi halaman; tidak dikirim atau disimpan ke server.</small></section>;
}
