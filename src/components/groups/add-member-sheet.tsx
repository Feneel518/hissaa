// "use client";

// import { useState } from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
// import { toast } from "sonner";
// import { Loader2, Mail, Plus, Sparkles, UserPlus } from "lucide-react";

// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Sheet,
//   SheetContent,
//   SheetDescription,
//   SheetHeader,
//   SheetTitle,
//   SheetTrigger,
// } from "@/components/ui/sheet";
// import { addMemberByEmail } from "@/lib/actions/group.actions";

// const addMemberSchema = z.object({
//   email: z.string().email("Please enter a valid email address"),
// });

// type AddMemberFormValues = z.infer<typeof addMemberSchema>;

// export default function AddMemberSheet({ groupId }: { groupId: string }) {
//   const [isOpen, setIsOpen] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   const {
//     register,
//     handleSubmit,
//     reset,
//     formState: { errors },
//   } = useForm<AddMemberFormValues>({
//     resolver: zodResolver(addMemberSchema),
//     defaultValues: { email: "" },
//   });

//   const onSubmit = async (values: AddMemberFormValues) => {
//     setIsLoading(true);

//     try {
//       const res = await addMemberByEmail(groupId, values.email);

//       if (res.success) {
//         toast.success(res.message || "Invitation sent successfully");
//         reset();
//         setIsOpen(false);
//       } else {
//         toast.error(res.error || "Failed to send invitation");
//       }
//     } catch {
//       toast.error("Something went wrong");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <Sheet open={isOpen} onOpenChange={setIsOpen}>
//       <SheetTrigger asChild>
//         <Button
//           variant="outline"
//           className="mt-6 h-12 w-full rounded-2xl border-dashed border-primary/25 bg-background/70 text-foreground shadow-sm transition-all duration-300 hover:border-primary/40 hover:bg-primary/5 hover:shadow-md">
//           <Plus className="mr-2 size-4" />
//           Add Member
//         </Button>
//       </SheetTrigger>

//       <SheetContent
//         side="right"
//         className="w-full border-l border-border/60 bg-background p-0 sm:max-w-md">
//         <div className="flex h-full flex-col">
//           {/* top band */}
//           <div className="relative overflow-hidden border-b border-border/60 px-6 py-6">
//             <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
//             <div className="relative z-10">
//               <div className="mb-4 flex items-center gap-3">
//                 <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
//                   <UserPlus className="size-5" />
//                 </div>
//                 <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
//                   <Sparkles className="size-3.5 text-primary" />
//                   Invite flow
//                 </div>
//               </div>

//               <SheetHeader className="space-y-2 text-left">
//                 <SheetTitle className="text-2xl font-semibold tracking-tight">
//                   Add a new member
//                 </SheetTitle>
//                 <SheetDescription className="max-w-sm text-sm leading-6 text-muted-foreground">
//                   Invite someone by email so they can join this group and start
//                   splitting expenses with you.
//                 </SheetDescription>
//               </SheetHeader>
//             </div>
//           </div>

//           {/* content */}
//           <div className="flex flex-1 flex-col px-6 py-6">
//             <form
//               onSubmit={handleSubmit(onSubmit)}
//               className="flex h-full flex-col">
//               <div className="space-y-5">
//                 <div className="rounded-[1.5rem] border border-border/60 bg-card/60 p-4 shadow-sm">
//                   <div className="mb-3">
//                     <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
//                       Email address
//                     </label>
//                   </div>

//                   <div className="relative">
//                     <Mail className="pointer-events-none absolute left-4 top-1/2 size-4.5 -translate-y-1/2 text-muted-foreground" />
//                     <Input
//                       {...register("email")}
//                       placeholder="friend@example.com"
//                       className="h-13 rounded-2xl border-border/60 bg-background pl-11 pr-4 text-base shadow-none focus-visible:ring-1 focus-visible:ring-primary"
//                     />
//                   </div>

//                   {errors.email && (
//                     <p className="mt-3 text-sm text-destructive">
//                       {errors.email.message}
//                     </p>
//                   )}
//                 </div>

//                 <div className="rounded-[1.5rem] border border-border/60 bg-muted/30 p-4">
//                   <p className="text-sm font-medium text-foreground">
//                     What happens next
//                   </p>
//                   <div className="mt-3 space-y-2 text-sm text-muted-foreground">
//                     <div className="flex items-start gap-2">
//                       <span className="mt-1 size-1.5 rounded-full bg-primary" />
//                       <p>The invite will be linked to this group.</p>
//                     </div>
//                     <div className="flex items-start gap-2">
//                       <span className="mt-1 size-1.5 rounded-full bg-primary" />
//                       <p>
//                         The invited member can join and start participating in
//                         expenses.
//                       </p>
//                     </div>
//                     <div className="flex items-start gap-2">
//                       <span className="mt-1 size-1.5 rounded-full bg-primary" />
//                       <p>You can manage members later from the group page.</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="mt-auto border-t border-border/60 pt-5">
//                 <div className="flex items-center gap-3">
//                   <Button
//                     type="button"
//                     variant="outline"
//                     className="h-12 flex-1 rounded-2xl"
//                     onClick={() => setIsOpen(false)}
//                     disabled={isLoading}>
//                     Cancel
//                   </Button>

