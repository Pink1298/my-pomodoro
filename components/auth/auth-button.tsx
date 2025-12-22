"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { User } from "@supabase/supabase-js";
import { Loader2, LogIn, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AuthButton() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    // Check if properly configured
    const isConfigured =
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co' &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    useEffect(() => {
        if (!isConfigured) {
            setLoading(false);
            return;
        }

        // // Check active session
        // const checkUser = async () => {
        //     try {
        //         const { data: { user } } = await supabase.auth.getUser();
        //         console.log("user", user);

        //         setUser(user);
        //     } catch (error) {
        //         console.error("Auth check failed", error);
        //     } finally {
        //         setLoading(false);
        //     }
        // };

        // checkUser();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            console.log("session", session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();

    }, [supabase]);

    const handleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${location.origin}/auth/callback`,
            },
        });

        if (error) {
            toast.error("Failed to login: " + error.message);
        }
    };

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            toast.error("Failed to logout");
        } else {
            toast.success("Logged out successfully");
            setUser(null);
        }
    };

    if (loading) {
        return (
            <Button variant="ghost" size="icon" disabled>
                <Loader2 className="h-4 w-4 animate-spin" />
            </Button>
        );
    }

    if (!isConfigured) {
        return (
            <Button variant="ghost" size="sm" disabled className="w-full justify-start gap-2 text-muted-foreground">
                <LogIn className="h-4 w-4" />
                <span>Config Required</span>
            </Button>
        );
    }

    if (!user) {
        return (
            <Button variant="outline" size="sm" onClick={handleLogin} className="w-full justify-start gap-2">
                <LogIn className="h-4 w-4" />
                <span>Sign in with Google</span>
            </Button>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-2 px-2">
                    <Avatar className="h-6 w-6">
                        <AvatarImage src={user.user_metadata.avatar_url} />
                        <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="truncate text-sm max-w-[100px]">{user.user_metadata.full_name || user.email}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
