import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/db";
import { requireUser } from "@/lib/checks/auth/RequireUser";

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    const query = req.nextUrl.searchParams.get("q")?.trim();

    if (!query || query.length < 2) {
      return NextResponse.json({
        groups: [],
        expenses: [],
        members: [],
      });
    }

    const groups = await prisma.group.findMany({
      where: {
        members: {
          some: {
            userId: user.id,
          },
        },
        name: {
          contains: query,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        name: true,
      },
      take: 5,
    });

    const expenses = await prisma.expense.findMany({
      where: {
        group: {
          members: {
            some: {
              userId: user.id,
            },
          },
        },
        OR: [
          {
            title: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      },
      select: {
        id: true,
        title: true,
        totalAmount: true,
        group: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
    });

    const members = await prisma.user.findMany({
      where: {
        ownedGroups: {
          some: {
            members: {
              some: {
                userId: user.id,
              },
            },
          },
        },
        name: {
          contains: query,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      take: 5,
    });

    return NextResponse.json({
      groups,
      expenses,
      members,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Failed to search" }, { status: 500 });
  }
}
