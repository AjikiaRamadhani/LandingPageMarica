import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { snap } from "@/lib/midtrans";
import { addSubscriptionPeriod, subscriptionNumber } from "@/lib/subscription";

export const dynamic = "force-dynamic";

async function runScheduler(request: Request) {
  const expectedSecret = process.env.SUBSCRIPTION_CRON_SECRET ?? process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");
  const providedSecret = request.headers.get("x-cron-secret") ?? authorization?.replace(/^Bearer\s+/i, "");
  if (!expectedSecret || providedSecret !== expectedSecret) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const dueSubscriptions = await prisma.subscription.findMany({
    where: { status: "ACTIVE", nextBillingAt: { lte: now } },
    include: { plan: true, user: { select: { email: true, name: true, whatsapp: true } } },
    take: 100,
  });
  const results: { subscriptionNumber: string; cycleNumber?: string; status: string }[] = [];

  for (const subscription of dueSubscriptions) {
    const periodStart = subscription.nextBillingAt;
    const periodEnd = addSubscriptionPeriod(periodStart, subscription.plan.interval);
    const cycleNumber = subscriptionNumber("SUBC");
    const deliveryNumber = subscriptionNumber("DEL");
    try {
      const cycle = await prisma.$transaction(async (transaction) => {
        const existing = await transaction.subscriptionCycle.findFirst({ where: { subscriptionId: subscription.id, periodStart, status: "PENDING_PAYMENT" } });
        if (existing) return existing;
        const created = await transaction.subscriptionCycle.create({ data: { cycleNumber, subscriptionId: subscription.id, periodStart, periodEnd, billingDueAt: periodStart, amount: subscription.plan.price, status: "PENDING_PAYMENT" } });
        await transaction.subscriptionDelivery.create({ data: { deliveryNumber, subscriptionId: subscription.id, cycleId: created.id, scheduledAt: periodStart, status: "SCHEDULED" } });
        await transaction.subscription.update({ where: { id: subscription.id }, data: { nextBillingAt: periodEnd, nextDeliveryAt: periodStart } });
        return created;
      });
      if (cycle.cycleNumber !== cycleNumber) {
        results.push({ subscriptionNumber: subscription.subscriptionNumber, cycleNumber: cycle.cycleNumber, status: "already_created" });
        continue;
      }
      const transaction = await snap.createTransaction({
        transaction_details: { order_id: cycle.cycleNumber, gross_amount: subscription.plan.price },
        customer_details: { first_name: subscription.user.name ?? subscription.shippingName, email: subscription.user.email ?? undefined, phone: subscription.user.whatsapp ?? subscription.shippingPhone },
        item_details: [{ id: subscription.plan.id, price: subscription.plan.price, quantity: 1, name: subscription.plan.name.slice(0, 50) }],
      });
      await prisma.subscriptionCycle.update({ where: { id: cycle.id }, data: { midtransOrderId: cycle.cycleNumber, midtransSnapToken: transaction.token ?? transaction.redirect_url } });
      results.push({ subscriptionNumber: subscription.subscriptionNumber, cycleNumber: cycle.cycleNumber, status: "created" });
    } catch (error) {
      console.error("[POST /api/cron/subscriptions]", subscription.subscriptionNumber, error);
      results.push({ subscriptionNumber: subscription.subscriptionNumber, status: "failed" });
    }
  }

  return NextResponse.json({ processed: results.length, results });
}

export async function GET(request: Request) {
  return runScheduler(request);
}

export async function POST(request: Request) {
  return runScheduler(request);
}
