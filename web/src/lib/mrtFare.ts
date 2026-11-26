// Standard MRT fares from the operator's published station-pair table.
// https://www.jakartamrt.co.id/id/tarif-mrt-jakarta
const names=["Lebak Bulus","Fatmawati","Cipete Raya","Haji Nawi","Blok A","Blok M","ASEAN","Senayan","Istora","Bendungan Hilir","Setiabudi","Dukuh Atas","Bundaran HI"];
const rows=[
[4,5,6,7,8,9,10,11,12,13,14,14],
[4,5,6,7,7,9,9,10,11,12,13],
[3,4,5,6,7,8,9,9,10,11],
[3,4,5,6,7,8,8,9,10],
[3,4,5,6,7,7,8,9],
[3,4,5,6,6,7,8],
[3,4,5,6,7,7],
[3,4,4,5,6],
[4,4,5,6],
[3,3,4],
[3,4],
[3]
];
export function mrtFare(from:string,to:string):number|null{
 const a=names.indexOf(from.replace(/^MRT:/,"")),b=names.indexOf(to.replace(/^MRT:/,""));
 if(a<0||b<0||a===b)return null;
 return rows[Math.min(a,b)][Math.abs(a-b)-1]*1000;
}
