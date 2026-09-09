import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateText } from "@/lib/request-validation";

export async function POST(request: Request) {
  try {
    const { email } = (await request.json()) as { email?: string };
    const emailCheck = validateText(email, "Email", 254);

    if (
      emailCheck.error ||
      typeof emailCheck.value !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailCheck.value)
    ) {
      return NextResponse.json({ error: "Email tidak valid" }, { status: 400 });
    }

    const normalizedEmail = emailCheck.value.toLowerCase();

    await prisma.newsletterSubscriber.upsert({
      where: { email: normalizedEmail },
      update: { isActive: true },
      create: { email: normalizedEmail },
    });

    return NextResponse.json({ message: "Berhasil berlangganan!" }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/newsletter]", error);
    return NextResponse.json({ error: "Gagal berlangganan, coba lagi nanti" }, { status: 500 });
  }
}
