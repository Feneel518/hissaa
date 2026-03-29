"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  ArrowRight,
  HandCoins,
  History,
  Receipt,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

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

async function fetchHistory() {
  const res = await fetch("/api/history");
  if (!res.ok) throw new Error("Failed to fetch history");
  return res.json();
}

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
  }).format(new Date(date));
}

function getSectionLabel(date: Date) {
  const now = new Date();
  const d = new Date(date);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  if (target.getTime() === today.getTime()) return "Today";
  if (target.getTime() === yesterday.getTime()) return "Yesterday";

  return new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
  }).format(d);
}

export default function HistoryPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["history"],
    queryFn: fetchHistory,
  });

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  const rawHistory = data?.history || [];
  const feed: FeedItem[] = rawHistory
    .map((item: any, index: number) => {
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
        avatarFallback: (settlement.fromMember?.user?.name?.[0] ?? "U").toUpperCase(),
      };
    })
    .sort((a: FeedItem, b: FeedItem) => b.date.getTime() - a.date.getTime());

  const grouped = feed.reduce<Record<string, FeedItem[]>>((acc, item) => {
    const label = getSectionLabel(item.date);
    if (!acc[label]) acc[label] = [];
    acc[label].push(item);
    return acc;
  }, {});

  const totalExpenses = feed.filter((item) => item.type === "expense").length;
  const totalSettlements = feed.filter((item) => item.type === "settlement").length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between px-1">
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
          <History className="mx-auto mb-4 size-8 text-primary/40" />
          <h3 className="text-xl font-medium text-foreground">No activity yet</h3>
          <p className="text-muted-foreground mt-2">
            Your expense and settlement activity will appear here.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-[2rem] border border-white/10 bg-background/50 p-6 backdrop-blur-xl">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Total Activity</p>
              <div className="mt-3 flex items-end gap-2">
                <span className="text-4xl font-semibold tracking-tight">{feed.length}</span>
                <span className="pb-1 text-xs text-muted-foreground">entries</span>
              </div>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-background/50 p-6 backdrop-blur-xl">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Expenses</p>
              <div className="mt-3 flex items-end gap-2">
                <span className="text-4xl font-semibold tracking-tight">{totalExpenses}</span>
                <span className="pb-1 text-xs text-muted-foreground">added</span>
              </div>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-background/50 p-6 backdrop-blur-xl">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Settlements</p>
              <div className="mt-3 flex items-end gap-2">
                <span className="text-4xl font-semibold tracking-tight">{totalSettlements}</span>
                <span className="pb-1 text-xs text-muted-foreground">completed</span>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {Object.entries(grouped).map(([label, items]) => (
              <section key={label} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground backdrop-blur-xl">
                    {label}
                  </div>
                  <div className="h-px flex-1 bg-border/50" />
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                  {items.map((item) => (
                    <Link key={item.id} href={`/groups/${item.groupId}`} className="group block">
                      <div className="relative overflow-hidden rounded-4xl border border-white/10 bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Avatar className="size-12 border shadow-sm">
                                    <AvatarImage src={item.avatarSrc} />
                                    <AvatarFallback className="bg-primary/10 text-primary uppercase">{item.avatarFallback}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="text-lg font-semibold tracking-tight text-foreground">{item.title}</h3>
                                    <p className="text-xs text-muted-foreground uppercase tracking-widest">{item.groupName} • {formatDate(item.date)}</p>
                                </div>
                            </div>
                            <div className={`font-mono font-bold text-lg ${item.type === "expense" ? "text-primary" : "text-emerald-500"}`}>
                                {formatAmount(item.amount)}
                            </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
