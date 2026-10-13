import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateOptionalText, validateText } from "@/lib/request-validation";

type ChildBody = {
  name?: unknown; birthDate?: unknown; gender?: unknown; learningLevel?: unknown; learningStyle?: unknown;
  interests?: unknown; favoriteThemes?: unknown; allergies?: unknown; personalizationNotes?: unknown; isActive?: unknown;
};

function optionalList(value: unknown, field: string) {
  if (value === undefined) return { value: undefined };
  if (!Array.isArray(value) || value.length > 20 || value.some((item) => typeof item !== "string" || !item.trim() || item.trim().length > 80)) return { error: `${field} harus berupa daftar teks maksimal 20 item` };
  return { value: value.map((item) => (item as string).trim()) };
}

function optionalText(value: unknown, field: string, maxLength: number) {
  if (value === undefined) return { value: undefined };
  return validateOptionalText(value, field, maxLength);
}

function optionalDate(value: unknown) {
  if (value === undefined) return { value: undefined };
  if (value === null || value === "") return { value: null };
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return { error: "Tanggal lahir harus berformat YYYY-MM-DD" };
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value || date > new Date()) return { error: "Tanggal lahir tidak valid" };
  return { value: date };
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
  const { id } = await params;
  const child = await prisma.childProfile.findFirst({ where: { id, userId: session.user.id } });
  if (!child) return NextResponse.json({ error: "Profil anak tidak ditemukan" }, { status: 404 });
  return NextResponse.json(child);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
  try {
    const { id } = await params;
    const existing = await prisma.childProfile.findFirst({ where: { id, userId: session.user.id } });
    if (!existing) return NextResponse.json({ error: "Profil anak tidak ditemukan" }, { status: 404 });
    const body = await request.json() as ChildBody;
    const name = body.name === undefined ? { value: undefined } : validateText(body.name, "Nama anak", 120);
    const birthDate = optionalDate(body.birthDate);
    const gender = optionalText(body.gender, "Jenis kelamin", 40);
    const learningLevel = optionalText(body.learningLevel, "Level belajar", 80);
    const learningStyle = optionalText(body.learningStyle, "Gaya belajar", 80);
    const interests = optionalList(body.interests, "Minat");
    const favoriteThemes = optionalList(body.favoriteThemes, "Tema favorit");
    const allergies = optionalText(body.allergies, "Alergi atau pantangan", 500);
    const personalizationNotes = optionalText(body.personalizationNotes, "Catatan personalisasi", 2000);
    const fields = { name, birthDate, gender, learningLevel, learningStyle, interests, favoriteThemes, allergies, personalizationNotes };
    const invalidField = Object.values(fields).find((field) => "error" in field && field.error);
    const error = invalidField && "error" in invalidField ? invalidField.error : undefined;
    if (error || (body.isActive !== undefined && typeof body.isActive !== "boolean")) return NextResponse.json({ error: error ?? "isActive harus berupa boolean" }, { status: 400 });
    const child = await prisma.childProfile.update({ where: { id }, data: {
      ...(name.value !== undefined ? { name: name.value } : {}), ...(birthDate.value !== undefined ? { birthDate: birthDate.value } : {}),
      ...(gender.value !== undefined ? { gender: gender.value } : {}), ...(learningLevel.value !== undefined ? { learningLevel: learningLevel.value } : {}),
      ...(learningStyle.value !== undefined ? { learningStyle: learningStyle.value } : {}), ...(interests.value !== undefined ? { interests: interests.value } : {}),
      ...(favoriteThemes.value !== undefined ? { favoriteThemes: favoriteThemes.value } : {}), ...(allergies.value !== undefined ? { allergies: allergies.value } : {}),
      ...(personalizationNotes.value !== undefined ? { personalizationNotes: personalizationNotes.value } : {}), ...(body.isActive !== undefined ? { isActive: body.isActive } : {}),
    } });
    return NextResponse.json(child);
  } catch (error) {
    console.error("[PATCH /api/children/:id]", error);
    return NextResponse.json({ error: "Gagal memperbarui profil anak" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
  const { id } = await params;
  const child = await prisma.childProfile.findFirst({ where: { id, userId: session.user.id } });
  if (!child) return NextResponse.json({ error: "Profil anak tidak ditemukan" }, { status: 404 });
  await prisma.childProfile.delete({ where: { id } });
  return NextResponse.json({ message: "Profil anak berhasil dihapus" });
}
