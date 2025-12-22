"use client";

import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Zap, Palette, Moon } from "lucide-react";

export function WelcomeModal() {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState(0);

    useEffect(() => {
        const hasSeenOnboarding = localStorage.getItem("has-seen-onboarding");
        if (!hasSeenOnboarding) {
            setOpen(true);
        }
    }, []);

    const handleFinish = () => {
        localStorage.setItem("has-seen-onboarding", "true");
        setOpen(false);
    };

    const steps = [
        {
            title: "Welcome to Pomodoro Focus",
            description: "A calm, aesthetic timer designed to help you strictly focus on what matters.",
            icon: <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl">🍅</div>
        },
        {
            title: "Smart Adjustments",
            description: "We'll suggest tasks based on your energy levels (⚡) and the time of day.",
            icon: <Zap className="h-12 w-12 text-yellow-500" />
        },
        {
            title: "Make it Yours",
            description: "Customize themes (Rose, Blue, Stone...) and fonts to match your vibe in Settings.",
            icon: <Palette className="h-12 w-12 text-rose-500" />
        },
        {
            title: "Stay Consistent",
            description: "Track your streaks and daily focus intentions to build a lasting habit.",
            icon: <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 text-2xl">🔥</div>
        }
    ];

    const currentStep = steps[step];

    return (
        <Dialog open={open} onOpenChange={handleFinish}>
            <DialogContent className="sm:max-w-[425px] text-center">
                <DialogHeader className="flex flex-col items-center space-y-4 pt-4">
                    {currentStep.icon}
                    <DialogTitle className="text-2xl">{currentStep.title}</DialogTitle>
                    <DialogDescription className="text-lg">
                        {currentStep.description}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="sm:justify-center pt-4">
                    <div className="flex gap-2 w-full justify-center">
                        {step < steps.length - 1 ? (
                            <Button onClick={() => setStep(step + 1)} className="w-full">
                                Next <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        ) : (
                            <Button onClick={handleFinish} className="w-full">
                                Get Started <Check className="ml-2 h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </DialogFooter>
                <div className="flex justify-center gap-1 mt-2">
                    {steps.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1.5 w-1.5 rounded-full transition-all ${i === step ? "bg-primary w-4" : "bg-muted"
                                }`}
                        />
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
