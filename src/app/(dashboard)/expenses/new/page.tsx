import { requireUser } from "@/lib/checks/auth/RequireUser";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import AddExpenseForm from "@/components/expenses/add-expense-form";
import { getUserGroups } from "@/lib/actions/group.actions";

export default async function NewExpensePage() {
  const user = await requireUser();
  const res = await getUserGroups();
  const groups = res.success && res.groups ? res.groups : [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Link href="/len-den">
          <Button
            variant="outline"
            size="icon"
            className="hidden size-12 rounded-full border-primary/20 shadow-sm hover:bg-primary/5 md:flex">
            <ArrowLeft className="size-5 text-primary" />
          </Button>
        </Link>

        <div>
          <h1 className="text-3xl font-serif tracking-tight text-foreground md:text-5xl">
            Add an Expense
          </h1>
          <p className="mt-2 font-medium text-muted-foreground">
            Add the details, choose who paid, and settle the split on the right.
          </p>
        </div>
      </div>

      <section className="overflow-hidden rounded-[2.25rem] border bg-card shadow-xl">
        <div className="p-5 sm:p-7 lg:p-8">
          <AddExpenseForm initialGroups={groups} currentUserId={user.id} />
        </div>
      </section>
    </div>
  );
}
