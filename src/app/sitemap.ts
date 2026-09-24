import { MetadataRoute } from "next";
import { getCategories, getProducts } from "@/lib/firestore-service";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://freshmart-ecommerce.vercel.app";

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/cart`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/auth/login`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/auth/register`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  try {
    const [categories, products] = await Promise.all([
      getCategories(),
      getProducts(),
    ]);

    const categoryUrls: MetadataRoute.Sitemap = categories.map((c) => ({
      url: `${siteUrl}/products?category=${c.slug}`,
      lastModified: c.updatedAt ? new Date(c.updatedAt) : new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    const productUrls: MetadataRoute.Sitemap = products.map((p) => ({
      url: `${siteUrl}/products/${p.slug || p.id}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    }));

    return [...staticRoutes, ...categoryUrls, ...productUrls];
  } catch (err) {
    console.error("Sitemap generation error:", err);
    return staticRoutes;
  }
}
