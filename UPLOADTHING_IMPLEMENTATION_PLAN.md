# UploadThing Implementation Plan for FitBite

## 📋 Overview
This document outlines the plan to integrate UploadThing for file upload functionality in the FitBite food ordering application using the latest UploadThing v7+ features.

## 🎯 Implementation Goals

1. **Menu Item Images**: Allow admins to upload food item images
2. **User Profile Pictures**: Enable customers to upload profile avatars
3. **Type-Safe Integration**: Use React 19 + Next.js 16 patterns
4. **Optimized Performance**: Leverage SSR hydration and modern patterns

## 📦 Required Packages

```json
{
  "uploadthing": "^7.0.0",
  "@uploadthing/react": "^7.0.0"
}
```

## 🏗️ Architecture Plan

### Phase 1: Setup & Configuration

#### 1.1 Install Dependencies
```bash
npm install uploadthing @uploadthing/react
```

#### 1.2 Environment Variables
Add to `.env`:
```env
UPLOADTHING_TOKEN=your_token_here
```

#### 1.3 Configure Tailwind
Update `tailwind.config.ts` with `withUt` wrapper for optimal theming:
```typescript
import { withUt } from "uploadthing/tw"

export default withUt({
  // existing config
})
```

### Phase 2: Backend Setup

#### 2.1 Create File Router
**Location**: `app/api/uploadthing/core.ts`

**Features**:
- **Menu Image Uploader**:
  - Allowed: Images only
  - Max size: 4MB
  - Max count: 5 images per menu item
  - Auth: Admin only
  - Metadata: userId, menuItemId

- **Profile Picture Uploader**:
  - Allowed: Images only (jpg, png, webp)
  - Max size: 2MB
  - Max count: 1
  - Auth: Authenticated users only
  - Metadata: userId
  - Custom naming: Use userId as customId

**Implementation Details**:
```typescript
import { createUploadthing, type FileRouter } from "uploadthing/next"
import { UploadThingError } from "uploadthing/server"
import { z } from "zod"

const f = createUploadthing()

// Middleware for auth
const authMiddleware = async (req: Request) => {
  // Use better-auth session
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new UploadThingError("Unauthorized")
  return { userId: session.user.id }
}

export const ourFileRouter = {
  // Menu images for admin
  menuImageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 5,
    }
  })
    .input(z.object({ menuItemId: z.string() }))
    .middleware(async ({ req, input }) => {
      const session = await auth.api.getSession({ headers: await headers() })
      if (!session || session.user.role !== 'admin') {
        throw new UploadThingError("Admin access required")
      }
      return { userId: session.user.id, menuItemId: input.menuItemId }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Save to database
      console.log("Menu image uploaded:", file.url)
      return { uploadedBy: metadata.userId, menuItemId: metadata.menuItemId }
    }),

  // Profile pictures for users
  profilePicture: f({
    image: {
      maxFileSize: "2MB",
      maxFileCount: 1,
    }
  })
    .middleware(async ({ req }) => {
      const session = await auth.api.getSession({ headers: await headers() })
      if (!session) throw new UploadThingError("Unauthorized")
      return { userId: session.user.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Update user profile in database
      console.log("Profile picture uploaded:", file.url)
      return { uploadedBy: metadata.userId }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
```

#### 2.2 Create API Route Handler
**Location**: `app/api/uploadthing/route.ts`

```typescript
import { createRouteHandler } from "uploadthing/next"
import { ourFileRouter } from "./core"

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
  config: {
    token: process.env.UPLOADTHING_TOKEN,
    logLevel: "Info",
  },
})
```

### Phase 3: Frontend Components

#### 3.1 Generate Typed Components
**Location**: `lib/uploadthing.ts`

```typescript
import {
  generateUploadButton,
  generateUploadDropzone,
  generateReactHelpers,
} from "@uploadthing/react"

import type { OurFileRouter } from "@/app/api/uploadthing/core"

export const UploadButton = generateUploadButton<OurFileRouter>()
export const UploadDropzone = generateUploadDropzone<OurFileRouter>()

export const { useUploadThing, uploadFiles } = generateReactHelpers<OurFileRouter>()
```

#### 3.2 Menu Image Upload Component
**Location**: `components/admin/menu-image-uploader.tsx`

