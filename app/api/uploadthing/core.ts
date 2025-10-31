import { createUploadthing, type FileRouter } from "uploadthing/next"
import { UploadThingError } from "uploadthing/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { db } from "@/db/drizzle"
import { user, menuItem } from "@/db/schema"
import { eq } from "drizzle-orm"
import { z } from "zod"

const f = createUploadthing()

/**
 * File Router for UploadThing
 * Handles image uploads for menu items and user profiles
 */
export const ourFileRouter = {
  /**
   * Menu Image Uploader - For admin use only
   * Allows uploading food item images
   */
  menuImageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .input(
      z.object({
        menuItemId: z.string().uuid(),
      })
    )
    .middleware(async ({ req, input }) => {
      // Authenticate user
      const session = await auth.api.getSession({
        headers: await headers(),
      })

      if (!session) {
        throw new UploadThingError("You must be logged in to upload images")
      }

      // Check if user is admin
      if (session.user.role !== "admin") {
        throw new UploadThingError("Admin access required to upload menu images")
      }

      // Verify menu item exists
      const menuItemExists = await db
        .select({ id: menuItem.id })
        .from(menuItem)
        .where(eq(menuItem.id, input.menuItemId))
        .limit(1)

      if (menuItemExists.length === 0) {
        throw new UploadThingError("Menu item not found")
      }

      return {
        userId: session.user.id,
        menuItemId: input.menuItemId,
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Menu image uploaded:", {
        url: file.ufsUrl,
        key: file.key,
        menuItemId: metadata.menuItemId,
      })

      // Update menu item with new image URL
      await db
        .update(menuItem)
        .set({
          image: file.ufsUrl,
        })
        .where(eq(menuItem.id, metadata.menuItemId))

      return {
        uploadedBy: metadata.userId,
        menuItemId: metadata.menuItemId,
        imageUrl: file.ufsUrl,
      }
    }),

  /**
   * Profile Picture Uploader - For authenticated users
   * Allows users to upload their profile avatar
   */
  profilePictureUploader: f({
    image: {
      maxFileSize: "2MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      // Authenticate user
      const session = await auth.api.getSession({
        headers: await headers(),
      })

      if (!session) {
        throw new UploadThingError("You must be logged in to upload a profile picture")
      }

      return {
        userId: session.user.id,
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Profile picture uploaded:", {
        url: file.ufsUrl,
        key: file.key,
        userId: metadata.userId,
      })

      // Update user profile with new image URL
      await db
        .update(user)
        .set({
          image: file.ufsUrl,
        })
        .where(eq(user.id, metadata.userId))

      return {
        uploadedBy: metadata.userId,
        imageUrl: file.ufsUrl,
      }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
