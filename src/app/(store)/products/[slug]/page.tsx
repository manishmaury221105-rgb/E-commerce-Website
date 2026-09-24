import React from "react";
import { notFound } from "next/navigation";
import { getProductByIdOrSlug, getProducts, getProductReviews } from "@/lib/firestore-service";
import { ProductDetailClient } from "./ProductDetailClient";
import { Product } from "@/types";

export const revalidate = 0;

async function getProductData(slug: string) {
  const product = await getProductByIdOrSlug(slug);
  if (!product) return null;

  const [related, reviews] = await Promise.all([
    getProducts({ categoryId: product.categoryId, limitCount: 5 }),
    getProductReviews(product.id),
  ]);

  const filteredRelated = related.filter((p) => p.id !== product.id).slice(0, 4);

  return {
    product: {
      ...product,
      reviews,
    },
    related: filteredRelated,
  };
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const data = await getProductData(params.slug);
  if (!data?.product) return { title: "Product Not Found | चैतन्य श्री" };
  return {
    title: `${data.product.name} | चैतन्य श्री`,
    description: data.product.shortDescription || data.product.description.slice(0, 160),
  };
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const data = await getProductData(params.slug);
  if (!data) notFound();

  return <ProductDetailClient product={data.product} relatedProducts={data.related} />;
}
