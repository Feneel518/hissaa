import { requireUser } from "@/lib/checks/auth/RequireUser";
import { getMySettlements } from "@/lib/actions/settlement.actions";
import { getGroupBalances } from "@/lib/actions/expense.actions";
import { getUserGroups } from "@/lib/actions/group.actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import SettleUpDialog from "@/components/groups/SettleUpDialog";
import {
  ArrowDownRight,
  ArrowRightLeft,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  HandCoins,
  Plus,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

function formatCurrency(n: number) {
  return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default async function SettleUpPage() {
  const user = await requireUser();
  const [settlementsRes, groupsRes] = await Promise.all([
    getMySettlements(),
    getUserGroups(),
  ]);

  const settlements = settlementsRes.success ? settlementsRes.settlements ?? [] : [];
  const groups = groupsRes.success ? groupsRes.groups ?? [] : [];
  const memberIds = settlementsRes.memberIds ?? [];

  // For each group, compute balances (debts)
  const groupBalancesList = await Promise.all(
    groups.map(async (g) => {
      const res = await getGroupBalances(g.id, false);
      return { group: g, balances: res };
    })
  );

  // Flatten all pending debts involving current user
  const allDebts: {
    groupId: string;
    groupName: string;
    from: { id: string; name: string | null; image: string | null };
    to: { id: string; name: string | null; image: string | null };
    fromMemberId: string;
    toMemberId: string;
    amount: number;
  }[] = [];

  for (const { group, balances } of groupBalancesList) {
    const debts = balances.debts ?? [];
    // Build userId → groupMemberId map for this group
    const memberMap: Record<string, string> = {};
    for (const m of (group as any).members ?? []) {
      memberMap[m.user.id] = m.id;
    }

    for (const debt of debts) {
      if (!debt.from || !debt.to) continue;
      if (
        debt.from.id === user.id ||
        debt.to.id === user.id
      ) {
        allDebts.push({
          groupId: group.id,
          groupName: group.name,
          from: debt.from,
          to: debt.to,
          fromMemberId: memberMap[debt.from.id] || "",
          toMemberId: memberMap[debt.to.id] || "",
          amount: debt.amount,
        });
      }
    }
  }

  const totalYouOwe = allDebts
    .filter((d) => d.from.id === user.id)
    .reduce((s, d) => s + d.amount, 0);

  const totalOwedToYou = allDebts
    .filter((d) => d.to.id === user.id)
    .reduce((s, d) => s + d.amount, 0);

  const completedSettlements = settlements.filter(
    (s: any) => s.status === "COMPLETED"
  );
  const pendingSettlements = settlements.filter(
    (s: any) => s.status === "PENDING"
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif tracking-tight text-foreground">
            Settle Up
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">
            Review and resolve your outstanding balances.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-[2rem] border border-red-200/60 bg-red-50/50 dark:border-red-900/30 dark:bg-red-950/10 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="size-9 rounded-xl bg-red-100 dark:bg-red-950/40 flex items-center justify-center">
              <ArrowUpRight className="size-4 text-red-600 dark:text-red-400" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">You Owe</p>
          </div>
          <p className="text-3xl font-mono font-bold text-red-600 dark:text-red-400">
            {formatCurrency(totalYouOwe)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            across {allDebts.filter((d) => d.from.id === user.id).length} debts
          </p>
        </div>

        <div className="rounded-[2rem] border border-emerald-200/60 bg-emerald-50/50 dark:border-emerald-900/30 dark:bg-emerald-950/10 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="size-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center">
              <ArrowDownRight className="size-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">You Are Owed</p>
          </div>
          <p className="text-3xl font-mono font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(totalOwedToYou)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            across {allDebts.filter((d) => d.to.id === user.id).length} debts
          </p>
        </div>

        <div className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="size-9 rounded-xl bg-muted flex items-center justify-center">
              <CheckCircle2 className="size-4 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Settlements</p>
          </div>
          <p className="text-3xl font-mono font-bold text-foreground">
            {completedSettlements.length}
          </p>
          <p className="text-xs text-muted-foreground mt-1">completed this period</p>
        </div>
      </div>

      {/* Pending Debts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Pending</p>
            <h2 className="text-2xl font-serif text-foreground mt-0.5">Outstanding Balances</h2>
          </div>
        </div>

        {allDebts.length === 0 ? (
          <Card className="rounded-[2rem] border shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <HandCoins className="size-16 text-muted-foreground/20 mb-4" />
              <p className="text-lg font-medium text-muted-foreground">All cleared up!</p>
              <p className="text-sm text-muted-foreground mt-2 mb-6">
                No outstanding balances. Add expenses to start tracking.
              </p>
              <Link href="/expenses/new">
                <Button className="rounded-full">
                  <Plus className="mr-2 size-4" /> Add Expense
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {allDebts.map((debt, idx) => {
              const fromYou = debt.from.id === user.id;
              const toYou = debt.to.id === user.id;

              return (
                <div
                  key={`${debt.groupId}-${debt.from.id}-${debt.to.id}-${idx}`}
                  className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                  {/* Accent glow */}
                  {fromYou && (
                    <div className="absolute -top-10 -right-10 size-28 rounded-full bg-red-500/8 blur-2xl" />
                  )}
                  {toYou && (
                    <div className="absolute -top-10 -right-10 size-28 rounded-full bg-emerald-500/8 blur-2xl" />
                  )}

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="secondary" className="rounded-full text-xs px-2 py-0.5">
                        {debt.groupName}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`rounded-full text-xs ${
                          fromYou
                            ? "border-red-300/60 text-red-600 dark:text-red-400"
                            : "border-emerald-300/60 text-emerald-600 dark:text-emerald-400"
                        }`}>
                        {fromYou ? "You owe" : "Owed to you"}
                      </Badge>
                    </div>

                    {/* From → To */}
                    <div className="flex items-center gap-3 my-4">
                      <div className="flex flex-col items-center gap-1">
                        <Avatar className="size-11 border-2 border-background shadow-sm">
                          <AvatarImage src={debt.from.image || ""} />
                          <AvatarFallback className="bg-primary/10 text-primary font-bold uppercase">
                            {(debt.from.name || "?")[0]}
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-xs font-medium text-center max-w-[72px] truncate">
                          {fromYou ? "You" : debt.from.name}
                        </p>
                      </div>

                      <div className="flex-1 flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1 text-muted-foreground/50">
                          <div className="h-px flex-1 bg-border/60" />
                          <ArrowRightLeft className="size-3.5 text-muted-foreground/40" />
                          <div className="h-px flex-1 bg-border/60" />
                        </div>
                        <p
                          className={`font-mono font-bold text-lg ${
                            fromYou
                              ? "text-red-500"
                              : "text-emerald-500"
                          }`}>
                          {formatCurrency(debt.amount)}
                        </p>
                      </div>

                      <div className="flex flex-col items-center gap-1">
                        <Avatar className="size-11 border-2 border-background shadow-sm">
                          <AvatarImage src={debt.to.image || ""} />
                          <AvatarFallback className="bg-emerald-500/10 text-emerald-600 font-bold uppercase">
                            {(debt.to.name || "?")[0]}
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-xs font-medium text-center max-w-[72px] truncate">
                          {toYou ? "You" : debt.to.name}
                        </p>
                      </div>
                    </div>

                    {/* Settle Button */}
                    {debt.fromMemberId && debt.toMemberId && (
                      <SettleUpDialog
                        fromMemberId={debt.fromMemberId}
                        toMemberId={debt.toMemberId}
                        fromUser={debt.from}
                        toUser={debt.to}
                        amount={debt.amount}
                        groupId={debt.groupId}
                        groupName={debt.groupName}>
                        <Button
                          className="w-full h-10 rounded-xl"
                          size="sm"
                          variant={fromYou ? "default" : "outline"}>
                          <HandCoins className="size-4 mr-2" />
                          {fromYou ? "Pay Now" : "Record Receipt"}
                        </Button>
                      </SettleUpDialog>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Settlement History */}
      {settlements.length > 0 && (
        <div>
          <div className="mb-4">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">History</p>
            <h2 className="text-2xl font-serif text-foreground mt-0.5">Past Settlements</h2>
          </div>
          <div className="space-y-3">
            {settlements.map((settlement: any) => {
              const isPending = settlement.status === "PENDING";
              const isFromMe = memberIds.includes(settlement.fromMember?.id) &&
                settlement.fromMember?.user?.id === user.id;

              return (
                <Card key={settlement.id} className="rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="flex items-center justify-between p-5">
                    <div className="flex items-center gap-4">
                      <Avatar className="size-11 border-2 shadow-sm">
                        <AvatarImage src={settlement.fromMember?.user?.image || ""} />
                        <AvatarFallback className="bg-primary/10 text-primary uppercase font-bold">
                          {(settlement.fromMember?.user?.name || "U")[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-sm text-foreground">
                          {settlement.fromMember?.user?.name}{" "}
                          <span className="text-muted-foreground font-normal">paid</span>{" "}
                          {settlement.toMember?.user?.name}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <span className="font-medium text-foreground/70">{settlement.group?.name}</span>
                          &middot;
                          {settlement.settledAt
                            ? new Date(settlement.settledAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "Pending"}
                          {settlement.note && (
                            <>
                              &middot;
                              <span className="italic">{settlement.note}</span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <p className="font-mono font-bold text-lg text-foreground">
                        {formatCurrency(Number(settlement.amount))}
                      </p>
                      <Badge
                        className={`rounded-full gap-1 ${
                          isPending
                            ? "bg-amber-500/10 text-amber-600 border-amber-300/50"
                            : "bg-emerald-500/10 text-emerald-600 border-emerald-300/50"
                        }`}
                        variant="outline">
                        {isPending ? (
                          <>
                            <Clock className="size-3.5" /> Pending
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="size-3.5" /> Settled
                          </>
                        )}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
