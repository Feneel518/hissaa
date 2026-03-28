import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRightLeft, Sparkles } from "lucide-react";
import SettleUpDialog from "./SettleUpDialog";

type DebtUser = {
  id: string;
  name: string | null;
  image: string | null;
};

type SettlementItem = {
  from: DebtUser;
  to: DebtUser;
  amount: number;
};

// Map from userId → { groupMemberId }
type MemberMap = Record<string, { groupMemberId: string }>;

interface SettlementsCardProps {
  debts: SettlementItem[];
  isSubscribed: boolean;
  currentUserId: string;
  groupId: string;
  groupName: string;
  memberMap?: MemberMap; // userId → groupMemberId mapping
}

export default function SettlementsCard({
  debts,
  isSubscribed,
  currentUserId,
  groupId,
  groupName,
  memberMap = {},
}: SettlementsCardProps) {
  return (
    <Card className="rounded-4xl border border-border/60 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <ArrowRightLeft className="size-5 text-primary" />
            {isSubscribed ? "Optimized Settlements" : "Settlements"}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {isSubscribed
              ? "Smart settle-up suggestions with minimum transfers."
              : "Regular settlement flow based on current balances."}
          </p>
        </div>

        <Badge
          variant={isSubscribed ? "default" : "secondary"}
          className="rounded-full px-3 py-1">
          {isSubscribed ? (
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="size-3.5" />
              Pro
            </span>
          ) : (
            "Free"
          )}
        </Badge>
      </CardHeader>

      <CardContent>
        {debts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border/60 p-8 text-center">
            <p className="font-medium">All settled up</p>
            <p className="mt-1 text-sm text-muted-foreground">
              No pending settlements right now.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {debts.map((debt, index) => {
              const fromYou = debt.from?.id === currentUserId;
              const toYou = debt.to?.id === currentUserId;

              const fromLabel = fromYou ? "You" : debt.from?.name || "Unknown";
              const toLabel = toYou ? "You" : debt.to?.name || "Unknown";

              const fromMemberId = memberMap[debt.from?.id]?.groupMemberId || "";
              const toMemberId = memberMap[debt.to?.id]?.groupMemberId || "";

              return (
                <div
                  key={`${debt.from?.id}-${debt.to?.id}-${index}`}
                  className="flex flex-col gap-4 rounded-[1.5rem] border border-border/60 bg-background/70 p-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-10 border">
                      <AvatarImage src={debt.from?.image || ""} />
                      <AvatarFallback className="bg-primary/10 text-primary uppercase">
                        {(debt.from?.name || "U")[0]}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex items-center gap-2 text-sm md:text-base">
                      <span className="font-medium">{fromLabel}</span>
                      <span className="text-muted-foreground">pays</span>
                      <span className="font-medium">{toLabel}</span>
                    </div>

                    <Avatar className="size-10 border">
                      <AvatarImage src={debt.to?.image || ""} />
                      <AvatarFallback className="bg-primary/10 text-primary uppercase">
                        {(debt.to?.name || "U")[0]}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4">
                    <div className="text-left md:text-right">
                      <p className="font-mono text-lg font-semibold">
                        ₹{debt.amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isSubscribed ? "optimized payment" : "regular payment"}
                      </p>
                    </div>

                    {/* Settle button — visible to all members */}
                    {fromMemberId && toMemberId && (
                      <SettleUpDialog
                        fromMemberId={fromMemberId}
                        toMemberId={toMemberId}
                        fromUser={debt.from}
                        toUser={debt.to}
                        amount={debt.amount}
                        groupId={groupId}
                        groupName={groupName}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
