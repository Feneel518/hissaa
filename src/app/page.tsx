import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  IndianRupee,
  Receipt,
  Users,
  Wallet,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: Users,
    title: "Groups that actually make sense",
    description:
      "Create personal, trip, home, couple, office, or custom groups and track every shared expense without confusion.",
  },
  {
    icon: Receipt,
    title: "Split the way you want",
    description:
      "Split equally, by exact amount, percentage, or shares. Hissa keeps every transaction transparent.",
  },
  {
    icon: Wallet,
    title: "Know who owes whom",
    description:
      "Instantly see balances, dues, and settlements so nobody has to scroll through old chats and screenshots.",
  },
  {
    icon: IndianRupee,
    title: "Built for everyday India",
    description:
      "Perfect for roommates, trips, friends, family events, office lunches, and shared household spending.",
  },
  {
    icon: CreditCard,
    title: "Track payments and settle up",
    description:
      "Mark settlements, record who paid, and keep your group balances clean and easy to understand.",
  },
  {
    icon: ShieldCheck,
    title: "Clear, reliable records",
    description:
      "Every expense, payer, split, and settlement stays organized so your money history stays trustworthy.",
  },
];

const stats = [
  { value: "EQUAL", label: "Equal splits" },
  { value: "EXACT", label: "Exact amounts" },
  { value: "%", label: "Percentage splits" },
  { value: "SHARES", label: "Share-based splits" },
];

