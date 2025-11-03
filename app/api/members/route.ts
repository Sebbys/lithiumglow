import { NextRequest, NextResponse } from "next/server";
import { unstable_noStore } from "next/cache";
import { db } from "@/db/drizzle";
import { user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { getUser } from "@/lib/auth-utils";
import { eq } from "drizzle-orm";

// GET all members (for nutritionists to select when creating plans)
export async function GET(request: NextRequest) {
  unstable_noStore(); // Opt out of static generation before try/catch
  const users = await getUser();
  
  try {
    // const session = await auth.api.getSession({
    //   headers: request.headers,
    // });

    if (!users) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only nutritionists and admins can view members list
    if (users.role !== "nutritionist" && users.role !== "admin") {
      return NextResponse.json(
        { error: "Only nutritionists can view members" },
        { status: 403 }
      );
    }

    const members = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      })
      .from(user)
      .where(eq(user.role, "member"));

    return NextResponse.json(members);
  } catch (error) {
    console.error("Error fetching members:", error);
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 }
    );
  }
}
