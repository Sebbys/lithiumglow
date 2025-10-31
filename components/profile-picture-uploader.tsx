"use client"

import { useState } from "react"
import { UploadButton } from "@/lib/uploadthing"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, XCircle, User } from "lucide-react"

interface ProfilePictureUploaderProps {
  currentAvatar?: string | null
  userName?: string
  onUploadComplete?: (imageUrl: string) => void
}

export function ProfilePictureUploader({
  currentAvatar,
  userName = "User",
  onUploadComplete,
}: ProfilePictureUploaderProps) {
  const [avatar, setAvatar] = useState<string | null | undefined>(currentAvatar)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <Card className="border-emerald-200 dark:border-emerald-800 shadow-sm">
        <CardContent className="pt-8 pb-8">
          <div className="flex flex-col items-center gap-6">
            {/* Avatar Preview */}
            <div className="relative">
              <Avatar className="h-32 w-32 border-4 border-emerald-200 dark:border-emerald-800 shadow-lg">
                <AvatarImage src={avatar || undefined} alt={userName} />
                <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-2xl">
                  {avatar ? null : initials || <User className="h-12 w-12" />}
                </AvatarFallback>
              </Avatar>
              {avatar && (
                <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white rounded-full p-2 shadow-md">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              )}
            </div>

            <div className="text-center space-y-1">
              <p className="text-base font-semibold text-foreground">{userName}</p>
              <p className="text-sm text-muted-foreground">
                {avatar ? "Update your profile picture" : "Add a profile picture"}
              </p>
            </div>

            {/* Upload Button */}
            <UploadButton
              endpoint="profilePictureUploader"
              onClientUploadComplete={(res) => {
                if (res && res[0]) {
                  const newAvatarUrl = res[0].url
                  setAvatar(newAvatarUrl)
                  setSuccess(true)
                  setError(null)
                  setIsUploading(false)
                  onUploadComplete?.(newAvatarUrl)

                  // Clear success message after 3 seconds
                  setTimeout(() => setSuccess(false), 3000)
                }
              }}
              onUploadError={(error: Error) => {
                setError(error.message)
                setSuccess(false)
                setIsUploading(false)
              }}
              onUploadBegin={() => {
                setIsUploading(true)
                setError(null)
                setSuccess(false)
              }}
              appearance={{
                button:
                  "bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm px-6 py-2.5 rounded-lg transition-colors shadow-sm hover:shadow-md ut-ready:bg-emerald-600 ut-uploading:bg-emerald-700 ut-uploading:cursor-not-allowed",
                container: "w-full flex justify-center",
                allowedContent: "text-xs text-muted-foreground mt-2",
              }}
              content={{
                button: ({ ready, isUploading }) => {
                  if (isUploading) return "⏳ Uploading..."
                  if (!ready) return "Loading..."
                  return avatar ? "📸 Change Picture" : "📸 Upload Picture"
                },
                allowedContent: () => "PNG, JPG, or WebP • Maximum 2MB",
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Success Message */}
      {success && (
        <Alert className="border-emerald-500 bg-emerald-50 dark:bg-emerald-950 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <AlertDescription className="text-emerald-700 dark:text-emerald-300 font-medium">
            ✓ Profile picture updated successfully!
          </AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="destructive" className="shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <XCircle className="h-5 w-5" />
          <AlertDescription className="font-medium">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <AlertDescription className="text-blue-700 dark:text-blue-300 font-medium">
            Uploading your profile picture...
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
