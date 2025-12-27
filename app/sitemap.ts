import type { MetadataRoute } from "next";

const SITE_URL = "https://img-gen.mandy9943.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}


