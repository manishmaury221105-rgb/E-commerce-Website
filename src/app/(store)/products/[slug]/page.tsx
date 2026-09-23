import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ProductDetailClient } from "./ProductDetailClient";
import { Product } from "@/types";

export const revalidate = 0;

async function getProductData(slug: string) {
  const product = await prisma.product.findFirst({
    where: {
      OR: [{ slug: slug }, { id: slug }],
    },
    include: {
      category: true,
      reviews: {
        where: { isApproved: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!product) return null;

  const related = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
    },
    take: 4,
    include: { category: true },
  });

  const parsedProduct: Product = {
    ...product,
    images: Array.isArray(product.images)
      ? product.images
      : typeof product.images === "string"
      ? JSON.parse(product.images || "[]")
      : [],
    dealEndsAt: product.dealEndsAt ? product.dealEndsAt.toISOString() : null,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    reviews: product.reviews.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    })),
  };

  const parsedRelated: Product[] = related.map((p) => ({
    ...p,
    images: Array.isArray(p.images)
      ? p.images
      : typeof p.images === "string"
      ? JSON.parse(p.images || "[]")
      : [],
    dealEndsAt: p.dealEndsAt ? p.dealEndsAt.toISOString() : null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  return { product: parsedProduct, related: parsedRelated };
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const data = await getProductData(params.slug);
  if (!data?.product) return { title: "Product Not Found | FreshMart" };
  return {
    title: `${data.product.name} | FreshMart Local Shop`,
    description: data.product.shortDescription || data.product.description.slice(0, 160),
  };
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const data = await getProductData(params.slug);
  if (!data) notFound();

  return <ProductDetailClient product={data.product} relatedProducts={data.related} />;
}
