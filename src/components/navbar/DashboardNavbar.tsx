"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  Menu,
  Plus,
  Search,
  LogOut,
  Settings,
  User2,
  Users,
} from "lucide-react";
import { FC, useEffect, useState } from "react";

import { NAV_ITEMS } from "@/lib/constants/navbar/NavbarLinks";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DashboardNavbarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  appName?: string;
  addExpenseHref?: string;
}

const DashboardNavbar: FC<DashboardNavbarProps> = ({
  user,
  appName = "hissa.",
  addExpenseHref = "/len-den/expenses/new",
}) => {
  const pathname = usePathname();

  const userName = user?.name || "User";
  const userEmail = user?.email || "No email";
  const userImage = user?.image || "";
  const initials = userName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const isActiveRoute = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{
    groups: any[];
    expenses: any[];
    members: any[];
  }>({
    groups: [],
    expenses: [],
    members: [],
  });
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < 2) {
      setResults({ groups: [], expenses: [], members: [] });
      setOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);

        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
        const data = await res.json();

        setResults({
          groups: data.groups ?? [],
          expenses: data.expenses ?? [],
          members: data.members ?? [],
        });
        setOpen(true);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full  flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="lg:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-full border-border/70 bg-background shadow-sm">
                    <Menu className="size-5" />
                  </Button>
                </SheetTrigger>

                <SheetContent
                  side="left"
                  className="w-[310px] border-r border-border/60 px-0">
                  <SheetHeader className="border-b border-border/60 px-6 pb-4">
                    <SheetTitle className="text-left font-mono text-2xl tracking-tight">
                      {appName}
                    </SheetTitle>
                    <p className="text-left text-sm text-muted-foreground">
                      Manage your groups, expenses and settlements
                    </p>
                  </SheetHeader>

                  <div className="px-4 py-5">
                    <div className="relative mb-5">
                      <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search..."
                        className="h-11 rounded-full border-border/70 bg-muted/40 pl-10"
                      />
                    </div>

                    <nav className="space-y-1">
                      {NAV_ITEMS.map((nav) => {
                        const Icon = nav.icon;
                        const active = isActiveRoute(nav.href);

                        return (
                          <Link
                            key={nav.href}
                            href={nav.href}
                            className={cn(
                              "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-all",
                              active
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground",
                            )}>
                            {Icon ? <Icon className="size-4" /> : null}
                            <span>{nav.label}</span>
                          </Link>
                        );
                      })}
                    </nav>

                    <div className="mt-6">
                      <Button asChild className="h-11 w-full rounded-full">
                        <Link href={addExpenseHref}>
                          <Plus className="mr-2 size-4" />
                          Add Expense
                        </Link>
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <Link href="/len-den" className="shrink-0">
              <h1 className="font-mono text-xl font-bold tracking-tight sm:text-2xl">
                {appName}
              </h1>
            </Link>

            <nav className="hidden items-center gap-2 lg:flex">
              {NAV_ITEMS.map((nav) => {
                const active = isActiveRoute(nav.href);

                return (
                  <Link
                    key={nav.href}
                    href={nav.href}
                    className={cn(
                      "rounded-full px-4 py-2 text-sm font-medium transition-all",
                      active
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}>
                    {nav.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="hidden flex-1 justify-center px-4 lg:flex">
            <div className="relative w-full max-w-md xl:max-w-lg">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search expenses, groups, people..."
                className="h-11 rounded-full border-border/70 bg-muted/40 pl-10 shadow-sm"
              />
              {open && (
                <div className="absolute top-[calc(100%+10px)] left-0 z-50 w-full rounded-3xl border bg-background p-3 shadow-2xl">
                  {loading ? (
                    <div className="px-3 py-4 text-sm text-muted-foreground">
                      Searching...
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {results.groups.length > 0 && (
                        <div>
                          <p className="px-3 pb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Groups
                          </p>
                          {results.groups.map((group) => (
                            <Link
                              key={group.id}
                              href={`/len-den/groups/${group.id}`}
                              className="block rounded-2xl px-3 py-2 hover:bg-muted">
                              <p className="text-sm font-medium">
                                {group.name}
                              </p>
                            </Link>
                          ))}
                        </div>
                      )}

                      {results.expenses.length > 0 && (
                        <div>
                          <p className="px-3 pb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Expenses
                          </p>
                          {results.expenses.map((expense) => (
                            <Link
                              key={expense.id}
                              href={`/len-den/groups/${expense.group.id}`}
                              className="block rounded-2xl px-3 py-2 hover:bg-muted">
                              <p className="text-sm font-medium">
                                {expense.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {expense.group.name} • ₹{expense.amount}
                              </p>
                            </Link>
                          ))}
                        </div>
                      )}

                      {results.members.length > 0 && (
                        <div>
                          <p className="px-3 pb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            People
                          </p>
                          {results.members.map((member) => (
                            <div
                              key={member.id}
                              className="rounded-2xl px-3 py-2 hover:bg-muted">
                              <p className="text-sm font-medium">
                                {member.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {member.email}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {results.groups.length === 0 &&
                        results.expenses.length === 0 &&
                        results.members.length === 0 && (
                          <div className="px-3 py-4 text-sm text-muted-foreground">
                            No results found.
                          </div>
                        )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              asChild
              className="hidden h-11 rounded-full px-5 md:inline-flex">
              <Link href={addExpenseHref}>
                <Plus className="mr-2 size-4" />
                Add Expense
              </Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-11 rounded-full border border-transparent px-2 hover:border-border/60 hover:bg-muted/50 sm:px-3">
                  <Avatar className="size-8 sm:size-9">
                    <AvatarImage src={userImage} alt={userName} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>

                  <div className="ml-2 hidden text-left sm:block">
                    <p className="max-w-[140px] truncate text-sm font-medium leading-none">
                      {userName}
                    </p>
                    <p className="mt-1 max-w-[160px] truncate text-xs text-muted-foreground leading-none">
                      {userEmail}
                    </p>
                  </div>

                  <ChevronDown className="ml-2 hidden size-4 text-muted-foreground sm:block" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-64 rounded-2xl border-border/60 p-2 shadow-xl">
                <DropdownMenuLabel className="px-2 py-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9">
                      <AvatarImage src={userImage} alt={userName} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {userName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {userEmail}
                      </p>
                    </div>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild className="cursor-pointer rounded-xl">
                  <Link href="/profile">
                    <User2 className="mr-2 size-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild className="cursor-pointer rounded-xl">
                  <Link href="/groups">
                    <Users className="mr-2 size-4" />
                    Your Groups
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild className="cursor-pointer rounded-xl">
                  <Link href="/settings">
                    <Settings className="mr-2 size-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  asChild
                  className="cursor-pointer rounded-xl text-red-500 focus:text-red-500">
                  <Link href="/auth/logout">
                    <LogOut className="mr-2 size-4" />
                    Log out
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="lg:hidden">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search expenses, groups, people..."
              className="h-11 rounded-full border-border/70 bg-muted/40 pl-10 shadow-sm"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardNavbar;
