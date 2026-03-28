import { cn } from "@/lib/utils";
import { MoveUpRight } from "lucide-react";
import Link from "next/link";
import { FC } from "react";

interface FeatureCardProps {
  href?: string;
  children: React.ReactNode;
  height?: number;
  width?: number;
  variant?:
    | "primary"
    | "secondary"
    | "success"
    | "danger"
    | "neutral"
    | "successSoft"
    | "dangerSoft"
    | "warning"
    | "warningSoft"
    | "gradientPrimary"
    | "gradientSuccess"
    | "gradientDanger"
    | "gradientDark"
    | "glass"
    | "outline";
  className?: string;
}

const variantStyles = {
  // 🔹 Core semantic
  primary: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  neutral: "bg-muted text-foreground",

  // 🟢 Financial meaning
  success: "bg-emerald-500 text-white",
  successSoft:
    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",

  danger: "bg-destructive text-destructive-foreground",
  dangerSoft: "bg-destructive/10 text-destructive border border-destructive/20",

  warning: "bg-amber-500 text-white",
  warningSoft: "bg-amber-500/10 text-amber-600 border border-amber-500/20",

  // 🎨 Premium gradients (IMPORTANT for your UI style)
  gradientPrimary:
    "bg-gradient-to-br from-primary via-primary/90 to-primary/70 text-primary-foreground",

  gradientSuccess:
    "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white",

  gradientDanger: "bg-gradient-to-br from-red-500 to-rose-600 text-white",

  gradientDark: "bg-gradient-to-br from-neutral-900 to-neutral-800 text-white",

  // 🧊 Glass / modern SaaS
  glass: "bg-white/10 backdrop-blur-xl border border-white/20 text-foreground",

  // 🪶 Minimal cards
  outline: "bg-background border text-foreground",

  elevated: "bg-card text-foreground shadow-lg border",

  // 🧠 Special (your app specific)
  balancePositive:
    "bg-emerald-500/15 text-emerald-600 border border-emerald-500/20",

  balanceNegative: "bg-red-500/15 text-red-600 border border-red-500/20",

  balanceNeutral: "bg-muted text-muted-foreground border",
};
const FeatureCard: FC<FeatureCardProps> = ({
  href,
  children,
  height = 400,
  width = 400,
  className = "",
  variant = "primary",
}) => {
  return (
    <div
      style={{
        height: height > 200 ? `${height}px` : "400px",
        width: width > 200 ? `${width}px` : "400px",
      }}
      className={cn(
        "relative overflow-hidden rounded-4xl",
        // "transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
        variantStyles[variant],
        className,
      )}>
      {" "}
      <Link
        href={href ?? "#"}
        className="absolute top-0 right-0 z-20 flex size-20 items-center justify-center rounded-full border-2 border-primary bg-background shadow-[0px_0px_0_8px_#f0f2f5] group">
        <MoveUpRight className="text-primary transition-all duration-300 ease-in-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </Link>
      <div
        className={cn(
          "absolute top-0 right-[88px] z-10 h-16 w-10 rounded-tr-full bg-primary",
          variantStyles[variant],
        )}
      />
      <div className="absolute top-0 right-[68px] h-10 w-[55px] bg-background" />
      <div
        className={cn(
          "absolute top-[88px] right-0 z-10 h-16 w-10 rounded-tr-full bg-primary",
          variantStyles[variant],
        )}
      />
      <div className="absolute top-[68px] right-0 h-[55px] w-10 bg-background" />
      <div className="h-full p-8">{children}</div>
    </div>
  );
};

export default FeatureCard;
