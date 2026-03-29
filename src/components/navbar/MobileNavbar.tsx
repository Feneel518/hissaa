"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, History, User, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

const navItems = [
  { label: "Home", icon: LayoutDashboard, href: "/" },
  { label: "Groups", icon: Users, href: "/groups" },
  { label: "Add", icon: Plus, href: "/expenses/new", center: true },
  { label: "Activity", icon: History, href: "/history" },
  { label: "Profile", icon: User, href: "/profile" },
];

export default function MobileNavbar() {
  const pathname = usePathname();

  const handleImpact = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (e) {
      // Ignore if not on native
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 block border-t border-white/10 bg-background/80 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.center) {
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleImpact}
                className="relative -top-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_8px_30px_rgba(var(--primary),0.3)] transition-transform active:scale-90">
                <Icon size={24} strokeWidth={2.5} />
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleImpact}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-all active:scale-95",
                isActive ? "text-primary" : "text-muted-foreground",
              )}>
              <div className={cn(
                "rounded-xl p-1.5 transition-colors",
                isActive && "bg-primary/10"
              )}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[10px] font-medium uppercase tracking-widest">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
