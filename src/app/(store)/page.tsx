import React from "react";
import { getBanners, getCategories, getProducts } from "@/lib/firestore-service";
import { HomePageLive } from "./HomePageLive";

export const revalidate = 0; // Dynamic data

async function getHomePageData() {
  try {
    const [banners, categories, products] = await Promise.all([
      getBanners(true),
      getCategories(),
      getProducts(),
    ]);

    return {
      banners,
      categories,
      products,
    };
  } catch (error) {
    console.error("Home page data fetch error:", error);
    return {
      banners: [],
      categories: [],
      products: [],
    };
  }
}

export default async function HomePage() {
  const { banners, categories, products } = await getHomePageData();

  return (
    <HomePageLive
      initialBanners={banners}
      initialCategories={categories}
      initialProducts={products}
    />
  );
}
