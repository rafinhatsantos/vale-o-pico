import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";
import { SPOTS } from "@/lib/spots";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: "hourly", priority: 1 },
    { url: `${SITE_URL}/como-calculamos`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/sobre`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/creditos`, changeFrequency: "monthly", priority: 0.2 },
    ...SPOTS.map(({ slug }) => ({
      url: `${SITE_URL}/praia/${slug}`,
      changeFrequency: "hourly" as const,
      priority: 0.8,
    })),
  ];
}
