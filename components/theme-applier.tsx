"use client";

import { useEffect } from "react";
import { useThemeSettingsStore } from "@/lib/store";
import { useTheme } from "next-themes";

export function ThemeApplier() {
    const { colorTheme, fontTheme, circadianMode, setColorTheme } = useThemeSettingsStore();
    const { setTheme, theme, systemTheme } = useTheme();

    // Apply Color Theme
    useEffect(() => {
        const root = document.documentElement;
        // Remove all theme classes first
        root.classList.remove('theme-blue', 'theme-rose', 'theme-green', 'theme-orange');

        if (colorTheme !== 'stone') {
            root.classList.add(`theme-${colorTheme}`);
        }
    }, [colorTheme]);

    // Apply Font Theme
    useEffect(() => {
        const root = document.body; // Apply to body to override defaults
        // Reset fonts
        root.classList.remove('font-sans', 'font-serif', 'font-mono');

        if (fontTheme === 'serif') {
            root.classList.add('font-serif');
        } else if (fontTheme === 'mono') {
            root.classList.add('font-mono');
        } else {
            root.classList.add('font-sans'); // Default
        }
    }, [fontTheme]);

    // Circadian Logic
    useEffect(() => {
        if (!circadianMode) return;

        const checkTime = () => {
            const hour = new Date().getHours();

            // Morning (6-11): Light mode, maybe orange for sunrise?
            // Day (11-17): Light mode, user's choice or stone
            // Evening (17-20): Dark mode, Orange (Sunset)
            // Night (20+): Dark mode, Rose (Calm) or Blue (Deep)

            // Simplification:
            // 6-18: Light
            // 18-6: Dark

            // Also adjust Color Theme if in Circadian Mode? 
            // Let's settle on: Auto Light/Dark + Warmth at night.

            const isDay = hour >= 6 && hour < 18;
            setTheme(isDay ? 'light' : 'dark');

            if (hour >= 18 || hour < 6) {
                // At night, prefer warmer colors if not already set manually recently? 
                // Currently just enforcing light/dark is safer to avoid overriding user manual pick constantly.
                // Let's just do Light/Dark sync for now.
            }
        };

        checkTime();
        const interval = setInterval(checkTime, 60000 * 5); // Check every 5 mins
        return () => clearInterval(interval);
    }, [circadianMode, setTheme]);

    return null;
}