**Features**:
- Use `UploadDropzone` for drag-and-drop
- Show upload progress
- Display image preview
- Handle multiple images
- Optimistic UI updates
- Error handling

**Component Structure**:
```tsx
"use client"

import { UploadDropzone } from "@/lib/uploadthing"
import { useState } from "react"
import Image from "next/image"

export function MenuImageUploader({ menuItemId }: { menuItemId: string }) {
  const [images, setImages] = useState<string[]>([])
  
  return (
    <div className="space-y-4">
      <UploadDropzone
        endpoint="menuImageUploader"
        input={{ menuItemId }}
        onClientUploadComplete={(res) => {
          const newImages = res?.map(r => r.url) ?? []
          setImages(prev => [...prev, ...newImages])
        }}
        onUploadError={(error) => {
          alert(`ERROR! ${error.message}`)
        }}
        appearance={{
          container: "border-2 border-dashed border-emerald-300",
          button: "bg-emerald-600 hover:bg-emerald-700",
        }}
      />
      
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {images.map((url, i) => (
            <Image key={i} src={url} alt="" width={200} height={200} />
          ))}
        </div>
      )}
    </div>
  )
}
```

#### 3.3 Profile Picture Upload Component
**Location**: `components/profile-picture-uploader.tsx`

**Features**:
- Use `UploadButton` for simple upload
- Show current avatar
- Replace existing image
- Circular crop preview
- Integrate with UserProfile component

**Component Structure**:
```tsx
"use client"

import { UploadButton } from "@/lib/uploadthing"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useState } from "react"

export function ProfilePictureUploader({ currentAvatar }: { currentAvatar?: string }) {
  const [avatar, setAvatar] = useState(currentAvatar)
  
  return (
    <div className="flex flex-col items-center gap-4">
      <Avatar className="h-24 w-24">
        <AvatarImage src={avatar} />
        <AvatarFallback>U</AvatarFallback>
      </Avatar>
      
      <UploadButton
        endpoint="profilePicture"
        onClientUploadComplete={(res) => {
          const newAvatar = res?.[0]?.url
          if (newAvatar) setAvatar(newAvatar)
        }}
        onUploadError={(error) => {
          alert(`ERROR! ${error.message}`)
        }}
        appearance={{
          button: "bg-emerald-600 text-sm",
          container: "w-max",
        }}
      />
    </div>
  )
}
```

### Phase 4: SSR Optimization

#### 4.1 Add NextSSRPlugin to Layout
**Location**: `app/layout.tsx`

```typescript
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin"
import { extractRouterConfig } from "uploadthing/server"
import { ourFileRouter } from "@/app/api/uploadthing/core"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <NextSSRPlugin
          routerConfig={extractRouterConfig(ourFileRouter)}
        />
        {children}
      </body>
    </html>
  )
}
```

**Benefits**:
- Eliminates "Loading..." state
- File type/size info available immediately
- Better UX for users

### Phase 5: Database Integration

#### 5.1 Update Schema
Add to `db/schema.ts`:

```typescript
export const menuItems = pgTable("menu_items", {
  // existing fields...
  images: text("images").array().default([]), // Array of UploadThing URLs
  primaryImage: text("primary_image"), // Main display image
})

export const users = pgTable("users", {
  // existing fields...
  avatar: text("avatar"), // UploadThing URL
})
```

#### 5.2 Create Upload Actions
**Location**: `app/actions/uploads.ts`

```typescript
"use server"

import { db } from "@/db/drizzle"
import { menuItems, users } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function saveMenuImages(menuItemId: string, imageUrls: string[]) {
  await db.update(menuItems)
    .set({ 
      images: imageUrls,
      primaryImage: imageUrls[0] // First image as primary
    })
    .where(eq(menuItems.id, menuItemId))
}

export async function updateUserAvatar(userId: string, avatarUrl: string) {
  await db.update(users)
    .set({ avatar: avatarUrl })
    .where(eq(users.id, userId))
}
```

### Phase 6: Admin Integration

#### 6.1 Menu Item Form
Update `components/menu-item-form.tsx`:
- Add `MenuImageUploader` component
- Show existing images
- Allow reordering images
- Set primary image

#### 6.2 Admin Menu Management
Update `app/admin/page.tsx`:
- Display menu item images in cards
- Quick upload from menu list
- Bulk image operations

### Phase 7: Customer Experience

