import type { Metadata } from "next";
import ArticleForm from "../../../components/admin/ArticleForm";

export const metadata: Metadata = {
  title: "Tambah Artikel Baru",
};

export default function AdminArtikelBaruPage() {
  return <ArticleForm />;
}
