"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Plus, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

async function fetchGroups() {
  const res = await fetch("/api/groups");
  if (!res.ok) throw new Error("Failed to fetch groups");
  return res.json();
}

export default function GroupsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["groups"],
    queryFn: fetchGroups,
  });

  const groups = data?.groups || [];
  const success = data?.success;

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="px-1">
          <h1 className="text-3xl md:text-5xl font-serif tracking-tight text-foreground">
            Your Groups
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">
            Manage your shared expenses and friend circles.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/groups/new">
            <Button size="lg" className="rounded-full shadow-lg h-12 px-6">
              <Plus className="mr-2" size={20} /> Create Group
            </Button>
          </Link>
        </div>
      </div>

      {!success || groups.length === 0 ? (
        <div className="rounded-[2.5rem] bg-card border shadow-sm p-8 md:p-12 text-center">
          <h3 className="text-xl font-medium text-foreground">No groups yet</h3>
          <p className="text-muted-foreground mt-2">
            Create a group to start sharing expenses.
          </p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(var(--primary),0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(var(--primary),0.10),transparent_24%)]" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3">
            {groups.map((group: any) => (
              <Link
                key={group.id}
                href={`/groups/${group.id}`}
                className="group block">
                <div className="relative h-full min-h-[280px] overflow-hidden rounded-4xl border border-white/10 bg-linear-to-br from-white/8 via-white/4 to-transparent p-px shadow-[0_10px_40px_rgba(0,0,0,0.18)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_70px_rgba(0,0,0,0.28)]">
                  {/* animated glow */}
                  <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                    <div className="absolute -left-10 -top-10 h-36 w-36 rounded-full bg-primary/20 blur-3xl transition-all duration-700 group-hover:scale-125" />
                    <div className="absolute -bottom-12 -right-12 h-40 w-40 rounded-full bg-primary/15 blur-3xl transition-all duration-700 group-hover:scale-125" />
                  </div>

                  {/* card body */}
                  <div className="relative z-10 flex h-full flex-col rounded-4xl border border-white/10 bg-background/70 p-6 backdrop-blur-2xl">
                    {/* floating corner orb */}
                    <div className="absolute right-5 top-5">
                      <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-500 group-hover:rotate-6 group-hover:scale-110">
                        <Users className="size-5 text-primary transition-transform duration-500 group-hover:scale-110" />
                        <div className="absolute inset-0 rounded-2xl bg-primary/10 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />
                      </div>
                    </div>

                    {/* content */}
                    <div className="flex flex-1 flex-col">
                      <div className="pr-16">
                        <div className="mb-3 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground transition-all duration-500 group-hover:border-primary/30 group-hover:text-foreground">
                          {group.baseCurrency || "INR"} Group
                        </div>

                        <h3 className="text-2xl font-semibold tracking-tight text-foreground transition-transform duration-500 ">
                          {group.name}
                        </h3>

                        <p className="mt-3 line-clamp-2 max-w-[90%] text-sm leading-6 text-muted-foreground">
                          {group.description ||
                            "Track shared spending, balances, and settlements in one place."}
                        </p>
                      </div>

                      {/* animated stat row */}
                      <div className="mt-8 grid grid-cols-2 gap-3">
                        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/3 p-4 transition-all duration-500 group-hover:border-primary/20 group-hover:bg-white/5">
                          <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                            Members
                          </p>
                          <div className="mt-2 flex items-end gap-2">
                            <span className="text-3xl font-semibold leading-none tracking-tight text-foreground transition-transform duration-500 group-hover:scale-105">
                              {group._count.members}
                            </span>
                            <span className="pb-1 text-xs text-muted-foreground">
                              people
                            </span>
                          </div>
                        </div>

                        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/3 p-4 transition-all duration-500 group-hover:border-primary/20 group-hover:bg-white/5">
                          <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                            Expenses
                          </p>
                          <div className="mt-2 flex items-end gap-2">
                            <span className="text-3xl font-semibold leading-none tracking-tight text-foreground transition-transform duration-500 group-hover:scale-105">
                              {group._count.expenses}
                            </span>
                            <span className="pb-1 text-xs text-muted-foreground">
                              records
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* bottom section */}
                      <div className="mt-auto pt-8">
                        <div className="flex items-center justify-between">
                          <div className="flex -space-x-2">
                            {[...Array(Math.min(group._count.members, 3))].map(
                              (_, i) => (
                                <div
                                  key={i}
                                  className="flex h-10 w-10 items-center justify-center rounded-full border border-background bg-linear-to-br from-primary/20 to-primary/10 text-xs font-semibold text-primary shadow-sm transition-all duration-500 group-hover:-translate-y-1">
                                  {i + 1}
                                </div>
                              ),
                            )}
                            {group._count.members > 3 && (
                              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-background bg-white/5 text-xs font-semibold text-muted-foreground">
                                +{group._count.members - 3}
                              </div>
                            )}
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
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
