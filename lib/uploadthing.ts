/**
 * UploadThing Typed Components and Hooks
 * Generated with type safety from our file router
 */
import {
  generateUploadButton,
  generateUploadDropzone,
  generateReactHelpers,
} from "@uploadthing/react"

import type { OurFileRouter } from "@/app/api/uploadthing/core"

/**
 * Pre-configured UploadButton with type safety
 * Usage: <UploadButton endpoint="menuImageUploader" ... />
 */
export const UploadButton = generateUploadButton<OurFileRouter>()

/**
 * Pre-configured UploadDropzone with type safety
 * Usage: <UploadDropzone endpoint="profilePictureUploader" ... />
 */
export const UploadDropzone = generateUploadDropzone<OurFileRouter>()

/**
 * React hooks for custom upload implementations
 * - useUploadThing: Hook for programmatic uploads
 * - uploadFiles: Function to upload files directly
 */
export const { useUploadThing, uploadFiles } =
  generateReactHelpers<OurFileRouter>()
