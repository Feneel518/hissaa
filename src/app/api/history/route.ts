import { getActivityHistory } from "@/lib/actions/expense.actions";
import { requireUser } from "@/lib/checks/auth/RequireUser";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await requireUser();
    const res = await getActivityHistory();
    return NextResponse.json(res);
  } catch (error) {
    console.error("API Error in /api/history:", error);
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
}
