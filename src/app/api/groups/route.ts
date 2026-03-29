import { prisma } from "@/lib/prisma/db";
import { requireUser } from "@/lib/checks/auth/RequireUser";
import { NextResponse } from "next/server";
import { GroupMemberStatus } from "@prisma/client";

export async function GET() {
  try {
    const user = await requireUser();

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

    return NextResponse.json({ success: true, groups });
  } catch (error) {
    console.error("API Error in /api/groups:", error);
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
}
