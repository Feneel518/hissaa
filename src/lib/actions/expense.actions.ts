"use server";

import { prisma } from "@/lib/prisma/db";
import { requireUser } from "@/lib/checks/auth/RequireUser";
import { ExpenseStatus, SplitMethod } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { simplifyDebts } from "../helpers/expense/simplifyDebts";

export async function createExpense(data: {
  groupId: string;
  title: string;
  amount: number;
  splitMethod: SplitMethod;
  expenseDate: Date;
  paidByMemberId: string;
  splits: { memberId: string; amount: number }[];
  extraPayers?: { memberId: string; amount: number }[];
  detectedCategoryName?: string;
}) {
  const user = await requireUser();

  try {
    const userMember = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId: data.groupId, userId: user.id } },
    });
    if (!userMember) return { success: false, error: "Unauthorized" };

    // Build full payers list (primary + extras)
    const primaryPayer = {
      memberId: data.paidByMemberId,
      amount: data.extraPayers?.length
        ? data.amount - data.extraPayers.reduce((s, p) => s + p.amount, 0)
        : data.amount,
    };
    const allPayers = [primaryPayer, ...(data.extraPayers ?? [])];

    // Resolve category — find-or-create for this group
    let categoryId: string | undefined;
    if (data.detectedCategoryName) {
      const cat = await prisma.expenseCategory.upsert({
        where: {
          groupId_name: {
            groupId: data.groupId,
            name: data.detectedCategoryName,
          },
        },
        create: {
          groupId: data.groupId,
          name: data.detectedCategoryName,
          isDefault: true,
        },
        update: {},
      });
      categoryId = cat.id;
    }

    const expense = await prisma.$transaction(async (tx) => {
      const newExpense = await tx.expense.create({
        data: {
          groupId: data.groupId,
          createdById: user.id,
          categoryId: categoryId ?? null,
          title: data.title,
          totalAmount: data.amount,
          splitMethod: data.splitMethod,
          expenseDate: data.expenseDate,
          status: ExpenseStatus.ACTIVE,
          payers: {
            create: allPayers.map((p) => ({
              groupMemberId: p.memberId,
              amountPaid: p.amount,
            })),
          },
          participants: {
            create: data.splits.map((split) => ({
              groupMemberId: split.memberId,
              shareAmount: split.amount,
            })),
          },
        },
      });
      return newExpense;
    });

    revalidatePath(`/groups/${data.groupId}`);
    revalidatePath(`/len-den`);
    revalidatePath(`/expenses`);
    return { success: true, expense };
  } catch (error) {
    console.error("Error creating expense:", error);
    return { success: false, error: "Failed to create expense" };
  }
}

