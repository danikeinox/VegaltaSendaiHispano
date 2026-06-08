import type { MetadataRoute } from "next";
import { SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: "Vegalta Hispano",
    description:
      "Comunidad hispana de fans del Vegalta Sendai — carnet digital gratuito.",
    start_url: absoluteUrl("/es"),
    scope: SITE_URL,
    display: "standalone",
    background_color: "#1a3d7c",
    theme_color: "#1a3d7c",
    lang: "es",
    icons: [
      {
        src: "/assets/branding/logo-hispano.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/assets/branding/logo-hispano.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
