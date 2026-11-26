// Published LRT Jabodebek station-pair fare table, checked 2026-11-26.
// https://lrtjabodebek.kai.id/informasi-tarif
// Values in hundreds of rupiah; off-peak table caps these fares at Rp10,000.
const names=["Dukuh Atas","Setiabudi","Rasuna Said","Kuningan","Pancoran","Cikoko","Ciliwung","Cawang","Halim","Jatibening Baru","Cikunir I","Cikunir II","Bekasi Barat","Jatimulya","Harjamukti","Kampung Rambutan","Ciracas","TMII"];
const peak=[[50,57,71,85,99,106,113,134,162,183,190,200,200,200,162,176,148],[50,64,78,92,99,106,127,155,176,183,200,200,200,155,169,141],[50,64,78,85,92,120,141,162,169,197,200,197,148,162,134],[57,71,78,85,113,134,155,162,190,200,190,141,155,127],[57,64,71,92,120,141,148,176,197,176,127,134,113],[50,57,78,106,127,134,162,183,162,113,120,99],[50,71,99,120,127,155,176,155,106,113,92],[71,92,113,120,148,169,148,99,113,85],[71,92,99,120,148,176,120,134,106],[64,71,92,120,200,148,162,134],[50,78,99,200,169,183,155],[71,92,200,176,190,162],[64,200,200,200,190],[200,200,200,200],[92,85,106],[57,57],[71]];
export function lrtFare(from:string,to:string):{peak:number;offPeak:number}|null{
 const a=names.indexOf(from.replace(/^LRT:/,"")),b=names.indexOf(to.replace(/^LRT:/,""));
 if(a<0||b<0||a===b)return null;
 const value=peak[Math.min(a,b)]?.[Math.abs(a-b)-1];
 if(typeof value!=="number")return null;
 return {peak:value*100,offPeak:Math.min(value*100,10000)};
}
