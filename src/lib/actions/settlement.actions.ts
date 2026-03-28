"use server";

import { prisma } from "@/lib/prisma/db";
import { requireUser } from "@/lib/checks/auth/RequireUser";
import { SettlementMethod, SettlementStatus, PaymentProvider, PaymentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { createRazorpayPaymentLink } from "@/lib/razorpay";

// ─────────────────────────────────────────────
// Create a MANUAL settlement (instant / cash / UPI etc.)
// ─────────────────────────────────────────────
export async function createManualSettlement(data: {
  groupId: string;
  fromMemberId: string; // GroupMember.id of the payer
  toMemberId: string;   // GroupMember.id of the receiver
  amount: number;
  currency?: string;
  method: SettlementMethod;
  note?: string;
}) {
  const user = await requireUser();

  try {
    // Auth check — either party must be the current user
    const userMembership = await prisma.groupMember.findFirst({
      where: { groupId: data.groupId, userId: user.id, status: "ACTIVE" },
    });
    if (!userMembership) return { success: false, error: "Unauthorized" };

    const settlement = await prisma.settlement.create({
      data: {
        groupId: data.groupId,
        fromMemberId: data.fromMemberId,
        toMemberId: data.toMemberId,
        createdById: user.id,
        amount: data.amount,
        currency: data.currency || "INR",
        method: data.method,
        status: SettlementStatus.COMPLETED,
        note: data.note,
        settledAt: new Date(),
      },
    });

    revalidatePath(`/groups/${data.groupId}`);
    revalidatePath("/settle-up");
    revalidatePath("/len-den");

    return { success: true, settlement };
  } catch (error) {
    console.error("createManualSettlement error:", error);
    return { success: false, error: "Failed to record settlement" };
  }
}

// ─────────────────────────────────────────────
// Create a RAZORPAY settlement — returns a payment link URL
// ─────────────────────────────────────────────
export async function createRazorpaySettlement(data: {
  groupId: string;
  fromMemberId: string;
  toMemberId: string;
  amount: number;
  currency?: string;
  note?: string;
}) {
  const user = await requireUser();

  try {
    const userMembership = await prisma.groupMember.findFirst({
      where: { groupId: data.groupId, userId: user.id, status: "ACTIVE" },
    });
    if (!userMembership) return { success: false, error: "Unauthorized" };

    // Get receiver's user info for the payment link
    const toMember = await prisma.groupMember.findUnique({
      where: { id: data.toMemberId },
      include: { user: { select: { name: true, email: true } } },
    });

    // Create the settlement record as PENDING
    const settlement = await prisma.settlement.create({
      data: {
        groupId: data.groupId,
        fromMemberId: data.fromMemberId,
        toMemberId: data.toMemberId,
        createdById: user.id,
        amount: data.amount,
        currency: data.currency || "INR",
        method: SettlementMethod.UPI,
        status: SettlementStatus.PENDING,
        note: data.note,
      },
    });

    // Create Razorpay payment link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const isPlaceholder =
      !process.env.RAZORPAY_KEY_ID ||
      process.env.RAZORPAY_KEY_ID === "rzp_test_XXXXXXXXXXXXXXXX";

    if (isPlaceholder) {
      // In placeholder mode: return a fake link so UI still works
      const fakeLink = `https://rzp.io/l/placeholder-${settlement.id.slice(0, 8)}`;
      await prisma.payment.create({
        data: {
          settlementId: settlement.id,
          provider: PaymentProvider.RAZORPAY,
          providerRef: `placeholder_${settlement.id}`,
          status: PaymentStatus.PENDING,
          amount: data.amount,
          currency: data.currency || "INR",
          paymentLink: fakeLink,
          metadataJson: { mode: "placeholder" },
          initiatedAt: new Date(),
        },
      });

      revalidatePath(`/groups/${data.groupId}`);
      revalidatePath("/settle-up");

      return {
        success: true,
        settlement,
        paymentLink: fakeLink,
        isPlaceholder: true,
      };
    }

    const rzpLink = await createRazorpayPaymentLink({
      amount: Math.round(data.amount * 100), // paise
      currency: data.currency || "INR",
      description: data.note || `Settlement for group`,
      customerName: toMember?.user?.name || undefined,
      customerEmail: toMember?.user?.email || undefined,
      callbackUrl: `${baseUrl}/groups/${data.groupId}`,
      referenceId: settlement.id,
    });

    await prisma.payment.create({
      data: {
        settlementId: settlement.id,
        provider: PaymentProvider.RAZORPAY,
        providerRef: rzpLink.id,
        status: PaymentStatus.PENDING,
        amount: data.amount,
        currency: data.currency || "INR",
        paymentLink: rzpLink.short_url,
        initiatedAt: new Date(),
      },
    });

    revalidatePath(`/groups/${data.groupId}`);
    revalidatePath("/settle-up");

    return {
      success: true,
      settlement,
      paymentLink: rzpLink.short_url,
      isPlaceholder: false,
    };
  } catch (error) {
    console.error("createRazorpaySettlement error:", error);
    return { success: false, error: "Failed to create payment link" };
  }
}

// ─────────────────────────────────────────────
// Get all settlements for the current user across groups
// ─────────────────────────────────────────────
export async function getMySettlements() {
  const user = await requireUser();

  try {
    const memberships = await prisma.groupMember.findMany({
      where: { userId: user.id, status: "ACTIVE" },
      select: { id: true, groupId: true },
    });
    const memberIds = memberships.map((m) => m.id);

    const settlements = await prisma.settlement.findMany({
      where: {
        OR: [
          { fromMemberId: { in: memberIds } },
          { toMemberId: { in: memberIds } },
        ],
      },
      include: {
        fromMember: {
          include: { user: { select: { id: true, name: true, image: true } } },
        },
        toMember: {
          include: { user: { select: { id: true, name: true, image: true } } },
        },
        group: { select: { id: true, name: true } },
        payment: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, settlements, currentUserId: user.id, memberIds };
  } catch (error) {
    console.error("getMySettlements error:", error);
    return { success: false, settlements: [], currentUserId: user.id, memberIds: [] };
  }
}

// ─────────────────────────────────────────────
// Get settlement suggestions (debts) for current user
// ─────────────────────────────────────────────
export async function getSettlementSuggestions() {
  const user = await requireUser();

  try {
    // Get all groups the user is in
    const memberships = await prisma.groupMember.findMany({
      where: { userId: user.id, status: "ACTIVE" },
      include: { group: { select: { id: true, name: true } } },
    });

    return { success: true, memberships, currentUserId: user.id };
  } catch (error) {
    console.error("getSettlementSuggestions error:", error);
    return { success: false, memberships: [], currentUserId: user.id };
  }
}
