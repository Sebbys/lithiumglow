"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { signOut } from "@/lib/auth-client"
import { useSession } from "@/components/SessionProvier"
import { useRouter } from "next/navigation";
import Link from "next/link"
// import { siteConfig } from "@/config/site.config"
import { toast } from "sonner"
import { LogOutIcon } from "lucide-react"
import { cn } from "@/lib/utils";

export function UserProfile({ className }: { className?: string }) {
  const [signingOut, setSigningOut] = useState(false);
  const { session, isPending } = useSession();
  const router = useRouter();

  if (isPending) {
    return (
      <div className="size-10 md:size-14 aspect-square flex items-center justify-center p-3">
        <div className="size-4 md:size-8 rounded-full bg-muted/50 animate-pulse"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={cn("size-14 aspect-square p-2 md:p-3", signingOut && "animate-pulse", className)} asChild>
          <Avatar>
            <AvatarImage src={session.user.image ?? ""} alt={session.user.name ?? ""} className="rounded-full" />
            <AvatarFallback className="rounded-full">{session.user.name?.charAt(0)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[250px]">
        <div className="p-4 flex flex-col gap-4">
      {JSON.stringify(session.user.name, null, 2)}
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <p className="font-medium leading-none">{session.user.name}</p>
              <p className="text-sm text-muted-foreground">{session.user.email}</p>
            </div>
            <Avatar className="size-8">
              <AvatarImage src={session.user.image ?? ""} alt={session.user.name ?? ""} className="rounded-full" />
              <AvatarFallback className="rounded-full">{session.user.name?.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" asChild>
          <Link href="/dashboard">Dashboard</Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer" asChild>
          <Link href="/orders">Orders</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer w-full flex items-center justify-between gap-2"
          onClick={() => signOut({
            fetchOptions: {
              onRequest: () => {
                setSigningOut(true);
                toast.loading("Signing out...");
              },
              onSuccess: () => {
                setSigningOut(false);
                toast.success("Signed out successfully");
                toast.dismiss();
                router.push("/");
              },
              onError: () => {
                setSigningOut(false);
                toast.error("Failed to sign out");
              },
            }
          })}
        >
          <span>Sign Out</span>
          <LogOutIcon className="size-4" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}