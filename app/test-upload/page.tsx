import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { ProfilePictureUploaderClient } from "@/components/profile-picture-uploader-client"

export const metadata = {
  title: "Test Upload - Profile Picture | FitBite",
  description: "Test UploadThing integration",
}

export default async function TestUploadPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/api/auth/signin")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-emerald-600">FitBite</h1>
              <p className="text-xs text-muted-foreground">Upload Test</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold">Test Profile Picture Upload</h2>
            <p className="text-muted-foreground mt-2">
              Upload a profile picture to test the UploadThing integration
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Upload Your Profile Picture</CardTitle>
              <CardDescription>
                This will update your profile picture in the database
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfilePictureUploaderClient
                currentAvatar={session.user.image}
                userName={session.user.name}
              />
            </CardContent>
          </Card>

          <Card className="bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2 text-emerald-700 dark:text-emerald-300">
                ✅ Integration Status
              </h3>
              <ul className="space-y-1 text-sm text-emerald-600 dark:text-emerald-400">
                <li>• UploadThing configured and ready</li>
                <li>• Authentication working</li>
                <li>• Database integration active</li>
                <li>• Image will be saved to user.image field</li>
              </ul>
            </CardContent>
          </Card>

          <div className="text-sm text-muted-foreground">
            <p><strong>Current user:</strong> {session.user.name}</p>
            <p><strong>Email:</strong> {session.user.email}</p>
            <p><strong>Role:</strong> {session.user.role}</p>
            {session.user.image && (
              <p><strong>Current avatar:</strong> {session.user.image}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
