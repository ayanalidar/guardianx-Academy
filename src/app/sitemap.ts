import { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://academy.guardianx.cloud", lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: "https://academy.guardianx.cloud/#cyber-range", lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: "https://academy.guardianx.cloud/#learning-paths", lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: "https://academy.guardianx.cloud/#skill-tree", lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: "https://academy.guardianx.cloud/#certifications", lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: "https://academy.guardianx.cloud/#institutions", lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  ]
}
