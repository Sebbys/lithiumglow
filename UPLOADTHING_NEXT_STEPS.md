# Next Steps: Integrating UploadThing Components

## 🎯 Quick Start Checklist

- [ ] Get UploadThing token from dashboard
- [ ] Add `UPLOADTHING_TOKEN` to `.env`
- [ ] Restart dev server
- [ ] Test components

## 🔑 Step 1: Get Your UploadThing Token

1. Visit https://uploadthing.com/dashboard
2. Sign up or sign in
3. Create a new app (or use existing)
4. Copy your **Secret Token**
5. Add to `.env`:
   ```env
   UPLOADTHING_TOKEN='eyJhcG...'  # Your actual token
   ```

## 🧪 Step 2: Test the Components

### Test Profile Picture Upload

Create a test page: `app/test-upload/page.tsx`

```tsx
import { ProfilePictureUploader } from "@/components/profile-picture-uploader"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export default async function TestUploadPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return <div>Please sign in to test uploads</div>
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Test Profile Picture Upload</h1>
      <ProfilePictureUploader
        currentAvatar={session.user.image}
        userName={session.user.name}
        onUploadComplete={(url) => {
          console.log("✅ Upload complete:", url)
        }}
      />
    </div>
  )
}
```

### Test Menu Image Upload (Admin Only)

Add to admin page: `app/admin/test-menu-upload/page.tsx`

```tsx
import { MenuImageUploader } from "@/components/admin/menu-image-uploader"
import { db } from "@/db/drizzle"
import { menuItem } from "@/db/schema"

export default async function TestMenuUploadPage() {
  // Get first menu item for testing
  const menuItems = await db.select().from(menuItem).limit(1)
  const testItem = menuItems[0]

  if (!testItem) {
    return <div>No menu items found. Create one first!</div>
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Test Menu Image Upload</h1>
      <p className="mb-4">Testing with: {testItem.name}</p>
      <MenuImageUploader
        menuItemId={testItem.id}
        currentImage={testItem.image}
        onUploadComplete={(url) => {
          console.log("✅ Upload complete:", url)
        }}
      />
    </div>
  )
}
```

## 🔧 Step 3: Integrate with Existing Pages

### A. Add to Admin Menu Management

Find `components/menu-item-form.tsx` and add:

```tsx
import { MenuImageUploader } from "@/components/admin/menu-image-uploader"

// Inside your form component:
<div className="space-y-4">
  <h3>Menu Item Image</h3>
  <MenuImageUploader
    menuItemId={menuItemId}
    currentImage={currentImage}
    onUploadComplete={(imageUrl) => {
      // Optionally refresh the page or update state
      window.location.reload()
    }}
  />
</div>
```

### B. Add to User Profile

Find `components/UserProfile.tsx` and integrate:

```tsx
import { ProfilePictureUploader } from "@/components/profile-picture-uploader"

// Add a settings/profile page or dialog with:
<ProfilePictureUploader
  currentAvatar={user.image}
  userName={user.name}
  onUploadComplete={(imageUrl) => {
    // Refresh to show new avatar
    window.location.reload()
  }}
/>
```

## 🎨 Step 4: Customize Styling (Optional)

Both components accept appearance props for customization:

```tsx
<MenuImageUploader
  {...props}
  // Custom appearance - already themed in emerald!
/>
```

## 🐛 Troubleshooting

### Upload not working?

1. **Check token**: Verify `UPLOADTHING_TOKEN` is in `.env`
2. **Restart server**: `npm run dev` after adding token
3. **Check auth**: Make sure user is authenticated
4. **Check role**: Menu uploads require admin role
5. **Check console**: Look for error messages

### Database not updating?

1. Check that menuItem/user IDs exist
2. Verify database connection
3. Check file router onUploadComplete logs

### Image not showing?

1. Check the URL is valid (starts with https://utfs.io)
2. Verify Next.js Image domains configuration
3. Check browser console for errors

## 📝 Add UploadThing Domain to Next.js

Add to `next.config.ts`:

```typescript
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // ... rest of config
}
```

## 🚀 Production Deployment

Before deploying:

1. Add `UPLOADTHING_TOKEN` to production environment variables
2. Test uploads in staging environment
3. Monitor UploadThing dashboard for usage
4. Consider upgrading plan if needed (free: 2GB storage/bandwidth per month)

## 📊 Monitoring

Check your uploads in the UploadThing dashboard:
- https://uploadthing.com/dashboard

You can see:
- Upload stats
- Storage usage
- Bandwidth usage
- Recent uploads
- Error logs

## 🎉 That's It!

You're ready to start uploading images! The components are:
- ✅ Fully type-safe
- ✅ Authenticated and authorized
- ✅ Database-integrated
- ✅ Styled and responsive
- ✅ Production-ready

---

**Questions?**
- UploadThing Docs: https://docs.uploadthing.com/
- UploadThing Discord: https://discord.gg/UCXkw6xj2K
