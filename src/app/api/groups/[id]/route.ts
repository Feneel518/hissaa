import { prisma } from "@/lib/prisma/db";
import { requireUser } from "@/lib/checks/auth/RequireUser";
import { NextResponse } from "next/server";
import { GroupMemberStatus } from "@prisma/client";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await requireUser();

    const group = await prisma.group.findUnique({
      where: {
        id,
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

    if (!group) {
        return NextResponse.json({ success: false, error: "Group not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, group });
  } catch (error) {
    console.error("API Error in /api/groups/[id]:", error);
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
}
