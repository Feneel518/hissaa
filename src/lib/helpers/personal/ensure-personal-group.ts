import { requireUser } from "@/lib/checks/auth/RequireUser";
import { DEFAULT_CATEGORIES } from "@/lib/constants/categories/DefaultCategories";
import { prisma } from "@/lib/prisma/db";
import { GroupMemberRole, GroupMemberStatus, GroupType } from "@prisma/client";
import { redirect } from "next/navigation";

export const ensurePersonalGroup = async () => {
  const user = await requireUser();

  const existing = await prisma.group.findUnique({
    where: {
      personalOwnerId: user.id,
    },
    select: {
      id: true,
    },
  });

  if (existing) return existing;

  const personalName = user.name?.trim()
    ? `${user.name}'s Personal`
    : "Personal";

  return prisma.$transaction(async (tx) => {
    const again = await tx.group.findUnique({
      where: {
        personalOwnerId: user.id,
      },
      select: {
        id: true,
      },
    });

    if (again) return again;

    const group = await tx.group.create({
      data: {
        name: personalName,
        type: GroupType.PERSONAL,
        isPersonal: true,
        ownerId: user.id,
        personalOwnerId: user.id,
        members: {
          create: {
            userId: user.id,
            role: GroupMemberRole.OWNER,
            status: GroupMemberStatus.ACTIVE,
          },
        },
        categories: {
          create: DEFAULT_CATEGORIES.map((cat) => ({
            ...cat,
            isDefault: true,
          })),
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    return group;
  });
};
