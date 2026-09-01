import type { Metadata } from "next";
import ProductForm from "../../../components/admin/ProductForm";

export const metadata: Metadata = {
  title: "Tambah Produk Baru",
};

export default function AdminBelanjaBaruPage() {
  return <ProductForm />;
}
