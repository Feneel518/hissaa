import { requireUser } from "@/lib/checks/auth/RequireUser";
import CreateGroupForm from "@/components/groups/create-group-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function NewGroupPage() {
  const user = await requireUser();

  return (
    <div className="space-y-8 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Link href="/groups">
          <Button variant="outline" size="icon" className="rounded-full shadow-sm size-12 border-primary/20 hover:bg-primary/5 hidden md:flex">
            <ArrowLeft className="size-5 text-primary" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl md:text-5xl font-serif tracking-tight text-foreground">
            Create a Group
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">
            Start tracking expenses with friends, family, or strangers.
          </p>
        </div>
      </div>

      <div className="rounded-[2.5rem] bg-card border shadow-xl p-8 md:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 h-40 w-40 bg-primary/5 rounded-bl-full pointer-events-none" />
        <CreateGroupForm />
      </div>
    </div>
  );
}
