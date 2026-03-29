import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronRight,
  CircleDollarSign,
  CreditCard,
  MoveUpRight,
  ReceiptText,
  Sparkles,
  Users2,
  WalletCards,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const pills = ["Trips", "Roommates", "Couples", "Friends", "Home", "Office"];

const balances = [
  {
    name: "Merry",
    role: "Paid for dinner",
    amount: "+₹4,200",
    positive: true,
  },
  {
    name: "Feneel",
    role: "Pending settlement",
    amount: "-₹1,333",
    positive: false,
  },
  {
    name: "Icchadhari",
    role: "Airport cab split",
    amount: "+₹1,333",
    positive: true,
  },
];

const features = [
  {
    icon: ReceiptText,
    title: "Flexible splitting",
    desc: "Equal, exact, percentage, or shares. Real-world expense logic, not toy logic.",
  },
  {
    icon: Users2,
    title: "Built for groups",
    desc: "Track money across trips, homes, couples, teams, and personal ledgers.",
  },
  {
    icon: CircleDollarSign,
    title: "See net balances",
    desc: "Know exactly who owes whom without manually calculating every transaction.",
  },
  {
    icon: CreditCard,
    title: "Settlements that make sense",
    desc: "Keep records of payments and reduce confusion around pending dues.",
  },
];

