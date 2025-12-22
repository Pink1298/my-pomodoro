"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { useState } from "react";

export function MobileNav() {
    const [open, setOpen] = useState(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" className="md:hidden p-2">
                    <Menu className="h-6 w-6" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 bg-sidebar w-72">
                <Sidebar className="border-none" />
            </SheetContent>
        </Sheet>
    );
}
