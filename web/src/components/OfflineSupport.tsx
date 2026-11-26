"use client";
import {useEffect,useState} from "react";
export function OfflineSupport(){
 const [offline,setOffline]=useState(false);
 useEffect(()=>{
  const update=()=>setOffline(!navigator.onLine);
  update();window.addEventListener("online",update);window.addEventListener("offline",update);
  if("serviceWorker" in navigator&&window.isSecureContext)navigator.serviceWorker.register("/sw.js").catch(()=>{});
  return()=>{window.removeEventListener("online",update);window.removeEventListener("offline",update);};
 },[]);
 return offline?<div role="status" style={{padding:12,background:"#fef3c7",color:"#78350f",textAlign:"center"}}>Anda sedang offline. Jadwal dan peta mungkin tidak tersedia. <a href="/offline.html">Buka panduan offline</a></div>:null;
}
