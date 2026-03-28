import Link from "next/link";
import { requireUser } from "@/lib/checks/auth/RequireUser";
import { getActivityHistory } from "@/lib/actions/expense.actions";
import {
  ArrowRight,
  HandCoins,
  History,
  Receipt,
  Sparkles,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type FeedItem = {
  id: string;
  type: "expense" | "settlement";
  title: string;
  subtitle: string;
  groupId: string;
  groupName: string;
  amount: number;
  date: Date;
  avatarSrc: string;
  avatarFallback: string;
};

function formatAmount(amount: number) {
  return `₹${amount.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getSectionLabel(date: Date) {
  const now = new Date();

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (target.getTime() === today.getTime()) return "Today";
  if (target.getTime() === yesterday.getTime()) return "Yesterday";

  return new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
  }).format(date);
}

export default async function HistoryPage() {
  await requireUser();

  const res = await getActivityHistory();
  const history = res.success ? res.history : [];

  const feed: FeedItem[] = history!
    .map((item, index) => {
      if (item.type === "expense") {
        const expense = item.data;

        return {
          id: expense.id ?? `expense-${index}`,
          type: "expense" as const,
          title: expense.title ?? "Untitled expense",
          subtitle: `${expense.createdBy?.name ?? "Someone"} added an expense`,
          groupId: expense.group?.id ?? "",
          groupName: expense.group?.name ?? "Unknown group",
          amount: Number(expense.totalAmount ?? 0),
          date: new Date(item.date),
          avatarSrc: expense.createdBy?.image ?? "",
          avatarFallback: (expense.createdBy?.name?.[0] ?? "U").toUpperCase(),
        };
      }

      const settlement = item.data;

      return {
        id: settlement.id ?? `settlement-${index}`,
        type: "settlement" as const,
        title: `${settlement.fromMember?.user?.name ?? "Someone"} settled with ${settlement.toMember?.user?.name ?? "someone"}`,
        subtitle: "Balance settled",
        groupId: settlement.group?.id ?? "",
        groupName: settlement.group?.name ?? "Unknown group",
        amount: Number(settlement.amount ?? 0),
        date: new Date(item.date),
        avatarSrc: settlement.fromMember?.user?.image ?? "",
        avatarFallback: (
          settlement.fromMember?.user?.name?.[0] ?? "U"
        ).toUpperCase(),
      };
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  const grouped = feed.reduce<Record<string, FeedItem[]>>((acc, item) => {
    const label = getSectionLabel(item.date);
    if (!acc[label]) acc[label] = [];
    acc[label].push(item);
    return acc;
  }, {});

  const totalExpenses = feed.filter((item) => item.type === "expense").length;
  const totalSettlements = feed.filter(
    (item) => item.type === "settlement",
  ).length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl md:text-5xl font-serif tracking-tight text-foreground">
            Activity History
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">
            Every expense and settlement across your groups, in one place.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-muted-foreground backdrop-blur-xl">
            {feed.length} total records
          </div>
        </div>
      </div>

      {feed.length === 0 ? (
        <div className="rounded-[2.5rem] bg-card border shadow-sm p-8 md:p-12 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
            <History className="size-6 text-primary" />
          </div>
          <h3 className="text-xl font-medium text-foreground">
            No activity yet
          </h3>
          <p className="text-muted-foreground mt-2">
            Your expense and settlement activity will appear here.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-[2rem] border border-white/10 bg-linear-to-br from-white/8 via-white/4 to-transparent p-px shadow-[0_10px_40px_rgba(0,0,0,0.12)]">
              <div className="rounded-[2rem] border border-white/10 bg-background/70 p-5 backdrop-blur-2xl">
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Total Activity
                </p>
                <div className="mt-3 flex items-end gap-2">
                  <span className="text-4xl font-semibold leading-none tracking-tight">
                    {feed.length}
                  </span>
                  <span className="pb-1 text-xs text-muted-foreground">
                    entries
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-linear-to-br from-white/8 via-white/4 to-transparent p-px shadow-[0_10px_40px_rgba(0,0,0,0.12)]">
              <div className="rounded-[2rem] border border-white/10 bg-background/70 p-5 backdrop-blur-2xl">
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Expenses
                </p>
                <div className="mt-3 flex items-end gap-2">
                  <span className="text-4xl font-semibold leading-none tracking-tight">
                    {totalExpenses}
                  </span>
                  <span className="pb-1 text-xs text-muted-foreground">
                    added
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-linear-to-br from-white/8 via-white/4 to-transparent p-px shadow-[0_10px_40px_rgba(0,0,0,0.12)]">
              <div className="rounded-[2rem] border border-white/10 bg-background/70 p-5 backdrop-blur-2xl">
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Settlements
                </p>
                <div className="mt-3 flex items-end gap-2">
                  <span className="text-4xl font-semibold leading-none tracking-tight">
                    {totalSettlements}
                  </span>
                  <span className="pb-1 text-xs text-muted-foreground">
                    completed
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {Object.entries(grouped).map(([label, items]) => (
              <section key={label} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground backdrop-blur-xl">
                    {label}
                  </div>
                  <div className="h-px flex-1 bg-border" />
                </div>

                <div className="relative">
                  <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(120,119,198,0.08),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.06),transparent_24%)]" />

                  <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    {items.map((item) => {
                      const isExpense = item.type === "expense";

                      return (
                        <Link
                          key={item.id}
                          href={item.groupId ? `/groups/${item.groupId}` : "#"}
                          className="group block">
                          <div className="relative h-full overflow-hidden rounded-4xl border border-white/10 bg-linear-to-br from-white/8 via-white/4 to-transparent p-px shadow-[0_10px_40px_rgba(0,0,0,0.18)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_70px_rgba(0,0,0,0.28)]">
                            <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                              <div className="absolute -left-10 -top-10 h-36 w-36 rounded-full bg-primary/20 blur-3xl transition-all duration-700 group-hover:scale-125" />
                              <div
                                className={`absolute -bottom-12 -right-12 h-40 w-40 rounded-full blur-3xl transition-all duration-700 group-hover:scale-125 ${
                                  isExpense
                                    ? "bg-primary/15"
                                    : "bg-emerald-500/15"
                                }`}
                              />
                            </div>

                            <div className="relative z-10 flex h-full flex-col rounded-4xl border border-white/10 bg-background/70 p-6 backdrop-blur-2xl">
                              <div className="absolute right-5 top-5">
                                <div
                                  className={`relative flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-500 group-hover:rotate-6 group-hover:scale-110 ${
                                    isExpense
                                      ? "text-primary"
                                      : "text-emerald-500"
                                  }`}>
                                  {isExpense ? (
                                    <Receipt className="size-5" />
                                  ) : (
                                    <HandCoins className="size-5" />
                                  )}
                                  <div
                                    className={`absolute inset-0 rounded-2xl opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100 ${
                                      isExpense
                                        ? "bg-primary/10"
                                        : "bg-emerald-500/10"
                                    }`}
                                  />
                                </div>
                              </div>

                              <div className="flex flex-1 flex-col">
                                <div className="pr-16">
                                  <div className="mb-3 flex items-center gap-2">
                                    <Badge
                                      variant="outline"
                                      className={`rounded-full border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.18em] ${
                                        isExpense
                                          ? "text-primary"
                                          : "text-emerald-600 dark:text-emerald-400"
                                      }`}>
                                      {isExpense ? "Expense" : "Settlement"}
                                    </Badge>

                                    <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                                      <Sparkles className="size-3" />
                                      {item.groupName}
                                    </div>
                                  </div>

                                  <h3 className="text-2xl font-semibold tracking-tight text-foreground">
                                    {item.title}
                                  </h3>

                                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                                    {item.subtitle}
                                  </p>
                                </div>

                                <div className="mt-8 grid grid-cols-[auto_1fr] gap-4 rounded-3xl border border-white/10 bg-white/3 p-4 transition-all duration-500 group-hover:border-primary/20 group-hover:bg-white/5">
                                  <Avatar className="size-12 border border-white/10 shadow-sm">
                                    <AvatarImage src={item.avatarSrc} />
                                    <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                                      {item.avatarFallback}
                                    </AvatarFallback>
                                  </Avatar>

                                  <div className="min-w-0">
                                    <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                                      Recorded on
                                    </p>
                                    <p className="mt-1 truncate text-sm font-medium text-foreground">
                                      {formatDate(item.date)}
                                    </p>
                                  </div>
                                </div>

                                <div className="mt-4 grid grid-cols-2 gap-3">
                                  <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/3 p-4 transition-all duration-500 group-hover:border-primary/20 group-hover:bg-white/5">
                                    <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                                    <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                                      Amount
                                    </p>
                                    <div className="mt-2 flex items-end gap-2">
                                      <span className="text-2xl font-semibold leading-none tracking-tight text-foreground">
                                        {formatAmount(item.amount)}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/3 p-4 transition-all duration-500 group-hover:border-primary/20 group-hover:bg-white/5">
                                    <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                                    <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                                      Group
                                    </p>
                                    <div className="mt-2 flex items-end gap-2">
                                      <span className="line-clamp-1 text-lg font-semibold leading-none tracking-tight text-foreground">
                                        {item.groupName}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="mt-auto pt-8">
                                  <div className="flex items-center justify-between">
                                    <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-muted-foreground">
                                      View group details
                                    </div>

                                    <div className="flex items-center gap-2 overflow-hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-foreground transition-all duration-500 group-hover:border-primary/30 group-hover:bg-primary/10">
                                      <span className="translate-x-3 opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100">
                                        Open
                                      </span>
                                      <ArrowRight className="size-4 transition-all duration-500 group-hover:translate-x-1" />
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="pointer-events-none absolute inset-0 rounded-4xl">
                                <div className="absolute -left-1/3 top-0 h-px w-1/3 bg-linear-to-r from-transparent via-primary to-transparent opacity-0 transition-all duration-700 group-hover:left-full group-hover:opacity-100" />
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
