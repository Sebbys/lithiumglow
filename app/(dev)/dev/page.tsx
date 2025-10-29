"use client"
import { useSession } from "@/lib/auth-client"
export default function dev(){
    const { data } = useSession();
    const session = data?.user ?? null;
    return(
        <main>
            <pre>{JSON.stringify(session, null, 2)}</pre>
        </main>
    )
}