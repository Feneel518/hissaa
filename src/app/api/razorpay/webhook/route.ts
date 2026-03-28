import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma/db";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature") || "";
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "";

    // Verify webhook signature
    if (webhookSecret && webhookSecret !== "your_webhook_secret_here") {
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

      if (expectedSignature !== signature) {
        console.error("[Razorpay Webhook] Invalid signature");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const event = JSON.parse(rawBody);
    const eventType = event?.event;

    // Handle payment link paid event
    if (eventType === "payment_link.paid") {
      const paymentLinkId: string = event?.payload?.payment_link?.entity?.id;
      const razorpayPaymentId: string =
        event?.payload?.payment?.entity?.id;

      if (paymentLinkId) {
        // Find the payment record by providerRef (we store the payment link ID there)
        const payment = await prisma.payment.findFirst({
          where: { providerRef: paymentLinkId },
          include: { settlement: true },
        });

        if (payment) {
          await prisma.$transaction([
            prisma.payment.update({
              where: { id: payment.id },
              data: {
                status: "SUCCESS",
                providerRef: razorpayPaymentId || paymentLinkId,
                completedAt: new Date(),
              },
            }),
            prisma.settlement.update({
              where: { id: payment.settlementId },
              data: {
                status: "COMPLETED",
                settledAt: new Date(),
              },
            }),
          ]);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[Razorpay Webhook] Error:", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
