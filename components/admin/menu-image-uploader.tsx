"use client"

import { useState } from "react"
import { UploadDropzone } from "@/lib/uploadthing"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, XCircle, ImageIcon, Upload } from "lucide-react"

interface MenuImageUploaderProps {
  menuItemId: string
  currentImage?: string
  onUploadComplete?: (imageUrl: string) => void
}

export function MenuImageUploader({
  menuItemId,
  currentImage,
  onUploadComplete,
}: MenuImageUploaderProps) {
  const [uploadedImage, setUploadedImage] = useState<string | undefined>(
    currentImage
  )
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Current/Uploaded Image Preview */}
      {uploadedImage && (
        <Card className="overflow-hidden border-emerald-200 dark:border-emerald-800">
          <CardContent className="p-0">
            <div className="flex flex-col items-center gap-4 p-6">
              <div className="relative w-full aspect-video max-w-md overflow-hidden rounded-lg border-2 border-emerald-200 dark:border-emerald-800 shadow-lg">
                <Image
                  src={uploadedImage}
                  alt="Menu item"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                  ✓ Current Image
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Upload a new image below to replace
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Dropzone */}
      <div className="flex flex-col items-center">
        <UploadDropzone
          endpoint="menuImageUploader"
          input={{ menuItemId }}
          onClientUploadComplete={(res) => {
            if (res && res[0]) {
              const newImageUrl = res[0].url
              setUploadedImage(newImageUrl)
              setSuccess(true)
              setError(null)
              onUploadComplete?.(newImageUrl)
              
              // Clear success message after 3 seconds
              setTimeout(() => setSuccess(false), 3000)
            }
          }}
          onUploadError={(error: Error) => {
            setError(error.message)
            setSuccess(false)
          }}
          appearance={{
            container:
              "w-full border-2 border-dashed border-emerald-300 dark:border-emerald-700 rounded-xl p-10 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/50 transition-all duration-200 cursor-pointer",
            uploadIcon: "text-emerald-600 dark:text-emerald-400",
            label: "text-emerald-700 dark:text-emerald-300 font-semibold text-base",
            allowedContent: "text-emerald-600/80 dark:text-emerald-400/80 text-sm mt-2",
            button:
              "bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 py-2.5 rounded-lg transition-colors shadow-sm hover:shadow-md ut-ready:bg-emerald-600 ut-uploading:bg-emerald-700 ut-uploading:cursor-not-allowed",
          }}
          content={{
            uploadIcon: () => (
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <ImageIcon className="h-16 w-16" />
                  <Upload className="h-6 w-6 absolute -bottom-1 -right-1 bg-emerald-600 text-white rounded-full p-1" />
                </div>
              </div>
            ),
            label: () => (
              <div className="text-center space-y-2">
                <p className="text-lg font-semibold">
                  {uploadedImage ? "Upload New Image" : "Upload Menu Item Image"}
                </p>
                <p className="text-sm text-muted-foreground font-normal">
                  Click to browse or drag and drop
                </p>
              </div>
            ),
            allowedContent: () => (
              <div className="text-center">
                <p className="text-sm">PNG, JPG, or WebP</p>
                <p className="text-xs text-muted-foreground mt-1">Maximum file size: 4MB</p>
              </div>
            ),
          }}
        />
      </div>

      {/* Success Message */}
      {success && (
        <Alert className="border-emerald-500 bg-emerald-50 dark:bg-emerald-950 shadow-sm">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <AlertDescription className="text-emerald-700 dark:text-emerald-300 font-medium">
            ✓ Image uploaded successfully! The form will be updated automatically.
          </AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="destructive" className="shadow-sm">
          <XCircle className="h-5 w-5" />
          <AlertDescription className="font-medium">
            {error}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
