import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
 return {name:"TransitKita — Transportasi Jabodetabek",short_name:"TransitKita",description:"Panduan transportasi umum Jabodetabek",start_url:"/",scope:"/",display:"standalone",background_color:"#f8fafc",theme_color:"#0f766e",lang:"id",icons:[{src:"/transitkita.svg",sizes:"any",type:"image/svg+xml",purpose:"any"}]};
}