"use client";

import { useTimerStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bell, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { AppearanceSettings } from "@/components/settings/appearance-settings";

export default function SettingsPage() {
    const { settings, updateSettings } = useTimerStore();

    const requestNotificationPermission = () => {
        Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
                toast.success("Notifications enabled!");
            } else {
                toast.error("Notifications denied.");
            }
        });
    };

    return (
        <div className="space-y-6 mx-auto py-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
                <p className="text-muted-foreground">Customize your timer preferences.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Timer Durations</CardTitle>
                    <CardDescription>Set the duration for each timer mode (in minutes).</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Pomodoro</Label>
                            <Input
                                type="number"
                                value={settings.pomodoroDuration}
                                onChange={(e) => updateSettings({ pomodoroDuration: Number(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Short Break</Label>
                            <Input
                                type="number"
                                value={settings.shortBreakDuration}
                                onChange={(e) => updateSettings({ shortBreakDuration: Number(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Long Break</Label>
                            <Input
                                type="number"
                                value={settings.longBreakDuration}
                                onChange={(e) => updateSettings({ longBreakDuration: Number(e.target.value) })}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>Personalize the app to fit your vibe.</CardDescription>
                </CardHeader>
                <CardContent>
                    <AppearanceSettings />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Notifications & Sound</CardTitle>
                    <CardDescription>Manage how you want to be alerted.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between space-x-2">
                        <div className="flex items-center space-x-2">
                            <Bell className="h-4 w-4" />
                            <Label htmlFor="auto-start-breaks">Auto-start Breaks</Label>
                        </div>
                        <Switch
                            id="auto-start-breaks"
                            checked={settings.autoStartBreaks}
                            onCheckedChange={(c) => updateSettings({ autoStartBreaks: c })}
                        />
                    </div>
                    <div className="flex items-center justify-between space-x-2">
                        <div className="flex items-center space-x-2">
                            <Volume2 className="h-4 w-4" />
                            <Label htmlFor="auto-start-pomo">Auto-start Pomodoros</Label>
                        </div>
                        <Switch
                            id="auto-start-pomo"
                            checked={settings.autoStartPomodoros}
                            onCheckedChange={(c) => updateSettings({ autoStartPomodoros: c })}
                        />
                    </div>
                    <div className="flex items-center justify-between space-x-2">
                        <div className="flex items-center space-x-2">
                            <Label htmlFor="continuous-mode">Continuous Mode (Loop)</Label>
                        </div>
                        <Switch
                            id="continuous-mode"
                            checked={settings.continuousMode}
                            onCheckedChange={(c) => updateSettings({ continuousMode: c })}
                        />
                    </div>

                    <div className="pt-4 border-t">
                        <Button variant="outline" onClick={requestNotificationPermission}>
                            <Bell className="mr-2 h-4 w-4" />
                            Enable Browser Notifications
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
