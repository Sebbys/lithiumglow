"use client"

import dynamic from "next/dynamic"

// Dynamically import with ssr: false to prevent hydration mismatch
// This MUST be in a Client Component to use ssr: false
const ProfilePictureUploader = dynamic(
  () => import("@/components/profile-picture-uploader").then((mod) => ({ default: mod.ProfilePictureUploader })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-8">
        <div className="text-sm text-muted-foreground">Loading uploader...</div>
      </div>
    )
  }
)

interface ProfilePictureUploaderClientProps {
  currentAvatar?: string | null
  userName?: string
}

export function ProfilePictureUploaderClient({ currentAvatar, userName }: ProfilePictureUploaderClientProps) {
  return <ProfilePictureUploader currentAvatar={currentAvatar} userName={userName} />
}
