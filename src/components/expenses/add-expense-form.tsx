"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Loader2,
  Plus,
  Trash2,
  Receipt,
  SplitSquareHorizontal,
  CreditCard,
  Sparkles,
  Tag,
  X,
} from "lucide-react";
import * as z from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { createExpense } from "@/lib/actions/expense.actions";
import { SplitMethod } from "@prisma/client";
import { Suspense } from "react";
import {
  EXPENSE_CATEGORIES,
  type ExpenseCategory,
  detectCategoryFromTitle,
} from "@/lib/helpers/expense/category-detector";

const expenseSchema = z.object({
  groupId: z.string().min(1, "Please select a group"),
  title: z.string().min(2, "Description must be at least 2 characters"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  splitMethod: z.nativeEnum(SplitMethod),
});

type PaidBy = {
  memberId: string;
  amount: number;
};

type SplitEntry = {
  memberId: string;
  value: number;
  included: boolean;
};

function SmartCategoryChip({
  category,
  isDetecting,
  onClear,
  onSelect,
}: {
  category: ExpenseCategory | null;
  isDetecting: boolean;
  onClear: () => void;
  onSelect: (cat: ExpenseCategory) => void;
}) {
  const [showPicker, setShowPicker] = useState(false);

  if (isDetecting) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-36 rounded-full bg-muted/60 animate-pulse" />
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Sparkles className="size-3 animate-pulse text-primary" />
          Detecting category…
        </p>
      </div>
    );
  }

  if (!category) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center flex-wrap gap-2">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${category.color} ${category.textColor} border-current/20 cursor-pointer transition-all hover:opacity-80`}
          onClick={() => setShowPicker((v) => !v)}>
          <span>{category.icon}</span>
          {category.name}
          <Tag className="size-3 opacity-60" />
        </span>
        <button
          type="button"
          onClick={onClear}
          className="size-5 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
          <X className="size-3" />
        </button>
        <span className="text-xs text-muted-foreground">
          Auto-detected · click to change
        </span>
      </div>

      {showPicker && (
        <div className="flex flex-wrap gap-1.5 p-3 rounded-2xl border border-border/60 bg-muted/30">
          {EXPENSE_CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              type="button"
              onClick={() => {
                onSelect(cat);
                setShowPicker(false);
              }}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all hover:opacity-80 ${
                cat.name === category.name
                  ? `${cat.color} ${cat.textColor} border-current/30 ring-1 ring-current/30`
                  : "bg-background border-border/60 text-muted-foreground hover:border-primary/30"
              }`}>
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function AddExpenseFormContent({
  initialGroups,
  currentUserId,
}: {
  initialGroups: any[];
  currentUserId: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultGroupId = searchParams.get("groupId") || "";

  const [isLoading, setIsLoading] = useState(false);
  const [paidBy, setPaidBy] = useState<PaidBy[]>([]);
  const [splits, setSplits] = useState<SplitEntry[]>([]);

  // Smart category state
  const [detectedCategory, setDetectedCategory] = useState<ExpenseCategory | null>(null);
  const [isDetectingCategory, setIsDetectingCategory] = useState(false);
  const [categoryOverridden, setCategoryOverridden] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const form = useForm({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      groupId: defaultGroupId,
      title: "",
      amount: "" as any,
      splitMethod: SplitMethod.EQUAL,
    },
  });

  const selectedGroupId = form.watch("groupId");
  const titleValue = form.watch("title");
  const amount = Number(form.watch("amount")) || 0;
  const splitMethod = form.watch("splitMethod");

  const currentGroup = useMemo(
    () => initialGroups.find((g) => g.id === selectedGroupId) || null,
    [selectedGroupId, initialGroups]
  );

  const members: any[] = currentGroup?.members || [];

  // Init paidBy and splits when group changes
  useEffect(() => {
    if (!members.length) return;
    const currentMember = members.find((m) => m.userId === currentUserId);
    setPaidBy(currentMember ? [{ memberId: currentMember.id, amount: 0 }] : []);
    setSplits(
      members.map((m) => ({ memberId: m.id, value: 0, included: true }))
    );
  }, [selectedGroupId, currentUserId]);

  // Auto-fill payer amounts
  useEffect(() => {
    if (paidBy.length === 1) {
      setPaidBy([{ ...paidBy[0], amount }]);
    }
  }, [amount]);

  // Debounced category detection as user types
  useEffect(() => {
    if (categoryOverridden) return;
    if (!titleValue || titleValue.length < 2) {
      setDetectedCategory(null);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      setIsDetectingCategory(true);
      // Use local rule-based detection (instant)
      const detected = detectCategoryFromTitle(titleValue);
      setDetectedCategory(detected);
      setIsDetectingCategory(false);
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [titleValue, categoryOverridden]);

  // Equal split auto-compute
  const computedSplits = useMemo(() => {
    const included = splits.filter((s) => s.included);
    if (!included.length) return splits;

    return splits.map((s) => {
      if (!s.included) return { ...s, computed: 0 };
      let computed = 0;
      switch (splitMethod) {
        case SplitMethod.EQUAL:
          computed = amount / included.length;
          break;
        case SplitMethod.EXACT:
          computed = s.value;
          break;
        case SplitMethod.PERCENTAGE:
          computed = (amount * s.value) / 100;
          break;
        case SplitMethod.SHARES: {
          const totalShares =
            included.reduce((acc, x) => acc + (x.value || 0), 0) || 1;
          computed = (amount * s.value) / totalShares;
          break;
        }
      }
      return { ...s, computed };
    });
  }, [splits, amount, splitMethod]);

  const getMember = (memberId: string) =>
    members.find((m) => m.id === memberId);

  const totalPaid = paidBy.reduce((s, p) => s + (p.amount || 0), 0);
  const includedSplitTotal = computedSplits
    .filter((s) => s.included)
    .reduce((acc, s: any) => acc + (s.computed || 0), 0);

  const payerBalanceOk = amount <= 0 || Math.abs(totalPaid - amount) < 0.05;
  const splitBalanceOk =
    amount <= 0 || Math.abs(includedSplitTotal - amount) < 0.05;

  const addPayer = () => {
    const existingIds = paidBy.map((p) => p.memberId);
    const next = members.find((m) => !existingIds.includes(m.id));
    if (next) setPaidBy([...paidBy, { memberId: next.id, amount: 0 }]);
  };

  const removePayer = (idx: number) => {
    setPaidBy(paidBy.filter((_, i) => i !== idx));
  };

  const updatePayer = (idx: number, field: "memberId" | "amount", val: any) => {
    setPaidBy(paidBy.map((p, i) => (i === idx ? { ...p, [field]: val } : p)));
  };

  const updateSplit = (
    memberId: string,
    field: "value" | "included",
    val: any
  ) => {
    setSplits(
      splits.map((s) => (s.memberId === memberId ? { ...s, [field]: val } : s))
    );
  };

  const onSubmit = async (values: any) => {
    if (!payerBalanceOk) {
      toast.error(
        `Payer total (₹${totalPaid.toFixed(2)}) must equal expense amount (₹${amount.toFixed(2)})`
      );
      return;
    }
    if (!splitBalanceOk) {
      toast.error(`Split total must equal expense amount (₹${amount.toFixed(2)})`);
      return;
    }
    if (paidBy.length === 0) {
      toast.error("At least one payer is required");
      return;
    }

    const includedSplits = computedSplits.filter((s) => s.included);
    if (!includedSplits.length) {
      toast.error("At least one participant must be included in the split");
      return;
    }

    setIsLoading(true);
    try {
      const payersToSend =
        paidBy.length === 1 && amount > 0
          ? [{ memberId: paidBy[0].memberId, amount }]
          : paidBy;

      const res = (await createExpense({
        groupId: values.groupId,
        title: values.title,
        amount: values.amount,
        splitMethod: values.splitMethod,
        expenseDate: new Date(),
        paidByMemberId: payersToSend[0].memberId,
        detectedCategoryName: detectedCategory?.name,
        splits: includedSplits.map((s: any) => ({
          memberId: s.memberId,
          amount: s.computed,
        })),
        extraPayers: payersToSend.slice(1).map((p) => ({
          memberId: p.memberId,
          amount: p.amount,
        })) as { memberId: string; amount: number }[],
      })) as any;

      if (res.success) {
        toast.success("Expense added!");
        router.push(`/groups/${values.groupId}`);
      } else {
        toast.error(res.error || "Failed to create expense");
      }
    } catch (e: any) {
      toast.error(e.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const splitMethodLabels: Partial<Record<SplitMethod, string>> = {
    EQUAL: "Split Equally",
    EXACT: "Exact Amounts",
    PERCENTAGE: "By Percentage",
    SHARES: "By Shares",
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-10">
        {/* LEFT: Expense Details */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-foreground mb-5 flex items-center gap-2">
              <Receipt className="size-5 text-primary" /> Details
            </h2>
            <div className="space-y-5">
              {/* Group */}
              <FormField
                control={form.control}
                name="groupId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 rounded-xl w-full">
                          <SelectValue placeholder="Select a group…" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {initialGroups.map((g) => (
                          <SelectItem key={g.id} value={g.id}>
                            {g.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Title + Smart Category */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What was it for?</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Dinner, Uber, Groceries"
                        className="h-12 rounded-xl"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                    {/* Smart Category Chip */}
                    <div className="mt-2">
                      <SmartCategoryChip
                        category={detectedCategory}
                        isDetecting={isDetectingCategory}
                        onClear={() => {
                          setDetectedCategory(null);
                          setCategoryOverridden(true);
                        }}
                        onSelect={(cat) => {
                          setDetectedCategory(cat);
                          setCategoryOverridden(true);
                        }}
                      />
                    </div>
                  </FormItem>
                )}
              />

              {/* Amount */}
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Amount (₹)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                          ₹
                        </span>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="h-14 text-2xl font-mono pl-8 rounded-xl"
                          {...field}
                          value={field.value as number | string | undefined}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Split Method */}
              <FormField
                control={form.control}
                name="splitMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How to split?</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(splitMethodLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Paid By */}
          {selectedGroupId && members.length > 0 && (
            <div className="space-y-4">
              <Separator />
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <CreditCard className="size-5 text-primary" /> Who Paid?
              </h2>
              <p className="text-sm text-muted-foreground -mt-2">
                Select who paid. Multiple people can split the bill paid section.
              </p>

              <div className="space-y-3">
                {paidBy.map((payer, idx) => {
                  const m = getMember(payer.memberId);
                  const usedIds = paidBy
                    .map((p, i) => i !== idx && p.memberId)
                    .filter(Boolean);
                  return (
                    <Card key={idx} className="rounded-xl shadow-sm">
                      <CardContent className="flex items-center gap-3 p-4">
                        <Avatar className="size-9 border">
                          <AvatarImage src={m?.user?.image || ""} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs uppercase">
                            {(m?.user?.name || "?")[0]}
                          </AvatarFallback>
                        </Avatar>

                        <Select
                          value={payer.memberId}
                          onValueChange={(val) =>
                            updatePayer(idx, "memberId", val)
                          }>
                          <SelectTrigger className="flex-1 h-9 rounded-lg text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {members
                              .filter((m) => !usedIds.includes(m.id))
                              .map((m) => (
                                <SelectItem key={m.id} value={m.id}>
                                  <div className="flex items-center gap-2">
                                    <span>{m.user?.name || "Unknown"}</span>
                                    {m.userId === currentUserId && (
                                      <Badge variant="secondary" className="text-xs">
                                        You
                                      </Badge>
                                    )}
                                  </div>
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>

                        {paidBy.length > 1 && (
                          <div className="relative w-28">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                              ₹
                            </span>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={payer.amount || ""}
                              onChange={(e) =>
                                updatePayer(
                                  idx,
                                  "amount",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="h-9 rounded-lg text-sm pl-5 w-full font-mono"
                            />
                          </div>
                        )}

                        {paidBy.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-9 text-destructive hover:bg-destructive/10"
                            onClick={() => removePayer(idx)}>
                            <Trash2 className="size-4" />
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}

                {paidBy.length > 1 && (
                  <div
                    className={`flex items-center justify-between px-1 text-sm ${payerBalanceOk ? "text-emerald-600" : "text-destructive"}`}>
                    <span>Payers total</span>
                    <span className="font-mono font-bold">
                      ₹{totalPaid.toFixed(2)} / ₹{amount.toFixed(2)}
                    </span>
                  </div>
                )}

                {paidBy.length < members.length && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full rounded-xl border-dashed h-10"
                    onClick={addPayer}>
                    <Plus className="size-4 mr-2" /> Add Another Payer
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Split Breakdown */}
        <div className="lg:col-span-3">
          <Card className="rounded-2xl shadow-lg border h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SplitSquareHorizontal className="size-5 text-primary" /> Split
                Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
              {!selectedGroupId ? (
                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground py-12">
                  <SplitSquareHorizontal className="size-14 opacity-20 mb-4" />
                  <p className="text-base">Select a group to see members</p>
                </div>
              ) : members.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No members in group.
                </p>
              ) : (
                <>
                  <div className="flex-1 space-y-2 overflow-y-auto">
                    {computedSplits.map((s: any) => {
                      const m = getMember(s.memberId);
                      return (
                        <div
                          key={s.memberId}
                          className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${s.included ? "bg-card" : "bg-muted/20 opacity-60"}`}>
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={s.included}
                              onCheckedChange={(v) =>
                                updateSplit(s.memberId, "included", !!v)
                              }
                            />
                            <Avatar className="size-8 border">
                              <AvatarImage src={m?.user?.image || ""} />
                              <AvatarFallback className="text-xs bg-primary/10 text-primary uppercase">
                                {(m?.user?.name || "?")[0]}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-sm text-foreground">
                              {m?.user?.name || "Unknown"}
                              {m?.userId === currentUserId && (
                                <span className="text-muted-foreground text-xs ml-1.5">
                                  (you)
                                </span>
                              )}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            {splitMethod !== SplitMethod.EQUAL &&
                              s.included && (
                                <div className="relative w-20">
                                  <Input
                                    type="number"
                                    step="any"
                                    placeholder="0"
                                    value={s.value || ""}
                                    onChange={(e) =>
                                      updateSplit(
                                        s.memberId,
                                        "value",
                                        parseFloat(e.target.value) || 0
                                      )
                                    }
                                    className="h-8 text-sm text-right rounded-lg pr-2 w-full"
                                  />
                                </div>
                              )}
                            <span className="font-mono font-bold text-sm text-primary min-w-[70px] text-right">
                              {s.included
                                ? `₹${(s.computed || 0).toFixed(2)}`
                                : "—"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Split total</p>
                      <p
                        className={`font-mono font-bold text-lg ${splitBalanceOk ? "text-foreground" : "text-destructive"}`}>
                        ₹{includedSplitTotal.toFixed(2)}
                        {!splitBalanceOk && (
                          <span className="text-xs font-normal ml-2 text-destructive">
                            (must be ₹{amount.toFixed(2)})
                          </span>
                        )}
                      </p>
                    </div>
                    <Button
                      type="submit"
                      disabled={isLoading || !selectedGroupId}
                      size="lg"
                      className="rounded-full h-12 px-8 shadow-lg">
                      {isLoading ? (
                        <Loader2 className="size-5 animate-spin mr-2" />
                      ) : null}
                      Add Expense
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </form>
    </Form>
  );
}

export default function AddExpenseForm({
  initialGroups,
  currentUserId,
}: {
  initialGroups: any[];
  currentUserId: string;
}) {
  return (
    <Suspense>
      <AddExpenseFormContent
        initialGroups={initialGroups}
        currentUserId={currentUserId}
      />
    </Suspense>
  );
}
