"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Banknote,
  Check,
  ChevronRight,
  Copy,
  ExternalLink,
  HandCoins,
  Loader2,
  QrCode,
  Smartphone,
  Wallet,
} from "lucide-react";
import { SettlementMethod } from "@prisma/client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  createManualSettlement,
  createRazorpaySettlement,
} from "@/lib/actions/settlement.actions";

type DebtUser = {
  id: string;
  name: string | null;
  image: string | null;
};

interface SettleUpDialogProps {
  /** GroupMember.id of the payer */
  fromMemberId: string;
  /** GroupMember.id of the receiver */
  toMemberId: string;
  fromUser: DebtUser;
  toUser: DebtUser;
  amount: number;
  groupId: string;
  groupName: string;
  currency?: string;
  children?: React.ReactNode; // trigger element
}

type PaymentMode = "manual" | "razorpay";

const methodOptions: { value: SettlementMethod; label: string; icon: React.ReactNode }[] = [
  { value: "CASH", label: "Cash", icon: <Banknote className="size-4" /> },
  { value: "UPI", label: "UPI", icon: <Smartphone className="size-4" /> },
  {
    value: "BANK_TRANSFER",
    label: "Bank Transfer",
    icon: <Wallet className="size-4" />,
  },
  { value: "MANUAL", label: "Other", icon: <HandCoins className="size-4" /> },
];

