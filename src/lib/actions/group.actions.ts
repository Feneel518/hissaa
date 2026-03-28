"use server";

import { prisma } from "@/lib/prisma/db";
import { requireUser } from "@/lib/checks/auth/RequireUser";
import { GroupType, GroupMemberRole, GroupMemberStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function createGroup(data: {
  name: string;
  description?: string;
  type?: GroupType;
  baseCurrency?: string;
}) {
  const user = await requireUser();

  try {
    const group = await prisma.group.create({
      data: {
        name: data.name,
        description: data.description,
        type: data.type || GroupType.OTHER,
        baseCurrency: data.baseCurrency || "INR",
        ownerId: user.id,
        isPersonal: false,
        members: {
          create: {
            userId: user.id,
            role: GroupMemberRole.OWNER,
            status: GroupMemberStatus.ACTIVE,
          },
        },
      },
    });

    revalidatePath("/groups");
    revalidatePath("/len-den");

    return { success: true, group };
  } catch (error) {
    console.error("Error creating group:", error);
    return { success: false, error: "Failed to create group" };
  }
}

export async function getUserGroups() {
  const user = await requireUser();

  try {
    const groups = await prisma.group.findMany({
      where: {
        members: {
          some: {
            userId: user.id,
            status: GroupMemberStatus.ACTIVE,
          },
        },
      },
      include: {
        _count: {
          select: { members: true, expenses: true },
        },
        members: {
          include: {
            user: { select: { id: true, name: true, image: true } },
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return { success: true, groups };
  } catch (error) {
    console.error("Error fetching user groups:", error);
    return { success: false, error: "Failed to fetch groups" };
  }
}

export async function getGroupDetails(groupId: string) {
  const user = await requireUser();

  try {
    const group = await prisma.group.findUnique({
      where: {
        id: groupId,
        members: {
          some: {
            userId: user.id,
            status: GroupMemberStatus.ACTIVE,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, image: true, email: true },
            },
          },
        },
        expenses: {
          orderBy: { expenseDate: "desc" },
          take: 20,
          include: {
            payers: {
              select: {
                amountPaid: true,
                groupMember: {
                  select: {
                    user: {
                      select: { id: true, name: true, image: true },
                    },
                  },
                },
              },
            },

            createdBy: { select: { id: true, name: true, image: true } },
          },
        },
      },
    });

    if (!group)
      return { success: false, error: "Group not found or unauthorized" };

    return { success: true, group };
  } catch (error) {
    console.error("Error fetching group details:", error);
    return { success: false, error: "Failed to fetch group details" };
  }
}

export async function addMemberByEmail(groupId: string, email: string) {
  const currentUser = await requireUser();

  try {
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: { members: true },
    });

    if (!group) return { success: false, error: "Group not found" };

    const isMember = group.members.some(
      (m) => m.userId === currentUser.id && m.status === "ACTIVE",
    );
    if (!isMember) return { success: false, error: "Unauthorized" };

    // Find if user already exists
    const targetUser = await prisma.user.findUnique({ where: { email } });

    if (targetUser) {
      const alreadyInGroup = group.members.some(
        (m) => m.userId === targetUser.id && m.status === "ACTIVE",
      );
      if (alreadyInGroup)
        return { success: false, error: "User is already a member" };
    }

    // Check for existing pending invitation
    const existingInvite = await prisma.groupInvitation.findFirst({
      where: {
        groupId,
        email,
        status: "PENDING",
        expiresAt: { gt: new Date() },
      },
    });

    let token = "";

    if (existingInvite) {
      token = existingInvite.token;
    } else {
      token = crypto.randomUUID();
      // Expires in 7 days
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await prisma.groupInvitation.create({
        data: {
          groupId,
          email,
          invitedById: currentUser.id,
          token,
          expiresAt,
          status: "PENDING",
        },
      });
    }

    // Dynamic import to avoid circular setup issues if imported globally
    const { sendGroupInviteEmail } = await import("@/lib/email/invite");
    const sent = await sendGroupInviteEmail(
      email,
      currentUser.name || "A friend",
      group.name,
      token,
    );

    if (!sent) {
      return {
        success: false,
        error: "Failed to dispatch email. Please configure SMTP.",
      };
    }

    return { success: true, message: "Invitation sent successfully!" };
  } catch (error) {
    console.error("Error sending invitation:", error);
    return { success: false, error: "Failed to send invitation" };
  }
}

export async function acceptInvitation(token: string) {
  const currentUser = await requireUser();

  try {
    const invite = await prisma.groupInvitation.findUnique({
      where: { token },
      include: { group: true },
    });

    if (!invite) return { success: false, error: "Invalid invitation link." };
    if (invite.status !== "PENDING")
      return {
        success: false,
        error: `Invitation already ${invite.status.toLowerCase()}.`,
      };
    if (new Date() > invite.expiresAt) {
      await prisma.groupInvitation.update({
        where: { id: invite.id },
        data: { status: "EXPIRED" },
      });
      return { success: false, error: "Invitation has expired." };
    }

    // Check if the current user is already an active member BEFORE transaction
    const currentlyActive = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: { groupId: invite.groupId, userId: currentUser.id },
      },
    });

    if (
      currentlyActive &&
      currentlyActive.status === GroupMemberStatus.ACTIVE
    ) {
      // Return a special message describing what happened
      return {
        success: false,
        error:
          "You are already an active member of this group! If you meant to add a friend, ensure they sign into their own account before accepting.",
      };
    }

    await prisma.$transaction(async (tx) => {
      // 1. Mark invite accepted
      await tx.groupInvitation.update({
        where: { id: invite.id },
        data: { status: "ACCEPTED", respondedAt: new Date() },
      });

      // 2. Add member
      const existingMember = await tx.groupMember.findUnique({
        where: {
          groupId_userId: { groupId: invite.groupId, userId: currentUser.id },
        },
      });

      if (!existingMember) {
        await tx.groupMember.create({
          data: {
            groupId: invite.groupId,
            userId: currentUser.id,
            role: GroupMemberRole.MEMBER,
            status: GroupMemberStatus.ACTIVE,
          },
        });
      } else if (existingMember.status !== GroupMemberStatus.ACTIVE) {
        await tx.groupMember.update({
          where: { id: existingMember.id },
          data: { status: GroupMemberStatus.ACTIVE },
        });
      }
    });

    revalidatePath(`/groups/${invite.groupId}`);
    revalidatePath(`/groups`);
    return { success: true, groupId: invite.groupId };
  } catch (error) {
    console.error("Error accepting invitation:", error);
    return { success: false, error: "Failed to process invitation" };
  }
}