const steps = [
  {
    step: "01",
    title: "Create your group",
    description:
      "Start a personal ledger or invite friends, family, roommates, or teammates into one shared space.",
  },
  {
    step: "02",
    title: "Add expenses in seconds",
    description:
      "Choose who paid, who owes, and how the expense should be split. Hissa handles the math.",
  },
  {
    step: "03",
    title: "Track balances clearly",
    description:
      "See pending amounts, simplified dues, and recent activity in one clean dashboard.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* HERO */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.10),transparent_35%)]" />
        <div className="mx-auto flex max-w-7xl flex-col gap-16 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-8">
              <Badge
                variant="secondary"
                className="rounded-full px-4 py-1.5 text-sm">
                <Sparkles className="mr-2 size-4" />
                Smart expense sharing for real life
              </Badge>

              <div className="space-y-5">
                <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                  Split expenses without splitting friendships.
                </h1>
                <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
                  Hissa helps you manage shared money with friends, family,
                  roommates, couples, and teams. Add expenses, split them your
                  way, and know exactly who owes what.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="h-12 rounded-full px-6">
                  <Link href="/auth/sign-up">
                    Start for free
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-12 rounded-full px-6">
                  <Link href="/auth/sign-in">Go to Hissa</Link>
                </Button>
              </div>

              <div className="grid max-w-xl grid-cols-2 gap-4 pt-2 sm:grid-cols-4">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border bg-background/80 p-4 backdrop-blur">
                    <div className="text-lg font-semibold">{stat.value}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* HERO PREVIEW */}
            <div className="relative">
              <div className="absolute -left-6 top-10 hidden h-32 w-32 rounded-full bg-primary/10 blur-3xl lg:block" />
              <div className="absolute -right-6 bottom-0 hidden h-32 w-32 rounded-full bg-primary/10 blur-3xl lg:block" />

              <div className="relative rounded-[28px] border bg-card p-4 shadow-2xl">
                <div className="rounded-[24px] border bg-background p-5">
                  <div className="flex items-center justify-between border-b pb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Welcome back
                      </p>
                      <h2 className="text-xl font-semibold">Your Hissa</h2>
                    </div>
                    <div className="rounded-full bg-primary/10 p-3 text-primary">
                      <Wallet className="size-5" />
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <Card className="rounded-2xl shadow-none">
                      <CardContent className="p-5">
                        <p className="text-sm text-muted-foreground">
                          You are owed
                        </p>
                        <div className="mt-2 flex items-center text-2xl font-semibold">
                          ₹4,850
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="rounded-2xl shadow-none">
                      <CardContent className="p-5">
                        <p className="text-sm text-muted-foreground">You owe</p>
                        <div className="mt-2 flex items-center text-2xl font-semibold">
                          ₹1,320
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="mt-5 rounded-2xl border p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="font-medium">Recent group activity</h3>
                      <Badge variant="outline" className="rounded-full">
                        Trip to Goa
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      {[
                        {
                          title: "Dinner at Thalassa",
                          meta: "Merry paid • Split equally",
                          amount: "₹5,000",
                        },
                        {
                          title: "Cab from airport",
                          meta: "Feneel paid • 4 members",
                          amount: "₹1,200",
                        },
                        {
                          title: "Hotel snacks",
                          meta: "Icchadhari paid • Exact split",
                          amount: "₹850",
                        },
                      ].map((item) => (
                        <div
                          key={item.title}
                          className="flex items-center justify-between rounded-xl border p-3">
                          <div>
                            <p className="font-medium">{item.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.meta}
                            </p>
                          </div>
                          <p className="font-semibold">{item.amount}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl border p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="font-medium">Settlements</h3>
                      <Badge className="rounded-full">Optimized</Badge>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between rounded-xl bg-muted/50 p-3">
                        <p className="text-sm">Feneel owes Merry</p>
                        <p className="font-semibold">₹1,333</p>
                      </div>
                      <div className="flex items-center justify-between rounded-xl bg-muted/50 p-3">
                        <p className="text-sm">Merry owes Icchadhari</p>
                        <p className="font-semibold">₹1,333</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* TRUST ROW */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Made for:</span>
            {[
              "Roommates",
              "Trips",
              "Couples",
              "Families",
              "Friends",
              "Teams",
            ].map((item) => (
              <Badge
                key={item}
                variant="outline"
                className="rounded-full px-3 py-1">
                {item}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-primary">Features</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Everything you need to manage shared expenses
          </h2>
          <p className="mt-4 text-muted-foreground">
            Clean records, flexible splitting, and clear balances — all in one
            place.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <Card
                key={feature.title}
                className="group rounded-3xl border bg-card shadow-none transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="mb-4 inline-flex rounded-2xl bg-primary/10 p-3 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-y bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-4">
              <p className="text-sm font-medium text-primary">How it works</p>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Simple enough for daily use.
              </h2>
              <p className="max-w-md text-muted-foreground">
                Hissa is made for speed. Add expenses fast, understand balances
                instantly, and settle fairly.
              </p>
            </div>

            <div className="grid gap-4">
              {steps.map((item) => (
                <div
                  key={item.step}
                  className="flex gap-4 rounded-3xl border bg-background p-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 font-semibold text-primary">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* VALUE PROPS */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-6 lg:grid-cols-3">
          {[
            {
              title: "No awkward money confusion",
              desc: "Everyone can see exactly what was added, who paid, and how the amount was split.",
            },
            {
              title: "Flexible for every kind of group",
              desc: "Use Hissa for a trip, a shared home, office contributions, couple budgets, or even personal tracking.",
            },
            {
              title: "Designed to reduce follow-up chats",
              desc: "Less ‘bro how much do I owe?’ and more clean balances with proper settlement visibility.",
            },
          ].map((item) => (
            <Card key={item.title} className="rounded-3xl shadow-none">
              <CardContent className="p-6">
                <div className="mb-4 inline-flex rounded-full bg-primary/10 p-2 text-primary">
                  <CheckCircle2 className="size-4" />
                </div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {item.desc}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
        <div className="mx-auto max-w-6xl rounded-[32px] border bg-card px-6 py-10 sm:px-10 sm:py-14">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-medium text-primary">
              Start using Hissa
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Keep every shared rupee organized.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Whether it is dinner, rent, trips, petrol, groceries, or office
              spends — Hissa helps you split smarter.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 rounded-full px-6">
                <Link href="/auth/sign-up">
                  Create your account
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 rounded-full px-6">
                <Link href="/len-den">Open app</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