export default function HissaHomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground overflow-hidden">
      <section className="relative border-b">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.10),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.08),transparent_24%),linear-gradient(to_bottom,transparent,rgba(0,0,0,0.02))]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:72px_72px] opacity-[0.35]" />

        <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <header className="flex items-center justify-between rounded-full border border-border/60 bg-background/70 px-4 py-3 backdrop-blur-xl sm:px-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                <WalletCards className="size-5" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-[15px] font-semibold tracking-tight">
                  Hissa
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Shared money, sorted.
                </span>
              </div>
            </Link>

            <nav className="hidden items-center gap-8 md:flex">
              <Link
                href="#features"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Features
              </Link>
              <Link
                href="#how-it-works"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                How it works
              </Link>
              <Link
                href="/auth/sign-in"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Sign in
              </Link>
            </nav>

            <Button asChild className="rounded-full px-5">
              <Link href="/auth/sign-up">
                Start now
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </header>

          <div className="grid gap-12 pb-14 pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-end lg:pb-20 lg:pt-20">
            <div className="max-w-3xl">
              <Badge className="mb-6 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-primary hover:bg-primary/10">
                <Sparkles className="mr-2 size-4" />
                Expense sharing that doesn’t feel messy
              </Badge>

              <h1 className="max-w-4xl text-5xl font-semibold leading-[0.95] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
                Split money
                <span className="block text-muted-foreground">
                  without breaking the vibe.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
                Hissa helps friends, couples, roommates, and teams track shared
                expenses, balances, and settlements with clarity. No awkward
                chats. No spreadsheet chaos.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="h-12 rounded-full px-6 text-sm">
                  <Link href="/auth/sign-up">
                    Create account
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-12 rounded-full px-6 text-sm">
                  <Link href="/len-den">
                    Open app
                    <ChevronRight className="ml-2 size-4" />
                  </Link>
                </Button>
              </div>

              <div className="mt-10 flex flex-wrap gap-2">
                {pills.map((pill) => (
                  <div
                    key={pill}
                    className="rounded-full border border-border/70 bg-background/70 px-4 py-2 text-sm text-muted-foreground backdrop-blur">
                    {pill}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-10 top-10 h-40 w-40 rounded-full bg-primary/15 blur-3xl" />
              <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-emerald-400/10 blur-3xl" />

              <div className="relative rounded-[32px] border border-border/70 bg-card/80 p-3 shadow-[0_30px_120px_-30px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                <div className="rounded-[26px] border border-border/70 bg-background">
                  <div className="flex items-center justify-between border-b border-border/70 px-5 py-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                        Group overview
                      </p>
                      <h2 className="mt-1 text-lg font-semibold">
                        Goa Escape ’26
                      </h2>
                    </div>

                    <div className="rounded-2xl border border-border/70 bg-muted/40 px-3 py-2 text-right">
                      <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                        Net
                      </div>
                      <div className="text-sm font-semibold">₹6,850</div>
                    </div>
                  </div>

                  <div className="grid gap-3 p-5 sm:grid-cols-2">
                    <div className="rounded-3xl border border-border/70 bg-muted/30 p-4">
                      <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        You are owed
                      </div>
                      <div className="mt-3 text-3xl font-semibold tracking-tight">
                        ₹4,850
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Across 3 pending balances
                      </p>
                    </div>

                    <div className="rounded-3xl border border-border/70 bg-primary text-primary-foreground p-4">
                      <div className="text-xs uppercase tracking-[0.2em] text-primary-foreground/70">
                        You owe
                      </div>
                      <div className="mt-3 text-3xl font-semibold tracking-tight">
                        ₹1,320
                      </div>
                      <p className="mt-2 text-sm text-primary-foreground/80">
                        One clear payment left
                      </p>
                    </div>
                  </div>

                  <div className="px-5 pb-5">
                    <div className="rounded-[28px] border border-border/70 bg-card p-4">
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Live balances</p>
                          <p className="text-xs text-muted-foreground">
                            Recent group activity
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className="rounded-full border-border/70 bg-background">
                          Updated now
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        {balances.map((item) => (
                          <div
                            key={item.name}
                            className="flex items-center justify-between rounded-2xl border border-border/60 bg-background px-4 py-3">
                            <div>
                              <div className="text-sm font-medium">
                                {item.name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {item.role}
                              </div>
                            </div>
                            <div
                              className={`text-sm font-semibold ${
                                item.positive
                                  ? "text-emerald-600"
                                  : "text-foreground"
                              }`}>
                              {item.amount}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border/70 px-5 py-4">
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl bg-muted/30 px-4 py-3">
                        <div className="text-xs text-muted-foreground">
                          Expenses
                        </div>
                        <div className="mt-1 text-lg font-semibold">128</div>
                      </div>
                      <div className="rounded-2xl bg-muted/30 px-4 py-3">
                        <div className="text-xs text-muted-foreground">
                          Members
                        </div>
                        <div className="mt-1 text-lg font-semibold">6</div>
                      </div>
                      <div className="rounded-2xl bg-muted/30 px-4 py-3">
                        <div className="text-xs text-muted-foreground">
                          Settlements
                        </div>
                        <div className="mt-1 text-lg font-semibold">18</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-5 -left-4 hidden w-56 rounded-[28px] border border-border/70 bg-background/90 p-4 shadow-xl backdrop-blur md:block">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Simplified
                    </div>
                    <div className="mt-1 text-sm font-semibold">
                      1 payment needed
                    </div>
                  </div>
                  <div className="rounded-full bg-primary/10 p-2 text-primary">
                    <MoveUpRight className="size-4" />
                  </div>
                </div>
                <div className="mt-3 text-sm text-muted-foreground">
                  Feneel pays Merry{" "}
                  <span className="font-medium text-foreground">₹1,333</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="features"
        className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-primary">
              Why Hissa
            </p>
            <h2 className="mt-4 max-w-md text-3xl font-semibold tracking-tight sm:text-4xl">
              Designed around real shared spending.
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="group rounded-[28px] border border-border/70 bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <div className="flex items-start justify-between">
                    <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                      <Icon className="size-5" />
                    </div>
                    <div className="rounded-full border border-border/70 p-2 text-muted-foreground transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                      <MoveUpRight className="size-4" />
                    </div>
                  </div>

                  <h3 className="mt-6 text-xl font-semibold tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {feature.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="border-y bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mb-12 max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-primary">
              How it works
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Fast enough for daily use.
            </h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {[
              {
                no: "01",
                title: "Create a group",
                desc: "Start a personal ledger or create a shared space for trips, home, friends, or work.",
              },
              {
                no: "02",
                title: "Add expenses",
                desc: "Choose who paid, who owes, and how the amount should be split.",
              },
              {
                no: "03",
                title: "Track and settle",
                desc: "See live balances and settle cleanly with fewer unnecessary back-and-forths.",
              },
            ].map((item) => (
              <div
                key={item.no}
                className="rounded-[30px] border border-border/70 bg-background p-6">
                <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  Step {item.no}
                </div>
                <h3 className="mt-6 text-2xl font-semibold tracking-tight">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[34px] border border-border/70 bg-card p-8 sm:p-10">
            <div className="max-w-xl">
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-primary">
                What makes it better
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                Clear money records without ugly spreadsheets.
              </h2>
              <div className="mt-8 grid gap-4">
                {[
                  "Track who paid and who owes",
                  "Handle multiple split methods properly",
                  "Keep recent activity transparent",
                  "Make settlements easy to understand",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Check className="size-4" />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[34px] border border-border/70 bg-primary p-8 text-primary-foreground sm:p-10">
            <div className="flex h-full flex-col justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-primary-foreground/70">
                  Start using Hissa
                </p>
                <h3 className="mt-4 text-3xl font-semibold tracking-tight">
                  Keep every shared rupee under control.
                </h3>
                <p className="mt-4 max-w-sm text-sm leading-6 text-primary-foreground/80">
                  From dinner bills to rent splits to trip planning, Hissa keeps
                  the math and the relationships cleaner.
                </p>
              </div>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
                <Button
                  asChild
                  variant="secondary"
                  size="lg"
                  className="h-12 rounded-full px-6">
                  <Link href="/auth/sign-up">
                    Get started
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-12 rounded-full border-primary-foreground/20 bg-transparent px-6 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                  <Link href="/len-den">Open app</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
