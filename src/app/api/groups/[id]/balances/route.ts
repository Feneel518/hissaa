import { getGroupBalances } from "@/lib/actions/expense.actions";
import { requireUser } from "@/lib/checks/auth/RequireUser";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await requireUser();

    // Call the existing server function
    const balances = await getGroupBalances(id, true);

    return NextResponse.json(balances);
  } catch (error) {
    console.error("API Error in /api/groups/[id]/balances:", error);
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }
}