#### 7.1 Menu Display
Update `components/menu-card-item.tsx`:
- Show primary image from UploadThing
- Image optimization with Next.js Image
- Fallback for items without images

#### 7.2 User Profile
Update `components/UserProfile.tsx`:
- Show uploaded avatar
- Add "Change Picture" option
- Integrate ProfilePictureUploader

## 🎨 Theming Strategy

### Using Tailwind with `withUt`
The `withUt` wrapper provides special variants:
- `ut-button:` - Style button element
- `ut-label:` - Style label element
- `ut-allowed-content:` - Style allowed content
- `ut-upload-icon:` - Style upload icon
- `ut-readying:` - Apply when readying
- `ut-ready:` - Apply when ready
- `ut-uploading:` - Apply when uploading

### Brand-Consistent Styling
```tsx
<UploadButton
  className="ut-button:bg-emerald-600 ut-button:hover:bg-emerald-700"
  appearance={{
    container: "border-emerald-200",
    allowedContent: "text-emerald-600",
  }}
/>
```

## 🔒 Security Considerations

1. **Auth Middleware**: All uploads require authentication
2. **Role-Based Access**: Menu uploads restricted to admins
3. **File Type Validation**: Strict MIME type checking
4. **Size Limits**: Prevent abuse with reasonable limits
5. **Rate Limiting**: Consider UploadThing's built-in rate limits

## 📊 File Management with UTApi

For advanced operations, use `UTApi`:

```typescript
import { UTApi } from "uploadthing/server"

const utapi = new UTApi()

// Delete old images
await utapi.deleteFiles(["old-image-key.jpg"])

// Rename files
await utapi.renameFiles({ fileKey: "abc.jpg", newName: "menu-item.jpg" })

// List all files
const files = await utapi.listFiles()
```

## ✅ Testing Plan

1. **Unit Tests**: Test upload callbacks and error handling
2. **Integration Tests**: Test auth flow and database updates
3. **E2E Tests**: Test complete upload workflow
4. **Manual Testing**:
   - Upload various image formats
   - Test file size limits
   - Test auth restrictions
   - Test error scenarios

## 📈 Performance Optimization

1. **Image Optimization**:
   - Use Next.js Image component
   - Implement lazy loading
   - Generate thumbnails

2. **Caching**:
   - Cache uploaded image URLs
   - Use stale-while-revalidate
   - Implement CDN caching

3. **Loading States**:
   - Show upload progress
   - Optimistic UI updates
   - Skeleton loaders

## 🚀 Deployment Checklist

- [ ] Install dependencies
- [ ] Add environment variables
- [ ] Configure Tailwind with `withUt`
- [ ] Create file router
- [ ] Create API route handler
- [ ] Generate typed components
- [ ] Add SSR plugin to layout
- [ ] Update database schema
- [ ] Run migrations
- [ ] Create upload components
- [ ] Integrate with admin panel
- [ ] Integrate with customer UI
- [ ] Test upload flow
- [ ] Test auth restrictions
- [ ] Deploy to production
- [ ] Monitor uploads in dashboard

## 📚 Key Features Summary

| Feature | Component | Endpoint | Auth Required | Max Size | Max Count |
|---------|-----------|----------|---------------|----------|-----------|
| Menu Images | MenuImageUploader | menuImageUploader | Admin | 4MB | 5 |
| Profile Picture | ProfilePictureUploader | profilePicture | User | 2MB | 1 |

## 🔗 Resources

- [UploadThing Dashboard](https://uploadthing.com/dashboard)
- [UploadThing Docs](https://docs.uploadthing.com/)
- [File Routes API](https://docs.uploadthing.com/file-routes)
- [React Components](https://docs.uploadthing.com/api-reference/react)
- [Server API](https://docs.uploadthing.com/api-reference/server)
- [Theming Guide](https://docs.uploadthing.com/concepts/theming)

## 📝 Notes

- UploadThing v7+ uses React 19 patterns
- SSR plugin eliminates loading states
- `withUt` provides Tailwind variants
- File metadata stored in database
- URLs are permanent and CDN-backed
- Free tier: 2GB storage, 2GB bandwidth/month

## 🎯 Next Steps

1. Review plan with team
2. Get UploadThing API key from dashboard
3. Start with Phase 1 (Setup)
4. Implement incrementally
5. Test thoroughly
6. Deploy to staging
7. Monitor and optimize