//                   <Button
//                     type="submit"
//                     disabled={isLoading}
//                     className="h-12 flex-1 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md">
//                     {isLoading ? (
//                       <>
//                         <Loader2 className="mr-2 size-4 animate-spin" />
//                         Sending...
//                       </>
//                     ) : (
//                       <>
//                         <UserPlus className="mr-2 size-4" />
//                         Send Invite
//                       </>
//                     )}
//                   </Button>
//                 </div>
//               </div>
//             </form>
//           </div>
//         </div>
//       </SheetContent>
//     </Sheet>
//   );
// }




"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  CheckCircle2,
  Loader2,
  Mail,
  Plus,
  UserPlus2,
  Users,
  X,
} from "lucide-react";

import { addMemberByEmail } from "@/lib/actions/group.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

const addMemberSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
});

type AddMemberFormValues = z.infer<typeof addMemberSchema>;

export default function AddMemberSheet({ groupId }: { groupId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [justInvitedEmail, setJustInvitedEmail] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid },
  } = useForm<AddMemberFormValues>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: { email: "" },
    mode: "onChange",
  });

  const emailValue = watch("email");

  const emailHint = useMemo(() => {
    if (!emailValue)
      return "Enter the email address of the person you want to invite.";
    return "They’ll be added to this group through an invitation flow.";
  }, [emailValue]);

  const onSubmit = async (values: AddMemberFormValues) => {
    setIsLoading(true);
    setJustInvitedEmail(null);

    try {
      const res = await addMemberByEmail(groupId, values.email);

      if (res.success) {
        toast.success(res.message || "Invitation sent successfully");
        setJustInvitedEmail(values.email);
        reset({ email: "" });
      } else {
        toast.error(res.error || "Failed to send invitation");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      reset({ email: "" });
      setJustInvitedEmail(null);
    }, 150);
  };

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => (open ? setIsOpen(true) : handleClose())}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="mt-6 h-12 w-full rounded-2xl border-dashed border-primary/25 bg-background/70 text-foreground shadow-sm transition-all duration-300 hover:border-primary/45 hover:bg-primary/5 hover:shadow-md">
          <Plus className="mr-2 size-4" />
          Add Member
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-full border-l border-border/60 bg-background p-0 sm:max-w-md">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="relative overflow-hidden border-b border-border/60 px-6 py-6">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
            <div className="absolute right-0 top-0 h-32 w-32 translate-x-10 -translate-y-10 rounded-full bg-primary/10 blur-3xl" />

            <div className="relative z-10">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex size-12 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary shadow-sm">
                  <UserPlus2 className="size-5" />
                </div>

                <button
                  type="button"
                  onClick={handleClose}
                  className="inline-flex size-9 items-center justify-center rounded-full border border-border/60 bg-background/80 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="Close">
                  <X className="size-4" />
                </button>
              </div>

              <SheetHeader className="space-y-2 text-left">
                <SheetTitle className="text-2xl font-semibold tracking-tight">
                  Invite a member
                </SheetTitle>
                <SheetDescription className="max-w-sm text-sm leading-6 text-muted-foreground">
                  Add someone to this group by email so they can join and start
                  splitting expenses with you.
                </SheetDescription>
              </SheetHeader>
            </div>
          </div>

          {/* Body */}
          <div className="flex flex-1 flex-col px-6 py-6">
            {justInvitedEmail ? (
              <div className="mb-5 rounded-[1.5rem] border border-emerald-200/70 bg-emerald-50/70 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-9 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                    <CheckCircle2 className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Invitation sent
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {justInvitedEmail}
                      </span>{" "}
                      has been invited to this group.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex h-full flex-col">
              <div className="space-y-5">
                <div className="rounded-[1.5rem] border border-border/60 bg-card/70 p-4 shadow-sm">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Mail className="size-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Email address
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {emailHint}
                      </p>
                    </div>
                  </div>

                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      {...register("email")}
                      placeholder="friend@example.com"
                      autoComplete="email"
                      className="h-12 rounded-2xl border-border/60 bg-background pl-11 pr-4 text-base shadow-none focus-visible:ring-1 focus-visible:ring-primary"
                    />
                  </div>

                  {errors.email ? (
                    <p className="mt-3 text-sm text-destructive">
                      {errors.email.message}
                    </p>
                  ) : null}
                </div>

                <div className="rounded-[1.5rem] border border-border/60 bg-muted/30 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Users className="size-4" />
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      How it works
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="mt-1.5 size-1.5 rounded-full bg-primary" />
                      <p className="text-sm text-muted-foreground">
                        The invitation will be linked to this group.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="mt-1.5 size-1.5 rounded-full bg-primary" />
                      <p className="text-sm text-muted-foreground">
                        Once accepted, the member can participate in expenses
                        and settlements.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="mt-1.5 size-1.5 rounded-full bg-primary" />
                      <p className="text-sm text-muted-foreground">
                        You can manage members anytime from the group page.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-6">
                <Separator className="mb-5" />

                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 flex-1 rounded-2xl"
                    onClick={handleClose}
                    disabled={isLoading}>
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    className="h-12 flex-1 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md"
                    disabled={isLoading || !isValid}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <UserPlus2 className="mr-2 size-4" />
                        Send Invite
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
