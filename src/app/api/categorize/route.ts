import { NextRequest, NextResponse } from "next/server";
import { detectCategoryFromTitle, DEFAULT_CATEGORY } from "@/lib/helpers/expense/category-detector";

export async function POST(req: NextRequest) {
  try {
    const { title } = await req.json();

    if (!title || typeof title !== "string") {
      return NextResponse.json(DEFAULT_CATEGORY);
    }

    const category = detectCategoryFromTitle(title) ?? DEFAULT_CATEGORY;

    return NextResponse.json({
      name: category.name,
      icon: category.icon,
      color: category.color,
      textColor: category.textColor,
    });
  } catch (err) {
    return NextResponse.json(DEFAULT_CATEGORY, { status: 200 });
  }
}
