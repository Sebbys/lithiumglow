import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import IngredientsManagement from "@/components/ingredients-management";

export default async function IngredientsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

  if (session.user.role !== "nutritionist" && session.user.role !== "admin") {
    redirect("/");
  }

  return <IngredientsManagement />;
}
