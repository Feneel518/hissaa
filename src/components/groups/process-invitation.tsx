"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { acceptInvitation } from "@/lib/actions/group.actions";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProcessInvitation({
  token,
  groupName,
  inviterName,
  errorMsg
}: {
  token: string;
  groupName?: string;
  inviterName?: string;
  errorMsg?: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  if (errorMsg) {
    return (
      <div className="text-center">
        <div className="size-20 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-6">
          <XCircle className="size-10" />
        </div>
        <h1 className="text-3xl font-serif text-foreground mb-4">Oops!</h1>
        <p className="text-muted-foreground mb-8 text-lg">{errorMsg}</p>
        <Link href="/len-den">
          <Button size="lg" className="rounded-full shadow-lg h-14 px-8 text-lg">
            Return to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  const handleAccept = async () => {
    setIsLoading(true);
    try {
      const res = await acceptInvitation(token);
      if (res.success) {
        toast.success("Successfully joined the group!");
        router.push(`/groups/${res.groupId}`);
      } else {
        toast.error(res.error || "Failed to join");
        router.refresh(); // Refresh to show error state if expired
      }
    } catch (e) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="text-center">
      <div className="size-24 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-6">
        <div className="size-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold font-serif">
          H.
        </div>
      </div>
      <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-4">You're Invited!</h1>
      <p className="text-muted-foreground mb-10 text-lg leading-relaxed max-w-sm mx-auto">
        <strong>{inviterName}</strong> wants you to join <br/>
        <strong className="text-xl text-foreground">"{groupName}"</strong> <br/>
        on hissa.
      </p>
      
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Button 
          size="lg" 
          onClick={handleAccept} 
          disabled={isLoading}
          className="rounded-full shadow-xl h-14 px-10 text-lg w-full sm:w-auto min-w-[200px]"
        >
          {isLoading ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : "Accept & Join"}
        </Button>
        <Link href="/len-den" className="w-full sm:w-auto">
          <Button variant="outline" size="lg" className="rounded-full h-14 px-8 text-lg w-full">
            Decline
          </Button>
        </Link>
      </div>
    </div>
  );
}