export async function getGroupBalances(groupId: string, isSubscribed: boolean) {
  const user = await requireUser();

  try {
    // Fetch all active expenses in the group with payers and participants
    const expenses = await prisma.expense.findMany({
      where: { groupId, status: "ACTIVE" },
      include: {
        payers: {
          include: {
            groupMember: {
              include: {
                user: { select: { id: true, name: true, image: true } },
              },
            },
          },
        },
        participants: {
          include: {
            groupMember: {
              include: {
                user: { select: { id: true, name: true, image: true } },
              },
            },
          },
        },
      },
    });

    // Settlements already made inside this group
    const settlements = await prisma.settlement.findMany({
      where: { groupId },
      include: {
        fromMember: {
          include: { user: { select: { id: true, name: true, image: true } } },
        },
        toMember: {
          include: { user: { select: { id: true, name: true, image: true } } },
        },
      },
    });

    // Build a net balance map: balances[debtorId][creditorId] = amount owed
    // Positive means debtorId owes creditorId
    const balances: Record<string, Record<string, number>> = {};

    const ensureBalance = (a: string, b: string) => {
      if (!balances[a]) balances[a] = {};
      if (!balances[b]) balances[b] = {};
      if (balances[a][b] === undefined) balances[a][b] = 0;
      if (balances[b][a] === undefined) balances[b][a] = 0;
    };

    // For each expense: each payer "lent" money to each participant
    for (const expense of expenses) {
      for (const payer of expense.payers) {
        const payerId = payer.groupMember.user.id;
        const totalPaid = Number(payer.amountPaid);

        for (const participant of expense.participants) {
          const participantId = participant.groupMember.user.id;
          if (payerId === participantId) continue; // same person, skip

          const share = Number(participant.shareAmount);
          // Spread proportionally if multiple payers (simple case: one payer per expense)
          const payerRatio = totalPaid / Number(expense.totalAmount);
          const amountOwed = share * payerRatio;

          ensureBalance(participantId, payerId);
          // participantId owes payerId
          balances[participantId][payerId] += amountOwed;
          balances[payerId][participantId] -= amountOwed;
        }
      }
    }

    // Apply settlements (reduce debts)
    for (const s of settlements) {
      const payerId = s.fromMember.user.id;
      const receiverId = s.toMember.user.id;
      const amount = Number(s.amount);

      ensureBalance(payerId, receiverId);
      balances[payerId][receiverId] -= amount;
      balances[receiverId][payerId] += amount;
    }

    // Build a simplified list: who owes whom how much (ignore tiny rounding)
    const memberMap: Record<
      string,
      { id: string; name: string | null; image: string | null }
    > = {};
    for (const expense of expenses) {
      for (const p of expense.payers) {
        const u = p.groupMember.user;
        memberMap[u.id] = u;
      }
      for (const p of expense.participants) {
        const u = p.groupMember.user;
        memberMap[u.id] = u;
      }
    }

    const debts: Array<{
      from: { id: string; name: string | null; image: string | null };
      to: { id: string; name: string | null; image: string | null };
      amount: number;
    }> = [];

    const seen = new Set<string>();
    for (const [debtorId, creditors] of Object.entries(balances)) {
      for (const [creditorId, amount] of Object.entries(creditors)) {
        const key = [debtorId, creditorId].sort().join("-");
        if (seen.has(key) || amount <= 0.01) continue;
        seen.add(key);
        debts.push({
          from: memberMap[debtorId],
          to: memberMap[creditorId],
          amount: Math.round(amount * 100) / 100,
        });
      }
    }
    const rawDebts = debts;
    const simplifiedDebts = simplifyDebts(rawDebts);
    const visibleDebts = isSubscribed ? simplifiedDebts : rawDebts;

    // Current user's summary
    // const myDebts = debts.filter((d) => d.from?.id === user.id);
    // const moneyOwedToMe = debts.filter((d) => d.to?.id === user.id);

    const myDebts = visibleDebts.filter((d) => d.from?.id === user.id);
    const moneyOwedToMe = visibleDebts.filter((d) => d.to?.id === user.id);
    const totalYouOwe = myDebts.reduce((s, d) => s + d.amount, 0);
    const totalOwedToYou = moneyOwedToMe.reduce((s, d) => s + d.amount, 0);

    return {
      success: true,
      debts: rawDebts, // canonical
      optimizedDebts: isSubscribed ? simplifiedDebts : [],
      myDebts,
      moneyOwedToMe,
      totalYouOwe,
      totalOwedToYou,
      netBalance: totalOwedToYou - totalYouOwe,
      isSubscribed,
    };
  } catch (error) {
    console.error("Error calculating balances:", error);
    return {
      success: false,
      debts: [],
      myDebts: [],
      moneyOwedToMe: [],
      totalYouOwe: 0,
      totalOwedToYou: 0,
      netBalance: 0,
    };
  }
}

export async function getUserExpenses() {
  const user = await requireUser();
  try {
    const memberships = await prisma.groupMember.findMany({
      where: { userId: user.id, status: "ACTIVE" },
      select: { id: true, groupId: true },
    });
    const memberIds = memberships.map((m) => m.id);

    const expenses = await prisma.expense.findMany({
      where: {
        status: ExpenseStatus.ACTIVE,
        participants: { some: { groupMemberId: { in: memberIds } } },
      },
      include: {
        group: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true, image: true } },
        payers: {
          include: {
            groupMember: {
              include: {
                user: { select: { id: true, name: true, image: true } },
              },
            },
          },
        },
        participants: {
          include: {
            groupMember: {
              include: { user: { select: { id: true, name: true } } },
            },
          },
        },
      },
      orderBy: { expenseDate: "desc" },
      take: 100,
    });

    return { success: true, expenses };
  } catch (error) {
    console.error("Error fetching user expenses:", error);
    return { success: false, error: "Failed to fetch expenses", expenses: [] };
  }
}

