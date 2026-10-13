import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateOptionalText, validateText } from "@/lib/request-validation";

type ChildBody = {
  name?: unknown;
  birthDate?: unknown;
  gender?: unknown;
  learningLevel?: unknown;
  learningStyle?: unknown;
  interests?: unknown;
  favoriteThemes?: unknown;
  allergies?: unknown;
  personalizationNotes?: unknown;
};

function validateStringList(value: unknown, field: string) {
  if (value === undefined || value === null) return { value: undefined };
  if (!Array.isArray(value) || value.length > 20 || value.some((item) => typeof item !== "string" || !item.trim() || item.trim().length > 80)) {
    return { error: `${field} harus berupa daftar teks maksimal 20 item` };
  }
  return { value: value.map((item) => (item as string).trim()) };
}

function validateBirthDate(value: unknown) {
  if (value === undefined || value === null || value === "") return { value: undefined };
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return { error: "Tanggal lahir harus berformat YYYY-MM-DD" };
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value || date > new Date()) return { error: "Tanggal lahir tidak valid" };
  return { value: date };
}

function validateChildBody(body: ChildBody, partial = false) {
  const name = partial && body.name === undefined ? { value: undefined } : validateText(body.name, "Nama anak", 120);
  const birthDate = validateBirthDate(body.birthDate);
  const gender = validateOptionalText(body.gender, "Jenis kelamin", 40);
  const learningLevel = validateOptionalText(body.learningLevel, "Level belajar", 80);
  const learningStyle = validateOptionalText(body.learningStyle, "Gaya belajar", 80);
  const interests = validateStringList(body.interests, "Minat");
  const favoriteThemes = validateStringList(body.favoriteThemes, "Tema favorit");
  const allergies = validateOptionalText(body.allergies, "Alergi atau pantangan", 500);
  const personalizationNotes = validateOptionalText(body.personalizationNotes, "Catatan personalisasi", 2000);
  const fields = { name, birthDate, gender, learningLevel, learningStyle, interests, favoriteThemes, allergies, personalizationNotes };
  const invalidField = Object.values(fields).find((field) => "error" in field && field.error);
  const error = invalidField && "error" in invalidField ? invalidField.error : undefined;
  return { fields, error };
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
  return NextResponse.json(await prisma.childProfile.findMany({ where: { userId: session.user.id }, orderBy: [{ isActive: "desc" }, { createdAt: "asc" }] }));
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
  try {
    const body = await request.json() as ChildBody;
    const { fields, error } = validateChildBody(body);
    if (error || typeof fields.name.value !== "string") return NextResponse.json({ error: error ?? "Nama anak wajib diisi" }, { status: 400 });
    const child = await prisma.childProfile.create({ data: {
      userId: session.user.id,
      name: fields.name.value,
      birthDate: fields.birthDate.value,
      gender: fields.gender.value,
      learningLevel: fields.learningLevel.value,
      learningStyle: fields.learningStyle.value,
      interests: fields.interests.value ?? [],
      favoriteThemes: fields.favoriteThemes.value ?? [],
      allergies: fields.allergies.value,
      personalizationNotes: fields.personalizationNotes.value,
    } });
    return NextResponse.json(child, { status: 201 });
  } catch (error) {
    console.error("[POST /api/children]", error);
    return NextResponse.json({ error: "Gagal membuat profil anak" }, { status: 500 });
  }
}
