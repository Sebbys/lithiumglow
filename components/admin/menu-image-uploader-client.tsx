"use client"

import dynamic from "next/dynamic"

// Dynamically import with ssr: false to prevent hydration mismatch
// This MUST be in a Client Component to use ssr: false
const MenuImageUploader = dynamic(
  () => import("@/components/admin/menu-image-uploader").then((mod) => ({ default: mod.MenuImageUploader })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-8">
        <div className="text-sm text-muted-foreground">Loading uploader...</div>
      </div>
    )
  }
)

interface MenuImageUploaderClientProps {
  menuItemId: string
  currentImage?: string
  onUploadComplete?: (imageUrl: string) => void
}

export function MenuImageUploaderClient({ 
  menuItemId, 
  currentImage, 
  onUploadComplete 
}: MenuImageUploaderClientProps) {
  return (
    <MenuImageUploader
      menuItemId={menuItemId}
      currentImage={currentImage}
      onUploadComplete={onUploadComplete}
    />
  )
}
