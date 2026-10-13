import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

type ActivityBody = { slug?: unknown; title?: unknown; description?: unknown; contentType?: unknown; videoUrl?: unknown; guideUrl?: unknown; thumbnailUrl?: unknown; ageMin?: unknown; ageMax?: unknown; sortOrder?: unknown; isPublished?: unknown };

function text(value: unknown, required = false, max = 500) {
  if (value === undefined || value === null || value === "") return required ? null : undefined;
  if (typeof value !== "string" || !value.trim() || value.trim().length > max) return null;
  return value.trim();
}

function integer(value: unknown, min = 0) {
  if (value === undefined || value === null) return undefined;
  return Number.isInteger(value) && Number(value) >= min ? Number(value) : null;
}

function validate(body: ActivityBody) {
  const slug = text(body.slug, true, 160);
  const title = text(body.title, true, 160);
  const description = text(body.description, true, 5000);
  const contentType = text(body.contentType, true, 40);
  const videoUrl = text(body.videoUrl, false, 1000);
  const guideUrl = text(body.guideUrl, false, 1000);
  const thumbnailUrl = text(body.thumbnailUrl, false, 1000);
  const ageMin = integer(body.ageMin);
  const ageMax = integer(body.ageMax);
  const sortOrder = integer(body.sortOrder);
  const hasInvalidNumber = [ageMin, ageMax, sortOrder].some((value) => value === null);
  if (!slug || !title || !description || !contentType || hasInvalidNumber || (typeof ageMin === "number" && typeof ageMax === "number" && ageMin > ageMax)) return null;
  if (body.isPublished !== undefined && typeof body.isPublished !== "boolean") return null;
  return { slug, title, description, contentType, videoUrl: videoUrl ?? null, guideUrl: guideUrl ?? null, thumbnailUrl: thumbnailUrl ?? null, ageMin: ageMin ?? null, ageMax: ageMax ?? null, sortOrder: sortOrder ?? 0, isPublished: body.isPublished ?? false };
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await prisma.subscriptionActivity.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] }));
}

export async function POST(request: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const data = validate(await request.json() as ActivityBody);
    if (!data) return NextResponse.json({ error: "Data activity subscription tidak valid" }, { status: 400 });
    return NextResponse.json(await prisma.subscriptionActivity.create({ data }), { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/subscription-activities]", error);
    return NextResponse.json({ error: "Gagal membuat activity subscription" }, { status: 500 });
  }
}
