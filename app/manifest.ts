import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sawar AI",
    short_name: "Sawar",
    description: "An app to generate and alter images using AI.",
    start_url: "/",
    display: "standalone",
    background_color: "#536558",
    theme_color: "#000000",
    icons: [
      {
        src: "/logos/logo.png",
        sizes: "any",
        type: "image/png",
      },
      {
        src: "/logos/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/logos/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/logos/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
