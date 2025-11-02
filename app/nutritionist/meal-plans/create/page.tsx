import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import MealPlanCreationV2 from "@/components/meal-plan-creation-v2";

export default async function CreateMealPlanPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

  if (session.user.role !== "nutritionist" && session.user.role !== "admin") {
    redirect("/");
  }

  return <MealPlanCreationV2 />;
}
