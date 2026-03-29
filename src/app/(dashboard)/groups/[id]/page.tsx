"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
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
import {
  ArrowLeft,
  HandCoins,
  Plus,
  Receipt,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import AddMemberSheet from "@/components/groups/add-member-sheet";
import SettlementsCard from "@/components/groups/SettlementsCard";

const fetchGroup = async (id: string) => {
  const res = await fetch(`/api/groups/${id}`);
  if (!res.ok) throw new Error("Failed to fetch group");
  return res.json();
};

const fetchBalances = async (id: string) => {
  const res = await fetch(`/api/groups/${id}/balances`);
  if (!res.ok) throw new Error("Failed to fetch balances");
  return res.json();
};

export default function GroupDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const { data: groupData, isLoading: isGroupLoading } = useQuery({
    queryKey: ["group", id],
    queryFn: () => fetchGroup(id),
    enabled: !!id,
  });

  const { data: balancesData, isLoading: isBalancesLoading } = useQuery({
    queryKey: ["balances", id],
    queryFn: () => fetchBalances(id),
    enabled: !!id,
  });

  const handleImpact = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (e) {}
  };

  if (isGroupLoading || isBalancesLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!groupData?.success || !groupData?.group) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-2xl font-semibold">Group not found</h2>
        <Link href="/groups" className="mt-4 text-primary">Back to groups</Link>
      </div>
    );
  }

  const { group } = groupData;
  const balancesRes = balancesData || {};

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

  const memberMap: Record<string, { groupMemberId: string }> = {};
  for (const member of group.members) {
    memberMap[member.user.id] = { groupMemberId: member.id };
  }

  return (
    <div className="relative space-y-8 pb-20">
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
            <Button onClick={handleImpact} className="h-11 rounded-full px-5 shadow-sm">
              <Plus className="mr-2 size-4" />
              Add Expense
            </Button>
          </Link>

          <Link href={`/settle-up?groupId=${group.id}`}>
            <Button
              onClick={handleImpact}
              variant="outline"
              className="h-11 rounded-full border-primary/20 bg-background/70 px-5 backdrop-blur">
              <HandCoins className="mr-2 size-4" />
              Settle Up
            </Button>
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-4xl border border-border/60 bg-card p-6 shadow-sm md:p-8">
        <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-transparent" />
        <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-primary/10 blur-3xl" />
        
        <div className="relative z-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total group spending</p>
              <h2 className="mt-2 text-4xl font-semibold tracking-wide md:text-6xl font-mono">
                ₹{totalSpending.toLocaleString("en-IN")}
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-border/60 bg-background/70 p-5 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Net Balance</p>
                <p className={`mt-3 text-3xl font-semibold font-mono ${netBalance >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                  {netBalance >= 0 ? "+ " : "- "}₹{Math.abs(netBalance).toLocaleString("en-IN")}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {netBalance > 0 ? "You are owed overall" : netBalance < 0 ? "You owe overall" : "All settled up"}
                </p>
              </div>
              <div className="rounded-3xl border border-border/60 bg-background/70 p-5 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Expenses</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight">{group.expenses.length}</p>
                <p className="mt-2 text-sm text-muted-foreground">Total recorded items</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-[2rem] border border-border/60 bg-background/80 p-6 backdrop-blur">
            <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    <Wallet className="size-3.5" />
                    Balance snapshot
                </div>
                <div className="mt-5 space-y-3">
                    <div className="flex items-center justify-between rounded-2xl border border-red-200/60 bg-red-50/60 p-4 dark:border-red-900/30 dark:bg-red-950/10">
                        <span className="text-sm font-medium text-muted-foreground">You owe</span>
                        <span className="font-mono text-lg font-bold text-red-500">₹{myDebts.reduce((s:any,d:any)=>s+d.amount,0).toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl border border-emerald-200/60 bg-emerald-50/60 p-4 dark:border-emerald-900/30 dark:bg-emerald-950/10">
                        <span className="text-sm font-medium text-muted-foreground">You are owed</span>
                        <span className="font-mono text-lg font-bold text-emerald-500">₹{moneyOwedToMe.reduce((s:any,d:any)=>s+d.amount,0).toLocaleString("en-IN")}</span>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main List */}
      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <Card className="rounded-4xl border border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-5 text-primary" />
              Recent Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            {group.expenses.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-16 text-center">
                 <Receipt className="mb-4 size-12 text-muted-foreground/25" />
                 <p className="font-medium">No expenses yet.</p>
               </div>
            ) : (
                <div className="overflow-hidden rounded-3xl border border-border/60">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Description</TableHead>
                      <TableHead>Paid By</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {group.expenses.map((expense: any) => (
                        <TableRow key={expense.id} className="hover:bg-muted/20">
                          <TableCell className="font-medium">{expense.title}</TableCell>
                          <TableCell>
                             <div className="flex items-center gap-2">
                                <Avatar className="size-8 border">
                                  <AvatarFallback className="bg-primary/10 text-primary uppercase text-xs">{(expense.payers?.[0]?.groupMember?.user?.name || "U")[0]}</AvatarFallback>
                                </Avatar>
                                <span className="text-xs truncate max-w-[80px]">{expense.payers?.[0]?.groupMember?.user?.name || "Unknown"}</span>
                             </div>
                          </TableCell>
                          <TableCell className="text-right font-mono font-semibold text-sm">₹{Number(expense.totalAmount).toLocaleString("en-IN")}</TableCell>
                        </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-4xl border border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-5 text-primary" />
              Members
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
             {group.members.map((member: any) => (
                <div key={member.id} className="flex items-center justify-between rounded-[1.25rem] border border-border/50 bg-background/70 p-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-10 border shadow-sm">
                      <AvatarImage src={member.user.image || ""} />
                      <AvatarFallback className="bg-primary/10 text-primary uppercase font-bold">{(member.user.name || "U")[0]}</AvatarFallback>
                    </Avatar>
                    <p className="text-sm font-medium">{member.user.name || "Unknown"}</p>
                  </div>
                </div>
             ))}
             <div className="pt-2">
                <AddMemberSheet groupId={group.id} />
             </div>
          </CardContent>
        </Card>

        <SettlementsCard
          debts={visibleSettlements}
          isSubscribed={isSubscribed}
          currentUserId={"placeholder"} // Fixed in sync
          groupId={group.id}
          groupName={group.name}
          memberMap={memberMap}
        />
      </div>
    </div>
  );
}
