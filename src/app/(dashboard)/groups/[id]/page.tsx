import AddMemberSheet from "@/components/groups/add-member-sheet";
import SettlementsCard from "@/components/groups/SettlementsCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getGroupBalances } from "@/lib/actions/expense.actions";
import { getGroupDetails } from "@/lib/actions/group.actions";
import { requireUser } from "@/lib/checks/auth/RequireUser";
import {
  ArrowLeft,
  HandCoins,
  Plus,
  Receipt,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();

  // @ts-ignore
  const [res, balancesRes] = await Promise.all([
    getGroupDetails(id),
    getGroupBalances(id, false),
  ]);

  if (!res.success || !res.group) {
    notFound();
  }

  const { group } = res;

  const totalSpending = group.expenses.reduce(
    (sum: number, e: any) => sum + Number(e.totalAmount),
    0,
  );

  const myDebts = balancesRes.myDebts ?? [];
  const moneyOwedToMe = balancesRes.moneyOwedToMe ?? [];
  const allDebts = balancesRes.debts ?? [];
  const netBalance = balancesRes.netBalance ?? 0;

  const rawDebts = balancesRes.debts ?? [];
  const optimizedDebts = balancesRes.optimizedDebts ?? [];
  const isSubscribed = balancesRes.isSubscribed ?? false;

  const visibleSettlements =
    isSubscribed && optimizedDebts.length > 0 ? optimizedDebts : rawDebts;

  // Build userId → { groupMemberId } map for SettleUpDialog
  const memberMap: Record<string, { groupMemberId: string }> = {};
  for (const member of group.members) {
    memberMap[member.user.id] = { groupMemberId: member.id };
  }

  return (
    <div className="relative space-y-8">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.12),transparent_28%),radial-gradient(circle_at_bottom_right,hsl(var(--primary)/0.10),transparent_22%)]" />

      {/* Header */}
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <Link href="/groups">
            <Button
              variant="outline"
              size="icon"
              className="mt-1 hidden size-12 rounded-full border-primary/20 bg-background/80 shadow-sm backdrop-blur md:flex">
              <ArrowLeft className="size-5 text-primary" />
            </Button>
          </Link>

          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
              <Sparkles className="size-3.5 text-primary" />
              Group Overview
            </div>

            <h1 className="text-3xl font-semibold tracking-wide md:text-5xl font-serif">
              {group.name}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <Users className="size-4" />
                {group.members.length} members
              </span>
              <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
              <span>{group.baseCurrency}</span>
              <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
              <span>{group.expenses.length} expenses</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href={`/expenses/new?groupId=${group.id}`}>
            <Button className="h-11 rounded-full px-5 shadow-sm">
              <Plus className="mr-2 size-4" />
              Add Expense
            </Button>
          </Link>

          <Link href={`/settle-up?groupId=${group.id}`}>
            <Button
              variant="outline"
              className="h-11 rounded-full border-primary/20 bg-background/70 px-5 backdrop-blur">
              <HandCoins className="mr-2 size-4" />
              Settle Up
            </Button>
          </Link>
        </div>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden rounded-4xl border border-border/60 bg-card p-6 shadow-sm md:p-8">
        <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-transparent" />
        <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-20 left-0 h-52 w-52 rounded-full bg-primary/5 blur-3xl" />

        <div className="relative z-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total group spending
              </p>
              <h2 className="mt-2 text-4xl font-semibold tracking-wide md:text-6xl font-mono">
                ₹
                {totalSpending.toLocaleString("en-IN", {
                  maximumFractionDigits: 2,
                })}
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-border/60 bg-background/70 p-5 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Net Balance
                </p>
                <p
                  className={`mt-3 text-3xl font-semibold font-mono ${
                    netBalance >= 0 ? "text-emerald-500" : "text-red-500"
                  }`}>
                  {netBalance >= 0 ? "+ " : "- "}₹
                  {Math.abs(netBalance).toLocaleString("en-IN", {
                    maximumFractionDigits: 2,
                  })}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {netBalance > 0
                    ? "You are owed overall"
                    : netBalance < 0
                      ? "You owe overall"
                      : "All settled up"}
                </p>
              </div>

              <div className="rounded-3xl border border-border/60 bg-background/70 p-5 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Total Entries
                </p>
                <p className="mt-3 text-3xl font-semibold tracking-tight">
                  {group.expenses.length}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Expenses added in this group
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-[1.75rem] border border-border/60 bg-background/80 p-6 backdrop-blur">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <Wallet className="size-3.5" />
                Balance snapshot
              </div>

              <div className="mt-5 space-y-4">
                <div className="flex items-center justify-between rounded-2xl border border-red-200/60 bg-red-50/60 p-4 dark:border-red-900/30 dark:bg-red-950/10">
                  <span className="text-sm font-medium text-muted-foreground">
                    You owe
                  </span>
                  <span className="font-mono text-lg font-bold text-red-500">
                    ₹
                    {myDebts
                      .reduce((sum: number, d: any) => sum + d.amount, 0)
                      .toLocaleString("en-IN", {
                        maximumFractionDigits: 2,
                      })}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-emerald-200/60 bg-emerald-50/60 p-4 dark:border-emerald-900/30 dark:bg-emerald-950/10">
                  <span className="text-sm font-medium text-muted-foreground">
                    You are owed
                  </span>
                  <span className="font-mono text-lg font-bold text-emerald-500">
                    ₹
                    {moneyOwedToMe
                      .reduce((sum: number, d: any) => sum + d.amount, 0)
                      .toLocaleString("en-IN", {
                        maximumFractionDigits: 2,
                      })}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-border/50 pt-5">
              <div className="flex -space-x-2">
                {group.members.slice(0, 4).map((member: any) => (
                  <Avatar
                    key={member.id}
                    className="size-10 border-2 border-card shadow-sm">
                    <AvatarImage src={member.user.image || ""} />
                    <AvatarFallback className="bg-primary/10 text-primary uppercase">
                      {(member.user.name || "U")[0]}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>

              <Badge variant="secondary" className="rounded-full px-3 py-1">
                Active Group
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Debt cards */}
      {allDebts.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="rounded-[1.75rem] border border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">You Owe</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {myDebts.length > 0 ? (
                myDebts.map((d: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-2xl border border-border/50 bg-background/70 p-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9 border">
                        <AvatarImage src={d.to?.image || ""} />
                        <AvatarFallback className="bg-muted">
                          {(d.to?.name || "U")[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          {d.to?.name || "Unknown"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          amount payable
                        </p>
                      </div>
                    </div>
                    <span className="font-mono font-semibold text-red-500">
                      ₹
                      {d.amount.toLocaleString("en-IN", {
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Nothing owed.</p>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[1.75rem] border border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">You Are Owed</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {moneyOwedToMe.length > 0 ? (
                moneyOwedToMe.map((d: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-2xl border border-border/50 bg-background/70 p-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9 border">
                        <AvatarImage src={d.from?.image || ""} />
                        <AvatarFallback className="bg-muted">
                          {(d.from?.name || "U")[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          {d.from?.name || "Unknown"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          owes you
                        </p>
                      </div>
                    </div>
                    <span className="font-mono font-semibold text-emerald-500">
                      ₹
                      {d.amount.toLocaleString("en-IN", {
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nobody owes you right now.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main content */}
      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <Card className="rounded-4xl border border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-5 text-primary" />
              Recent Expenses
            </CardTitle>

            <Link href={`/groups/${id}/expenses`}>
              <Button variant="ghost" size="sm" className="rounded-full">
                View All
              </Button>
            </Link>
          </CardHeader>

          <CardContent>
            {group.expenses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Receipt className="mb-4 size-12 text-muted-foreground/25" />
                <p className="font-medium">No expenses recorded yet.</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Start by adding the first expense for this group.
                </p>
                <Link href={`/expenses/new?groupId=${group.id}`}>
                  <Button className="mt-5 rounded-full">
                    <Plus className="mr-2 size-4" />
                    Add First Expense
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-hidden rounded-3xl border border-border/60">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Description</TableHead>
                      <TableHead>Paid By</TableHead>
                      <TableHead>Split</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {group.expenses.map((expense) => {
                      const payerUsers =
                        expense.payers
                          ?.map((p) => p.groupMember?.user)
                          .filter(Boolean) || [];
                      const firstPayer = payerUsers[0];
                      const hasMultiplePayers = payerUsers.length > 1;
                      return (
                        <TableRow
                          key={expense.id}
                          className="hover:bg-muted/20">
                          <TableCell className="font-medium">
                            {expense.title}
                          </TableCell>
                          <TableCell>
                            {payerUsers.length > 0 ? (
                              <div className="flex items-center gap-2">
                                <Avatar className="size-8 border">
                                  <AvatarImage src={firstPayer.image || ""} />
                                  <AvatarFallback className="bg-primary/10 text-primary uppercase">
                                    {(firstPayer.name || "U")[0]}
                                  </AvatarFallback>
                                </Avatar>

                                <span className="text-sm">
                                  {firstPayer.id === user.id
                                    ? "You"
                                    : firstPayer.name}
                                  {hasMultiplePayers
                                    ? ` +${payerUsers.length - 1}`
                                    : ""}
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">
                                Unknown
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="rounded-full capitalize">
                              {expense.splitMethod
                                ?.toLowerCase()
                                .replace("_", " ") ?? "equal"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-mono font-semibold">
                            ₹
                            {Number(expense.totalAmount).toLocaleString(
                              "en-IN",
                              {
                                maximumFractionDigits: 2,
                              },
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-4xl border border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="size-5 text-primary" />
              Members
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            {group.members.map((member) => {
              const memberDebt = allDebts.find(
                (d) => d.from?.id === member.user.id && d.to?.id === user.id,
              );
              const memberOwed = allDebts.find(
                (d) => d.to?.id === member.user.id && d.from?.id === user.id,
              );

              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-[1.25rem] border border-border/50 bg-background/70 p-3 transition-colors hover:bg-muted/30">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-10 border shadow-sm">
                      <AvatarImage src={member.user.image || ""} />
                      <AvatarFallback className="bg-primary/10 text-primary uppercase font-bold">
                        {(member.user.name || "U")[0]}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <p className="text-sm font-medium">
                        {member.user.name || "Unknown"}
                        {user.id === member.user.id && " (You)"}
                      </p>
                      <p className="text-xs capitalize text-muted-foreground">
                        {member.role.toLowerCase()}
                      </p>
                    </div>
                  </div>

                  {user.id !== member.user.id &&
                    (memberDebt ? (
                      <span className="font-mono text-xs font-bold text-emerald-500">
                        you are owed ₹{memberDebt.amount.toFixed(2)}
                      </span>
                    ) : memberOwed ? (
                      <span className="font-mono text-xs font-bold text-red-500">
                        you owe ₹{memberOwed.amount.toFixed(2)}
                      </span>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="rounded-full text-xs">
                        Settled
                      </Badge>
                    ))}
                </div>
              );
            })}

            <div className="pt-2">
              <AddMemberSheet groupId={group.id} />
            </div>
          </CardContent>
        </Card>

        {!isSubscribed && myDebts.length > 1 && (
          <div className="mt-4 rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-4">
            <p className="text-sm font-medium">Unlock Smart Settlements</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Reduce unnecessary transfers with optimized settle-up suggestions.
            </p>
          </div>
        )}

        <SettlementsCard
          debts={visibleSettlements}
          isSubscribed={isSubscribed}
          currentUserId={user.id}
          groupId={group.id}
          groupName={group.name}
          memberMap={memberMap}
        />
      </div>
    </div>
  );
}
