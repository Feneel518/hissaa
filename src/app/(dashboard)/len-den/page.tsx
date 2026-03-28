import { requireUser } from "@/lib/checks/auth/RequireUser";
import { getUserExpenses } from "@/lib/actions/expense.actions";
import { getUserGroups } from "@/lib/actions/group.actions";
import FeatureCard from "@/components/ui/feature-card";
import {
  Activity,
  ArrowRight,
  CalendarDays,
  CreditCard,
  FolderKanban,
  HandCoins,
  IndianRupee,
  Plus,
  ReceiptIndianRupee,
  Sparkles,
  TrendingUp,
  User,
  Users,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function formatCurrency(amount: number) {
  return `₹${Math.abs(amount).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getMonthLabel(date = new Date()) {
  return date.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

function isSameMonth(date: Date | string, now = new Date()) {
  const d = new Date(date);
  return (
    d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  );
}

function startOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getExpenseAmount(expense: any) {
  return Number(expense.totalAmount ?? expense.amount ?? 0);
}

function getExpenseDate(expense: any) {
  return new Date(expense.expenseDate ?? expense.createdAt ?? new Date());
}

function getExpenseTitle(expense: any) {
  return expense.title ?? expense.description ?? "Untitled Expense";
}

function getGroupName(group: any) {
  return group.name ?? "Unnamed Group";
}

function StatCard({
  title,
  value,
  description,
  icon,
  href,
  tone = "default",
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  href?: string;
  tone?: "default" | "primary" | "success" | "dark";
}) {
  const toneStyles = {
    default:
      "border-border bg-card text-card-foreground hover:border-primary/20",
    primary:
      "border-primary/15 bg-primary/[0.06] text-foreground hover:border-primary/30",
    success:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    dark: "border-neutral-800 bg-neutral-950 text-white",
  };

  const card = (
    <div
      className={`group h-full rounded-[2rem] border p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${toneStyles[tone]}`}>
      <div className="flex h-full flex-col justify-between gap-6">
        <div className="flex items-center justify-between">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-background/70">
            {icon}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <h3 className="mt-2 text-3xl font-mono font-semibold tracking-tight">
            {value}
          </h3>
          <p className="mt-2 text-sm opacity-70">{description}</p>
        </div>
      </div>
    </div>
  );

  return href ? <Link href={href}>{card}</Link> : card;
}

function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-2xl font-serif text-foreground">{title}</h2>
        {description ? (
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export default async function DashboardPage() {
  const user = await requireUser();

  const [expensesRes, groupsRes] = await Promise.all([
    getUserExpenses(),
    getUserGroups(),
  ]);

  const expenses = expensesRes.success ? (expensesRes.expenses ?? []) : [];
  const groups = groupsRes.success ? (groupsRes.groups ?? []) : [];

  const now = new Date();
  const monthStart = startOfMonth(now);

  const personalGroup =
    groups.find((group: any) => group.isPersonal) ??
    groups.find((group: any) =>
      String(group.name ?? "")
        .toLowerCase()
        .includes("personal"),
    );

  const personalExpenses = personalGroup
    ? expenses.filter((expense: any) => expense.group?.id === personalGroup.id)
    : [];

  const sharedExpenses = personalGroup
    ? expenses.filter((expense: any) => expense.group?.id !== personalGroup.id)
    : expenses;

  const totalTracked = expenses.reduce(
    (sum: number, expense: any) => sum + getExpenseAmount(expense),
    0,
  );

  const thisMonthExpenses = expenses.filter((expense: any) =>
    isSameMonth(getExpenseDate(expense), now),
  );

  const thisMonthTotal = thisMonthExpenses.reduce(
    (sum: number, expense: any) => sum + getExpenseAmount(expense),
    0,
  );

  const personalSpent = personalExpenses.reduce(
    (sum: number, expense: any) => sum + getExpenseAmount(expense),
    0,
  );

  const personalThisMonth = personalExpenses
    .filter((expense: any) => isSameMonth(getExpenseDate(expense), now))
    .reduce((sum: number, expense: any) => sum + getExpenseAmount(expense), 0);

  const sharedThisMonth = sharedExpenses
    .filter((expense: any) => isSameMonth(getExpenseDate(expense), now))
    .reduce((sum: number, expense: any) => sum + getExpenseAmount(expense), 0);

  const avgExpense =
    expenses.length > 0 ? totalTracked / Math.max(expenses.length, 1) : 0;

  const recentExpenses = [...expenses]
    .sort(
      (a: any, b: any) =>
        getExpenseDate(b).getTime() - getExpenseDate(a).getTime(),
    )
    .slice(0, 6);

  const recentPersonalExpenses = [...personalExpenses]
    .sort(
      (a: any, b: any) =>
        getExpenseDate(b).getTime() - getExpenseDate(a).getTime(),
    )
    .slice(0, 4);

  const groupsWithTotals = groups
    .map((group: any) => {
      const groupExpenses = expenses.filter(
        (expense: any) => expense.group?.id === group.id,
      );

      const total = groupExpenses.reduce(
        (sum: number, expense: any) => sum + getExpenseAmount(expense),
        0,
      );

      return {
        ...group,
        expenseCount: groupExpenses.length,
        total,
      };
    })
    .sort((a: any, b: any) => b.total - a.total)
    .slice(0, 5);

  const activeGroups = groups.length;
  const firstName = user.name?.split(" ")[0] || "Friend";
  const recentCount = expenses.filter(
    (expense: any) => getExpenseDate(expense) >= monthStart,
  ).length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[2.75rem] border border-primary/10 bg-card px-6 py-8 shadow-sm sm:px-8 lg:px-10 lg:py-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.07] via-transparent to-primary/[0.03]" />
        <div className="absolute -top-16 right-0 size-56 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-20 left-0 size-56 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-background/80 px-4 py-2 text-xs font-medium text-muted-foreground backdrop-blur">
              <Sparkles className="size-3.5 text-primary" />
              Live overview for {getMonthLabel()}
            </div>

            <h1 className="text-4xl font-serif tracking-tight text-foreground sm:text-5xl xl:text-6xl">
              Welcome back, <span className="text-primary">{firstName}</span>.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              Monitor personal spending, group activity, and recent expenses
              from one clean dashboard.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild className="h-11 rounded-full px-5">
              <Link href="/expenses/new">
                <Plus className="mr-2 size-4" />
                Add Expense
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="h-11 rounded-full px-5">
              <Link href="/history">
                <Activity className="mr-2 size-4" />
                View History
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Top summary */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_1fr]">
        <div className="rounded-[2.5rem] bg-gradient-to-br from-primary to-primary/85 p-7 text-primary-foreground shadow-xl sm:p-8 lg:p-10">
          <div className="flex h-full min-h-[290px] flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex size-14 items-center justify-center rounded-[1.25rem] bg-white/15 backdrop-blur">
                <Wallet className="size-7 text-white" />
              </div>

              <div className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-medium text-white/90 backdrop-blur">
                Total Tracked
              </div>
            </div>

            <div>
              <p className="mb-2 text-base font-medium text-primary-foreground/80">
                All recorded expenses
              </p>
              <h2 className="text-5xl font-mono tracking-tighter sm:text-6xl lg:text-7xl">
                {formatCurrency(totalTracked)}
              </h2>
              <p className="mt-4 max-w-md text-sm leading-6 text-primary-foreground/75">
                Across {activeGroups} group{activeGroups === 1 ? "" : "s"} and{" "}
                {expenses.length} expense{expenses.length === 1 ? "" : "s"}.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-1">
          <StatCard
            href="/expenses"
            title="This Month"
            value={formatCurrency(thisMonthTotal)}
            description={`${recentCount} expense${recentCount === 1 ? "" : "s"} added this month`}
            tone="primary"
            icon={<CalendarDays className="size-5 text-primary" />}
          />

          <StatCard
            href="/groups"
            title="Active Groups"
            value={String(activeGroups)}
            description="Groups where you are tracking shared money"
            tone="success"
            icon={<Users className="size-5" />}
          />
        </div>
      </section>

      {/* Stats grid */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          href="/expenses"
          title="Total Expenses"
          value={String(expenses.length)}
          description="All tracked transactions"
          icon={<ReceiptIndianRupee className="size-5 text-primary" />}
        />

        <StatCard
          href="/expenses?tab=personal"
          title="Personal Spend"
          value={formatCurrency(personalSpent)}
          description="All expenses in your personal group"
          icon={<User className="size-5 text-primary" />}
        />

        <StatCard
          href="/expenses"
          title="Average Expense"
          value={formatCurrency(avgExpense)}
          description="Average value per transaction"
          icon={<TrendingUp className="size-5 text-primary" />}
        />

        <StatCard
          href="/groups"
          title="Shared This Month"
          value={formatCurrency(sharedThisMonth)}
          description="Group expenses added this month"
          tone="dark"
          icon={<HandCoins className="size-5 text-white" />}
        />
      </section>

      {/* Personal + monthly split */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[2rem] border bg-card p-6 shadow-sm sm:p-7">
          <SectionHeading
            eyebrow="Personal"
            title="Your Own Expenses"
            description="Only expenses added under your personal group."
            action={
              <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <User className="size-5" />
              </div>
            }
          />

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border bg-background/70 p-4">
              <p className="text-sm font-medium text-muted-foreground">
                Personal Expenses
              </p>
              <h4 className="mt-2 text-3xl font-mono font-semibold">
                {personalExpenses.length}
              </h4>
            </div>

            <div className="rounded-2xl border bg-background/70 p-4">
              <p className="text-sm font-medium text-muted-foreground">
                This Month
              </p>
              <h4 className="mt-2 text-3xl font-mono font-semibold">
                {formatCurrency(personalThisMonth)}
              </h4>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {recentPersonalExpenses.length === 0 ? (
              <div className="rounded-2xl border border-dashed bg-background/60 p-8 text-center">
                <p className="font-medium text-foreground">
                  No personal expenses yet
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Start by adding an expense in your personal group.
                </p>
              </div>
            ) : (
              recentPersonalExpenses.map((expense: any) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between rounded-2xl border bg-background/70 px-4 py-4">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">
                      {getExpenseTitle(expense)}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatDate(getExpenseDate(expense))}
                    </p>
                  </div>

                  <p className="ml-4 shrink-0 font-mono text-sm font-semibold">
                    {formatCurrency(getExpenseAmount(expense))}
                  </p>
                </div>
              ))
            )}
          </div>

          <div className="mt-6">
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/expenses?tab=personal">View Personal Expenses</Link>
            </Button>
          </div>
        </div>

        <div className="rounded-[2rem] border bg-card p-6 shadow-sm sm:p-7">
          <SectionHeading
            eyebrow="Overview"
            title="Monthly Breakdown"
            description="Quick comparison between your personal and shared spending."
          />

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border bg-background/70 p-5 min-w-0">
              <p className="text-sm text-muted-foreground">Total This Month</p>
              <p className="mt-2 break-words text-2xl sm:text-3xl font-mono font-semibold leading-tight tracking-tight">
                {formatCurrency(thisMonthTotal)}
              </p>
            </div>

            <div className="rounded-2xl border bg-background/70 p-5 min-w-0">
              <p className="text-sm text-muted-foreground">Personal</p>
              <p className="mt-2 break-words text-2xl sm:text-3xl font-mono font-semibold leading-tight tracking-tight">
                {formatCurrency(personalThisMonth)}
              </p>
            </div>

            <div className="rounded-2xl border bg-background/70 p-5 min-w-0">
              <p className="text-sm text-muted-foreground">Shared</p>
              <p className="mt-2 break-words text-2xl sm:text-3xl font-mono font-semibold leading-tight tracking-tight">
                {formatCurrency(sharedThisMonth)}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-[1.75rem] border bg-background/50 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Recent Activity</h3>
              <Button asChild variant="ghost" className="rounded-full px-3">
                <Link href="/history">
                  See all
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>

            {recentExpenses.length === 0 ? (
              <div className="rounded-2xl border border-dashed bg-background/60 p-8 text-center">
                <p className="font-medium text-foreground">No expenses yet</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Add your first expense to start seeing activity.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentExpenses.map((expense: any) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between rounded-2xl border bg-card px-4 py-4">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">
                        {getExpenseTitle(expense)}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <span>{formatDate(getExpenseDate(expense))}</span>
                        <span>•</span>
                        <span>{expense.group?.name ?? "No group"}</span>
                      </div>
                    </div>

                    <p className="ml-4 shrink-0 font-mono text-sm font-semibold">
                      {formatCurrency(getExpenseAmount(expense))}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Groups */}
      <section className="space-y-5">
        <SectionHeading
          eyebrow="Groups"
          title="Top Groups by Spend"
          description="Where most of your tracked money movement is happening."
          action={
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/groups">View All Groups</Link>
            </Button>
          }
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border bg-card p-6 shadow-sm sm:p-7">
            {groupsWithTotals.length === 0 ? (
              <div className="rounded-2xl border border-dashed bg-background/60 p-10 text-center">
                <p className="font-medium text-foreground">No groups found</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Create a group to start splitting expenses.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {groupsWithTotals.map((group: any) => (
                  <div
                    key={group.id}
                    className="flex items-center justify-between rounded-2xl border bg-background/70 px-4 py-4">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">
                        {getGroupName(group)}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {group.expenseCount} expense
                        {group.expenseCount === 1 ? "" : "s"}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-mono text-sm font-semibold">
                        {formatCurrency(group.total)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6">
            <FeatureCard
              href="/groups"
              height={260}
              width={320}
              variant="primary"
              className="w-full">
              <div className="flex h-full flex-col justify-between">
                <div className="flex size-16 items-center justify-center rounded-[1.5rem] bg-white/15 backdrop-blur">
                  <Users className="size-8 text-white" />
                </div>

                <div>
                  <h3 className="text-3xl font-mono font-bold tracking-tight">
                    Groups
                  </h3>
                  <p className="mt-2 max-w-[18rem] text-sm leading-6 text-primary-foreground/80">
                    Manage your circles, shared expenses, and members.
                  </p>
                </div>
              </div>
            </FeatureCard>

            <FeatureCard
              href="/expenses"
              height={260}
              width={320}
              variant="gradientDark"
              className="w-full">
              <div className="flex h-full flex-col justify-between">
                <div className="flex size-16 items-center justify-center rounded-[1.5rem] bg-white/10 backdrop-blur">
                  <CreditCard className="size-8 text-white" />
                </div>

                <div>
                  <h3 className="text-3xl font-mono font-bold tracking-tight">
                    Expenses
                  </h3>
                  <p className="mt-2 max-w-[18rem] text-sm leading-6 text-white/75">
                    Browse all tracked money movement and recent records.
                  </p>
                </div>
              </div>
            </FeatureCard>
          </div>
        </div>
      </section>

      {/* Bottom quick action strip */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <StatCard
          href="/expenses/new"
          title="Add New Expense"
          value="Create"
          description="Quickly log a personal or shared expense"
          tone="primary"
          icon={<Plus className="size-5 text-primary" />}
        />

        <StatCard
          href="/history"
          title="History"
          value="Review"
          description="See your past expense activity and timeline"
          icon={<Activity className="size-5 text-primary" />}
        />

        <StatCard
          href="/groups"
          title="Manage Groups"
          value="Open"
          description="Handle members, groups, and shared spending"
          icon={<FolderKanban className="size-5 text-primary" />}
        />
      </section>
    </div>
  );
}
