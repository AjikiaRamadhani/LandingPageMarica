import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductForm from "../../../components/admin/ProductForm";

export const metadata: Metadata = {
  title: "Edit Produk",
};

export default async function AdminEditBelanjaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // AdminLayout (app/admin/layout.tsx) sudah memastikan hanya admin yang
  // sampai sini, jadi query langsung lewat Prisma di server component ini
  // aman tanpa perlu requireAdmin lagi.
  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: { orderBy: { order: "asc" } } },
  });

  if (!product) {
    notFound();
  }

  return (
    <ProductForm
      initialData={{
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description ?? "",
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        stock: product.stock,
        ageMin: product.ageMin,
        ageMax: product.ageMax,
        skillFocus: product.skillFocus,
        playerCount: product.playerCount,
        isBestSeller: product.isBestSeller,
        isActive: product.isActive,
        categoryId: product.categoryId,
        images: product.images.map((img) => ({ id: img.id, url: img.url, isVideo: img.isVideo })),
      }}
    />
  );
}
