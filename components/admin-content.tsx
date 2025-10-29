"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { deleteMenuItem } from "@/lib/actions/admin"
import type { MenuItem } from "@/lib/types"
import { MenuItemForm } from "./menu-item-form"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface AdminContentProps {
  initialItems: MenuItem[]
}

export function AdminContent({ initialItems }: AdminContentProps) {
  const router = useRouter()
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialItems)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      setDeleting(id)
      const result = await deleteMenuItem(id)
      
      if (result.success) {
        setMenuItems(prev => prev.filter(item => item.id !== id))
        toast.warning(
          "Item deleted",
          { description: "Menu item has been removed." },
        )
        router.refresh() // Refresh server data
      } else {
        toast.error(
          "Delete failed",
          { description: result.error || "Failed to delete menu item" },
        )
      }
      setDeleting(null)
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

  const handleFormSave = () => {
    setIsFormOpen(false)
    setEditingItem(null)
    router.refresh() // Only refresh when actually saved
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingItem(null)
    // No refresh - user just cancelled
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={handleAdd} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

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
                    <div className="flex gap-1">
                      {item.customOptions && (
                        <Badge variant="secondary" className="text-xs">
                          {item.customOptions.length} custom
                        </Badge>
                      )}
                      {item.extraOptions && (
                        <Badge variant="secondary" className="text-xs">
                          {item.extraOptions.length} extras
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                        disabled={deleting === item.id}
                      >
                        {deleting === item.id ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-destructive" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Menu Item Form Dialog */}
      {isFormOpen && (
        <MenuItemForm
          item={editingItem}
          open={isFormOpen}
          onClose={handleFormClose}
          onSave={handleFormSave}
        />
      )}
    </>
  )
}
