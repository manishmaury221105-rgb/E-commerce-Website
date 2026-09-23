import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FreshMart Local Grocery",
    short_name: "FreshMart",
    description: "Farm fresh fruits, crisp vegetables, and daily supermarket groceries delivered in 45 minutes.",
    start_url: "/",
    display: "standalone",
    background_color: "#020617",
    theme_color: "#059669",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
