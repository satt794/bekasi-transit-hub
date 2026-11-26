"use client";
import { useState } from "react";
const rupiah=(n:number)=>new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(n);
const modes=[
 {name:"KRL Jabodetabek",color:"#dc2626",fare:"Rp3.000 / 25 km pertama, +Rp1.000 per 10 km berikutnya",pay:"KMT atau kartu uang elektronik yang diterima operator. Tap masuk dan keluar.",url:"https://www.kai.id/publikasi/siaran-pers/kai-jaga-keterjangkauan-mobilitas-transportasi-publik-bantu-masyarakat-mengelola-biaya-perjalanan",label:"Ketentuan tarif KAI"},
 {name:"Transjakarta",color:"#2563eb",fare:"Tarif sesuai jenis layanan; periksa rute sebelum berangkat.",pay:"Kartu uang elektronik atau tiket QR di aplikasi TJ:Transjakarta, sesuai layanan.",url:"https://transjakarta.co.id/tentang/profil-perusahaan",label:"Informasi resmi Transjakarta"},
 {name:"MRT Jakarta",color:"#7c3aed",fare:"Tarif berdasarkan pasangan stasiun.",pay:"MyMRTJ atau kartu uang elektronik yang diterima; tiket QR tersedia di stasiun.",url:"https://www.jakartamrt.co.id/id/tarif-mrt-jakarta",label:"Tabel tarif MRT"},
 {name:"LRT Jabodebek",color:"#ea580c",fare:"Tarif menurut jarak dan periode jam sibuk.",pay:"KMT, kartu uang elektronik perbankan atau Access by KAI sesuai ketentuan.",url:"https://lrtjabodebek.kai.id/informasi-tarif",label:"Tabel tarif LRT Jabodebek"},
];
export function FareGuide({mode}:{mode?:string}){
 const [distance,setDistance]=useState("");
 const km=Number(distance);const valid=distance.trim()!==""&&Number.isFinite(km)&&km>0&&km<=300;
 const fare=valid?3000+1000*Math.ceil(Math.max(0,km-25)/10):null;
 const shown=mode?modes.filter(m=>m.name===mode):modes;
 return <section className="tk-card">
 <h2>Tarif &amp; pembayaran</h2><p className="tk-muted">Rujukan operator, diperiksa 26 November 2026. Tarif khusus, promo, dan perubahan kebijakan dapat berbeda.</p>
 {(!mode||mode==="KRL Jabodetabek")&&<div className="tk-place"><h3>Kalkulator tarif KRL</h3><label>Jarak perjalanan di jalur rel (km)<input type="number" min="0.1" max="300" step="0.1" placeholder="Contoh: 30" value={distance} onChange={e=>setDistance(e.target.value)} style={{width:"100%",padding:10,border:"1px solid #94a3b8",borderRadius:8,background:"transparent",color:"inherit"}}/></label>
 <p aria-live="polite"><strong>{fare===null?"Masukkan jarak rel untuk menghitung":rupiah(fare)+" / perjalanan"}</strong></p>
 <small>Estimasi berdasarkan jarak yang Anda masukkan, bukan jarak otomatis antarstasiun. Transit KRL dalam area berbayar tidak dihitung sebagai tiket baru. Periksa tarif resmi sebelum berangkat.</small></div>}
 {shown.map(m=><article className="tk-place" key={m.name} style={{borderLeft:"4px solid "+m.color,paddingLeft:12}}><h3>{m.name}</h3><p>{m.fare}</p><p>{m.pay}</p><a href={m.url} target="_blank" rel="noreferrer">{m.label} ↗</a></article>)}
 </section>;
}
