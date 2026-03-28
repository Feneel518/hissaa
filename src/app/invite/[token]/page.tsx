import { requireUser } from "@/lib/checks/auth/RequireUser";
import { prisma } from "@/lib/prisma/db";
import ProcessInvitation from "@/components/groups/process-invitation";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  // Pass the invite URL as the callbackUrl so after login, user returns here to accept
  await requireUser(`/invite/${token}`);

  const invite = await prisma.groupInvitation.findUnique({
    where: { token },
    include: {
      group: true,
      invitedBy: true,
    }
  });

  let errorMsg;
  if (!invite) {
    errorMsg = "This invitation link is invalid or doesn't exist.";
  } else if (invite.status !== "PENDING") {
    errorMsg = `This invitation has already been ${invite.status.toLowerCase()}.`;
  } else if (new Date() > invite.expiresAt) {
    errorMsg = "This invitation link has expired.";
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-card border shadow-2xl rounded-[3rem] p-10 md:p-14 relative overflow-hidden animate-in fade-in zoom-in-95 duration-700">
        <div className="absolute -top-32 -right-32 size-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 size-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          <ProcessInvitation 
            token={token} 
            errorMsg={errorMsg}
            groupName={invite?.group.name}
            inviterName={invite?.invitedBy.name || "A friend"}
          />
        </div>
      </div>
    </div>
  );
}
