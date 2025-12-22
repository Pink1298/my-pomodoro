"use client";

import { useThemeSettingsStore } from "@/lib/store";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme } from "next-themes";

export function AppearanceSettings() {
    const { colorTheme, fontTheme, circadianMode, setColorTheme, setFontTheme, toggleCircadianMode } = useThemeSettingsStore();
    const { theme, setTheme } = useTheme();

    return (
        <div className="space-y-8">
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Theme Color</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[
                        { id: 'stone', name: 'Stone', color: 'bg-stone-500' },
                        { id: 'blue', name: 'Focus Blue', color: 'bg-blue-500' },
                        { id: 'rose', name: 'Calm Rose', color: 'bg-rose-500' },
                        { id: 'green', name: 'Nature', color: 'bg-emerald-500' },
                        { id: 'orange', name: 'Sunrise', color: 'bg-orange-500' },
                    ].map((t) => (
                        <div key={t.id} className="cursor-pointer" onClick={() => setColorTheme(t.id as any)}>
                            <div className={`h-20 rounded-lg border-2 flex items-center justify-center mb-2 transition-all ${colorTheme === t.id ? 'border-primary ring-2 ring-primary/20' : 'border-transparent bg-secondary/50 hover:bg-secondary'}`}>
                                <div className={`h-8 w-8 rounded-full ${t.color}`} />
                            </div>
                            <p className="text-center text-xs font-medium">{t.name}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                    <Label className="text-base">Circadian Mode</Label>
                    <p className="text-sm text-muted-foreground">
                        Automatically switch between Light and Dark mode based on time of day.
                    </p>
                </div>
                <Switch
                    checked={circadianMode}
                    onCheckedChange={toggleCircadianMode}
                />
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-medium">Typography</h3>
                <RadioGroup value={fontTheme} onValueChange={(v) => setFontTheme(v as any)} className="grid grid-cols-3 gap-4">
                    <div>
                        <RadioGroupItem value="sans" id="sans" className="peer sr-only" />
                        <Label
                            htmlFor="sans"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                            <span className="text-2xl font-sans mb-2">Aa</span>
                            <span className="text-xs">Sans</span>
                        </Label>
                    </div>
                    <div>
                        <RadioGroupItem value="serif" id="serif" className="peer sr-only" />
                        <Label
                            htmlFor="serif"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                            <span className="text-2xl font-serif mb-2">Aa</span>
                            <span className="text-xs">Serif</span>
                        </Label>
                    </div>
                    <div>
                        <RadioGroupItem value="mono" id="mono" className="peer sr-only" />
                        <Label
                            htmlFor="mono"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                            <span className="text-2xl font-mono mb-2">Aa</span>
                            <span className="text-xs">Mono</span>
                        </Label>
                    </div>
                </RadioGroup>
            </div>
        </div>
    );
}
