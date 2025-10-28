"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, ArrowLeft } from "lucide-react"
import { getMenuItems } from "@/lib/actions/menu"
import { deleteMenuItem } from "@/lib/actions/admin"
import type { MenuItem } from "@/lib/types"
import Link from "next/link"
import { MenuItemForm } from "@/components/menu-item-form"
import { toast } from "sonner"
import { UserProfile } from "@/components/UserProfile"
import { useSession } from "@/components/SessionProvier"

export default function AdminPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMenuItems()
  }, [])

  const loadMenuItems = async () => {
    setLoading(true)
    const items = await getMenuItems()
    setMenuItems(items)
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      const result = await deleteMenuItem(id)
      if (result.success) {
        await loadMenuItems()
        toast.warning(
          "Item deleted",
          {description: "Menu item has been removed."},
        )
      } else {
        toast.error(
          "Delete failed",
          {description: result.error || "Failed to delete menu item"},
        )
      }
    }
  }

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item)
    setIsFormOpen(true)
  }

  const handleAdd = () => {
    setEditingItem(null)
    setIsFormOpen(true)
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingItem(null)
    loadMenuItems()
  }

  const { session, isPending } = useSession()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Menu
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">Manage menu items</p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <Button onClick={handleAdd} className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
              {!isPending && session && <UserProfile />}
            </div>
          </div>
        </div>
      </header>

      {/* Menu Items Table */}
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent"></div>
            <p className="text-muted-foreground mt-4">Loading menu items...</p>
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Macros</TableHead>
                <TableHead>Options</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {menuItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No menu items found. Add your first item to get started.
                  </TableCell>
                </TableRow>
              ) : (
                menuItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.category}</Badge>
                    </TableCell>
                    <TableCell>${item.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        <Badge variant="secondary" className="text-xs">
                          P: {item.baseMacros.protein}g
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          C: {item.baseMacros.carbs}g
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          F: {item.baseMacros.fats}g
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {item.baseMacros.calories} cal
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {item.customOptions?.length || 0} custom, {item.extraOptions?.length || 0} extra
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        )}
      </main>

      <MenuItemForm item={editingItem} open={isFormOpen} onClose={handleFormClose} />
    </div>
  )
}
