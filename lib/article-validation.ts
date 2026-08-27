export const ARTICLE_STATUSES = ["DRAFT", "PUBLISHED"] as const;
export type ArticleStatus = (typeof ARTICLE_STATUSES)[number];

export type ArticlePayload = {
  title?: string;
  excerpt?: string | null;
  content?: string;
  coverImageUrl?: string | null;
  categoryId?: string | null;
  status?: ArticleStatus;
  publishedAt?: string | null;
};

const MAX_TITLE_LENGTH = 200;
const MAX_EXCERPT_LENGTH = 500;
const MAX_CONTENT_LENGTH = 1_000_000;
const MAX_URL_LENGTH = 2_048;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function optionalText(
  value: unknown,
  field: string,
  maxLength: number
): { value?: string | null; error?: string } {
  if (value === undefined || value === null) return { value: value as null | undefined };
  if (typeof value !== "string") return { error: `${field} harus berupa teks` };

  const text = value.trim();
  if (text.length > maxLength) return { error: `${field} terlalu panjang` };
  return { value: text };
}

export function validateArticlePayload(
  input: unknown,
  { requireTitleAndContent }: { requireTitleAndContent: boolean }
): { data?: ArticlePayload; error?: string } {
  if (!isRecord(input)) return { error: "Body request tidak valid" };

  const title = optionalText(input.title, "Judul", MAX_TITLE_LENGTH);
  const excerpt = optionalText(input.excerpt, "Excerpt", MAX_EXCERPT_LENGTH);
  const content = optionalText(input.content, "Konten", MAX_CONTENT_LENGTH);
  const coverImageUrl = optionalText(input.coverImageUrl, "URL cover", MAX_URL_LENGTH);
  const categoryId = optionalText(input.categoryId, "Kategori", 100);

  if (title.error || excerpt.error || content.error || coverImageUrl.error || categoryId.error) {
    return { error: title.error ?? excerpt.error ?? content.error ?? coverImageUrl.error ?? categoryId.error };
  }

  if (requireTitleAndContent && (!title.value || !content.value)) {
    return { error: "Judul dan konten wajib diisi" };
  }

  if (title.value !== undefined && !title.value) return { error: "Judul tidak boleh kosong" };
  if (content.value !== undefined && !content.value) return { error: "Konten tidak boleh kosong" };

  const status = input.status === undefined ? undefined : input.status;
  if (status !== undefined && !ARTICLE_STATUSES.includes(status as ArticleStatus)) {
    return { error: "Status artikel tidak valid" };
  }

  let publishedAt = input.publishedAt as string | null | undefined;
  if (publishedAt !== undefined && publishedAt !== null) {
    if (typeof publishedAt !== "string" || Number.isNaN(new Date(publishedAt).getTime())) {
      return { error: "Tanggal publikasi tidak valid" };
    }
    publishedAt = new Date(publishedAt).toISOString();
  }

  return {
    data: {
      title: title.value,
      excerpt: excerpt.value,
      content: content.value,
      coverImageUrl: coverImageUrl.value,
      categoryId: categoryId.value,
      status: status as ArticleStatus | undefined,
      publishedAt,
    },
  };
}