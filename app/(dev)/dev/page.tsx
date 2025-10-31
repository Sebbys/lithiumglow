"use client"
import { useSession } from "@/lib/auth-client"
export default function Dev(){
    const { data } = useSession();
    const session = data?.user ?? null;
    return(
        <main>
            <pre>{JSON.stringify(session, null, 2)}</pre>
        </main>
    )
}