import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "चैतन्य श्री - Shubh Vivah Collection",
    short_name: "चैतन्य श्री",
    description: "Royal Indian wedding lehengas, sherwanis, wedding cards & pooja collections.",
    start_url: "/",
    display: "standalone",
    background_color: "#020617",
    theme_color: "#ea580c",
    icons: [
      {
        src: "/logo.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
