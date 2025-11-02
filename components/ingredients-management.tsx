"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Ingredient {
  id: string;
  name: string;
  description: string | null;
  type: string;
  protein: number;
  carbs: number;
  fat: number;
  kcal: number;
  servingSize: number;
  unit: string;
  createdAt: Date;
}

export default function IngredientsManagement() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "other",
    protein: "",
    carbs: "",
    fat: "",
    servingSize: "100",
    unit: "g",
  });

  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    try {
      const response = await fetch("/api/ingredients");
      if (response.ok) {
        const data = await response.json();
        setIngredients(data);
      }
    } catch (error) {
      console.error("Error fetching ingredients:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingIngredient
        ? `/api/ingredients/${editingIngredient.id}`
        : "/api/ingredients";
      const method = editingIngredient ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchIngredients();
        handleCloseDialog();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to save ingredient");
      }
    } catch (error) {
      console.error("Error saving ingredient:", error);
      alert("Failed to save ingredient");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this ingredient?")) return;

    try {
      const response = await fetch(`/api/ingredients/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchIngredients();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to delete ingredient");
      }
    } catch (error) {
      console.error("Error deleting ingredient:", error);
      alert("Failed to delete ingredient");
    }
  };

  const handleEdit = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
    setFormData({
      name: ingredient.name,
      description: ingredient.description || "",
      type: ingredient.type || "other",
      protein: ingredient.protein.toString(),
      carbs: ingredient.carbs.toString(),
      fat: ingredient.fat.toString(),
      servingSize: ingredient.servingSize.toString(),
      unit: ingredient.unit,
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingIngredient(null);
    setFormData({
      name: "",
      description: "",
      type: "other",
      protein: "",
      carbs: "",
      fat: "",
      servingSize: "100",
      unit: "g",
    });
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Ingredients Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage ingredients for meal plans
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Ingredient
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ingredients.map((ingredient) => (
          <Card key={ingredient.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{ingredient.name}</CardTitle>
                  <CardDescription>
                    {ingredient.servingSize} {ingredient.unit}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(ingredient)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(ingredient.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {ingredient.description && (
                <p className="text-sm text-muted-foreground mb-4">
                  {ingredient.description}
                </p>
              )}
              <div className="mb-3">
                <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary">
                  {ingredient.type}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-semibold">Protein:</span> {ingredient.protein}g
                </div>
                <div>
                  <span className="font-semibold">Carbs:</span> {ingredient.carbs}g
                </div>
                <div>
                  <span className="font-semibold">Fat:</span> {ingredient.fat}g
                </div>
                <div>
                  <span className="font-semibold">Kcal:</span> {ingredient.kcal.toFixed(0)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {ingredients.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No ingredients yet. Create your first ingredient!
          </p>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingIngredient ? "Edit Ingredient" : "Add New Ingredient"}
            </DialogTitle>
            <DialogDescription>
              Enter the nutritional information for the ingredient.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="type">Type/Category *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="protein">Protein</SelectItem>
                    <SelectItem value="carbs">Carbohydrates</SelectItem>
                    <SelectItem value="vegetables">Vegetables</SelectItem>
                    <SelectItem value="fruits">Fruits</SelectItem>
                    <SelectItem value="fats">Healthy Fats</SelectItem>
                    <SelectItem value="dairy">Dairy</SelectItem>
                    <SelectItem value="legumes">Legumes</SelectItem>
                    <SelectItem value="dressing">Dressing/Oils</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="servingSize">Serving Size *</Label>
                  <Input
                    id="servingSize"
                    type="number"
                    step="0.1"
                    value={formData.servingSize}
                    onChange={(e) =>
                      setFormData({ ...formData, servingSize: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="unit">Unit *</Label>
                  <Select
                    value={formData.unit}
                    onValueChange={(value) =>
                      setFormData({ ...formData, unit: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="g">g</SelectItem>
                      <SelectItem value="ml">ml</SelectItem>
                      <SelectItem value="piece">piece</SelectItem>
                      <SelectItem value="cup">cup</SelectItem>
                      <SelectItem value="tbsp">tbsp</SelectItem>
                      <SelectItem value="tsp">tsp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="protein">Protein (g) *</Label>
                  <Input
                    id="protein"
                    type="number"
                    step="0.1"
                    value={formData.protein}
                    onChange={(e) =>
                      setFormData({ ...formData, protein: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="carbs">Carbs (g) *</Label>
                  <Input
                    id="carbs"
                    type="number"
                    step="0.1"
                    value={formData.carbs}
                    onChange={(e) =>
                      setFormData({ ...formData, carbs: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="fat">Fat (g) *</Label>
                  <Input
                    id="fat"
                    type="number"
                    step="0.1"
                    value={formData.fat}
                    onChange={(e) =>
                      setFormData({ ...formData, fat: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              {formData.protein && formData.carbs && formData.fat && (
                <div className="p-4 bg-muted rounded-md">
                  <p className="text-sm font-semibold">
                    Calculated Kcal:{" "}
                    {(
                      parseFloat(formData.protein) * 4 +
                      parseFloat(formData.carbs) * 4 +
                      parseFloat(formData.fat) * 9
                    ).toFixed(0)}
                  </p>
                </div>
              )}
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit">
                {editingIngredient ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
