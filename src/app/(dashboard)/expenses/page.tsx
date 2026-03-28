import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getUserExpenses } from "@/lib/actions/expense.actions";
import { getUserGroups } from "@/lib/actions/group.actions";
import { requireUser } from "@/lib/checks/auth/RequireUser";
import { Plus, Receipt, TrendingUp } from "lucide-react";
import Link from "next/link";

export default async function ExpensesPage() {
  await requireUser();
  const [expensesRes, groupsRes] = await Promise.all([
    getUserExpenses(),
    getUserGroups(),
  ]);

  const expenses = expensesRes.success ? (expensesRes.expenses ?? []) : [];
  const groups = groupsRes.success ? (groupsRes.groups ?? []) : [];

  const totalSpend = expenses.reduce(
    (sum, e) => sum + Number(e.totalAmount),
    0,
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif tracking-tight text-foreground">
            Expenses
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">
            All your expenses across groups
          </p>
        </div>
        <Link href="/expenses/new">
          <Button size="lg" className="rounded-full shadow-lg h-12 px-6">
            <Plus className="mr-2" size={18} /> Add Expense
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-2xl border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-mono font-bold text-foreground">
              {expenses.length}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-mono font-bold text-foreground">
              ₹
              {totalSpend.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Groups Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-mono font-bold text-foreground">
              {groups.length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Expenses Table */}
      <Card className="rounded-2xl border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="size-5 text-primary" />
            All Expenses
          </CardTitle>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Receipt className="size-16 text-muted-foreground/20 mb-4" />
              <p className="text-lg font-medium text-muted-foreground">
                No expenses yet
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Start tracking by adding your first expense
              </p>
              <Link href="/expenses/new">
                <Button className="rounded-full">
                  <Plus className="mr-2 size-4" /> Add First Expense
                </Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Group</TableHead>
                  <TableHead>Paid By</TableHead>
                  <TableHead>Split</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => {
                  const payer = expense.payers[0]?.groupMember?.user;
                  return (
                    <TableRow key={expense.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">
                        {expense.title}
                      </TableCell>
                      <TableCell>
                        <Link href={`/groups/${expense.group.id}`}>
                          <Badge
                            variant="secondary"
                            className="rounded-full cursor-pointer hover:bg-primary/10">
                            {expense.group.name}
                          </Badge>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="size-7 border">
                            <AvatarImage src={payer?.image || ""} />
                            <AvatarFallback className="text-xs bg-primary/10 text-primary uppercase">
                              {(payer?.name || "U")[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">
                            {payer?.name || "Unknown"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="rounded-full text-xs capitalize">
                          {expense.splitMethod.toLowerCase().replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold">
                        ₹
                        {Number(expense.totalAmount).toLocaleString("en-IN", {
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground text-sm">
                        {new Date(expense.expenseDate).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