export async function getDashboardSummary() {
  const user = await requireUser();
  try {
    const memberships = await prisma.groupMember.findMany({
      where: { userId: user.id, status: "ACTIVE" },
      select: { id: true, groupId: true },
    });
    const memberIds = memberships.map((m) => m.id);

    // Total you owe: sum of your participant shares where you are NOT the payer
    const participations = await prisma.expenseParticipant.findMany({
      where: {
        groupMemberId: { in: memberIds },
        expense: { status: ExpenseStatus.ACTIVE },
      },
      include: {
        expense: {
          include: { payers: true },
        },
      },
    });

    let totalYouOwe = 0;
    let totalYouAreOwed = 0;

    for (const participation of participations) {
      const isPayer = participation.expense.payers.some((p) =>
        memberIds.includes(p.groupMemberId),
      );
      if (isPayer) {
        // Others owe this much to you (total amount minus your own share)
        const yourShare = Number(participation.shareAmount);
        const total = Number(participation.expense.totalAmount);
        totalYouAreOwed += total - yourShare;
      } else {
        totalYouOwe += Number(participation.shareAmount);
      }
    }

    return {
      success: true,
      totalYouOwe,
      totalYouAreOwed,
      netBalance: totalYouAreOwed - totalYouOwe,
    };
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    return {
      success: false,
      totalYouOwe: 0,
      totalYouAreOwed: 0,
      netBalance: 0,
    };
  }
}

export async function getSettleUpData() {
  const user = await requireUser();
  try {
    const memberships = await prisma.groupMember.findMany({
      where: { userId: user.id, status: "ACTIVE" },
      select: { id: true, groupId: true, group: { select: { name: true } } },
    });
    const memberIds = memberships.map((m) => m.id);

    // Get settlements
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
      },
      orderBy: { settledAt: "desc" },
    });

    return { success: true, settlements, memberships };
  } catch (error) {
    console.error("Error fetching settle up data:", error);
    return { success: false, settlements: [], memberships: [] };
  }
}

export async function getActivityHistory() {
  const user = await requireUser();
  try {
    const memberships = await prisma.groupMember.findMany({
      where: { userId: user.id, status: "ACTIVE" },
      select: { id: true, groupId: true },
    });
    const memberIds = memberships.map((m) => m.id);
    const groupIds = memberships.map((m) => m.groupId);

    const [expenses, settlements] = await Promise.all([
      prisma.expense.findMany({
        where: { groupId: { in: groupIds }, status: ExpenseStatus.ACTIVE },
        include: {
          group: { select: { id: true, name: true } },
          createdBy: true,
          payers: true,
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.settlement.findMany({
        where: {
          OR: [
            { fromMemberId: { in: memberIds } },
            { toMemberId: { in: memberIds } },
          ],
        },
        include: {
          fromMember: {
            include: {
              user: { select: { id: true, name: true, image: true } },
            },
          },
          toMember: {
            include: {
              user: { select: { id: true, name: true, image: true } },
            },
          },
          group: { select: { id: true, name: true } },
        },
        orderBy: { settledAt: "desc" },
        take: 50,
      }),
    ]);

    // Merge and sort — always resolve date to a non-null value
    const combined = [
      ...expenses.map((e) => ({
        type: "expense" as const,
        date: e.createdAt,
        data: e,
      })),
      ...settlements.map((s) => ({
        type: "settlement" as const,
        date: s.settledAt ?? s.createdAt,
        data: s,
      })),
    ].sort((a, b) => b.date.getTime() - a.date.getTime());

    return { success: true, history: combined };
  } catch (error) {
    console.error("Error fetching history:", error);
    return { success: false };
  }
}