export default function SettleUpDialog({
  fromMemberId,
  toMemberId,
  fromUser,
  toUser,
  amount,
  groupId,
  groupName,
  currency = "INR",
  children,
}: SettleUpDialogProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<PaymentMode>("manual");
  const [method, setMethod] = useState<SettlementMethod>("UPI");
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [paymentLink, setPaymentLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPlaceholder, setIsPlaceholder] = useState(false);

  const handleManualSettle = async () => {
    setIsLoading(true);
    try {
      const res = await createManualSettlement({
        groupId,
        fromMemberId,
        toMemberId,
        amount,
        currency,
        method,
        note: note || undefined,
      });

      if (res.success) {
        toast.success("Settlement recorded! Balances updated.");
        setOpen(false);
        resetState();
      } else {
        toast.error(res.error || "Failed to record settlement");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRazorpaySettle = async () => {
    setIsLoading(true);
    try {
      const res = await createRazorpaySettlement({
        groupId,
        fromMemberId,
        toMemberId,
        amount,
        currency,
        note: note || undefined,
      });

      if (res.success && res.paymentLink) {
        setPaymentLink(res.paymentLink);
        setIsPlaceholder(!!res.isPlaceholder);
        toast.success(
          res.isPlaceholder
            ? "Demo mode: placeholder link generated"
            : "Payment link created!"
        );
      } else {
        toast.error(res.error || "Failed to create payment link");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!paymentLink) return;
    navigator.clipboard.writeText(paymentLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const resetState = () => {
    setMode("manual");
    setMethod("UPI");
    setNote("");
    setPaymentLink(null);
    setCopied(false);
    setIsPlaceholder(false);
  };

  const handleOpenChange = (val: boolean) => {
    setOpen(val);
    if (!val) resetState();
  };

  const trigger = children ?? (
    <Button size="sm" className="rounded-full h-8 px-4 text-xs shadow-sm">
      Settle
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="sm:max-w-md rounded-3xl border border-border/60 shadow-2xl p-0 overflow-hidden">
        {/* Header gradient */}
        <div className="relative bg-linear-to-br from-primary/15 via-primary/5 to-transparent px-6 pt-6 pb-5 border-b border-border/40">
          <div className="absolute -top-10 -right-10 size-32 rounded-full bg-primary/10 blur-3xl" />
          <DialogHeader className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="size-8 rounded-full bg-primary/15 flex items-center justify-center">
                <HandCoins className="size-4 text-primary" />
              </div>
              <Badge variant="secondary" className="rounded-full text-xs">
                {groupName}
              </Badge>
            </div>
            <DialogTitle className="text-xl font-serif">Settle Up</DialogTitle>
            <DialogDescription className="text-sm">
              Record or initiate a payment between members.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* From → To */}
          <div className="flex items-center gap-3 rounded-2xl border border-border/50 bg-muted/30 p-4">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Avatar className="size-9 border-2 border-background shadow-sm shrink-0">
                <AvatarImage src={fromUser.image || ""} />
                <AvatarFallback className="bg-primary/10 text-primary uppercase font-bold text-xs">
                  {(fromUser.name || "?")[0]}
                </AvatarFallback>
              </Avatar>
              <p className="text-sm font-medium truncate">
                {fromUser.name || "Unknown"}
              </p>
            </div>

            <div className="flex flex-col items-center shrink-0">
              <ChevronRight className="size-4 text-muted-foreground" />
              <p className="font-mono font-bold text-sm text-primary">
                ₹{amount.toFixed(2)}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
              <p className="text-sm font-medium truncate text-right">
                {toUser.name || "Unknown"}
              </p>
              <Avatar className="size-9 border-2 border-background shadow-sm shrink-0">
                <AvatarImage src={toUser.image || ""} />
                <AvatarFallback className="bg-emerald-500/10 text-emerald-600 uppercase font-bold text-xs">
                  {(toUser.name || "?")[0]}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* Payment link result */}
          {paymentLink ? (
            <div className="space-y-3">
              {isPlaceholder && (
                <div className="rounded-xl border border-dashed border-amber-400/50 bg-amber-50/50 dark:bg-amber-950/20 p-3 text-xs text-amber-700 dark:text-amber-400 text-center">
                  Demo mode — Add real Razorpay keys to `.env` for live links
                </div>
              )}
              <div className="rounded-2xl border border-border/60 bg-muted/30 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <QrCode className="size-4 text-primary" />
                  <p className="text-sm font-medium">Payment Link Ready</p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="flex-1 rounded-xl border bg-background px-3 py-2 text-xs font-mono text-muted-foreground truncate">
                    {paymentLink}
                  </p>
                  <Button
                    size="icon"
                    variant="outline"
                    className="size-9 rounded-xl shrink-0"
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <Check className="size-4 text-emerald-500" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className="size-9 rounded-xl shrink-0"
                    onClick={() => window.open(paymentLink, "_blank")}
                  >
                    <ExternalLink className="size-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Share this link with{" "}
                  <span className="font-medium">{fromUser.name}</span> to
                  collect ₹{amount.toFixed(2)}.
                </p>
              </div>
              <Button
                variant="outline"
                className="w-full rounded-xl"
                onClick={() => {
                  setPaymentLink(null);
                  setOpen(false);
                  resetState();
                }}
              >
                Done
              </Button>
            </div>
          ) : (
            <>
              {/* Mode toggle */}
              <div>
                <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2 block">
                  Payment Method
                </Label>
                <div className="flex gap-2 rounded-2xl border border-border/50 bg-muted/30 p-1">
                  {(["manual", "razorpay"] as PaymentMode[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMode(m)}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                        mode === m
                          ? "bg-background shadow-sm text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {m === "manual" ? "Manual / Cash" : "Razorpay Link"}
                    </button>
                  ))}
                </div>
              </div>

              {mode === "manual" && (
                <div className="space-y-3">
                  <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2 block">
                    How did they pay?
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {methodOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setMethod(opt.value)}
                        className={`flex items-center gap-2 rounded-xl border p-3 text-sm font-medium transition-all duration-200 ${
                          method === opt.value
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                        }`}
                      >
                        {opt.icon}
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Note */}
              <div>
                <Label htmlFor="settle-note" className="text-sm font-medium mb-1.5 block">
                  Note (optional)
                </Label>
                <Input
                  id="settle-note"
                  placeholder="e.g. Paid via PhonePe"
                  className="h-10 rounded-xl"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              {/* Action button */}
              {mode === "manual" ? (
                <Button
                  className="w-full h-12 rounded-xl shadow-lg font-semibold"
                  onClick={handleManualSettle}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="size-4 animate-spin mr-2" />
                  ) : (
                    <Check className="size-4 mr-2" />
                  )}
                  Mark as Settled
                </Button>
              ) : (
                <Button
                  className="w-full h-12 rounded-xl shadow-lg font-semibold"
                  onClick={handleRazorpaySettle}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="size-4 animate-spin mr-2" />
                  ) : (
                    <QrCode className="size-4 mr-2" />
                  )}
                  Generate Payment Link
                </Button>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
