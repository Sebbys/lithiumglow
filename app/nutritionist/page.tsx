import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Apple, Calendar, Users } from "lucide-react";

export default async function NutritionistDashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

  if (session.user.role !== "nutritionist" && session.user.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Nutritionist Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back, {session.user.name}!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Apple className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Ingredients</CardTitle>
                <CardDescription>Manage food database</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Create and manage ingredients with nutritional information for meal plans.
            </p>
            <Link href="/nutritionist/ingredients">
              <Button className="w-full">Manage Ingredients</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Meal Plans</CardTitle>
                <CardDescription>Create 7-day plans</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Design personalized 7-day meal plans for members with detailed macros.
            </p>
            <Link href="/nutritionist/meal-plans/create">
              <Button className="w-full">Create Meal Plan</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Members</CardTitle>
                <CardDescription>View members</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              View all members and their meal plan status.
            </p>
            <Button className="w-full" variant="outline" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>Quick guide to using the nutritionist dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2">
              <li>
                <strong>Add Ingredients:</strong> Start by adding ingredients to your database with their nutritional information (protein, carbs, fat per serving).
              </li>
              <li>
                <strong>Create Meal Plans:</strong> Select a member and create a 7-day meal plan by adding ingredients to each day's meals.
              </li>
              <li>
                <strong>Monitor Progress:</strong> Track member compliance and adjust plans as needed.
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
