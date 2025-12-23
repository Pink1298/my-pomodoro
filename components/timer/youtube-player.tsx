"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Youtube, Link as LinkIcon, ListMusic, Play, Eye, EyeOff } from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const PRESETS = [
    { name: "Lofi Girl - Beats to Study/Relax", id: "jfKfPfyJRdk", type: "video" },
    { name: "Relaxing Jazz Piano", id: "Dx5qFachd3A", type: "video" },
    { name: "Synthwave Radio", id: "4xDzrJKXOOY", type: "video" },
    { name: "Rainy Jazz Cafe", id: "NJuSStkIZBg", type: "video" },
    { name: "Ambient Space Music", id: "QOzC_AbsPlw", type: "video" },
];

export function YouTubePlayer() {
    const [videoId, setVideoId] = useState("jfKfPfyJRdk"); // Default to Lofi Girl
    const [inputValue, setInputValue] = useState("");
    const [isLinkPopoverOpen, setIsLinkPopoverOpen] = useState(false);
    const [isVideoVisible, setIsVideoVisible] = useState(true);

    // Load from local storage
    useEffect(() => {
        const savedId = localStorage.getItem("youtube-player-id");
        if (savedId) setVideoId(savedId);
    }, []);

    const extractVideoId = (url: string) => {
        try {
            // Handle standard URLs: youtube.com/watch?v=VIDEO_ID
            // Handle short URLs: yesutu.be/VIDEO_ID
            // Handle embed URLs: youtube.com/embed/VIDEO_ID

            const urlObj = new URL(url);
            let id = null;

            if (urlObj.hostname.includes("youtube.com")) {
                if (urlObj.pathname.includes("/embed/")) {
                    id = urlObj.pathname.split("/embed/")[1];
                } else {
                    id = urlObj.searchParams.get("v");
                }
            } else if (urlObj.hostname.includes("youtu.be")) {
                id = urlObj.pathname.slice(1);
            }

            return id;
        } catch (e) {
            return null;
        }
    };

    const handleUpdate = () => {
        if (!inputValue.trim()) return;

        const id = extractVideoId(inputValue);
        if (id) {
            setVideoId(id);
            localStorage.setItem("youtube-player-id", id);
            setInputValue("");
            setIsLinkPopoverOpen(false);
        } else {
            alert("Invalid YouTube URL. Please use a link like: https://www.youtube.com/watch?v=...");
        }
    };

    const handlePresetSelect = (id: string) => {
        setVideoId(id);
        localStorage.setItem("youtube-player-id", id);
        // Logic to maybe randomize start time could go here, but not needed for live streams
    };

    return (
        <div className="w-full max-w-sm mx-auto bg-background/50 backdrop-blur-sm rounded-xl border shadow-sm overflow-hidden transition-all duration-300">
            {/* Header / Controls */}
            <div className="flex items-center justify-between px-3 py-2 bg-secondary/30 border-b">
                <div className="flex items-center gap-2">
                    <Youtube className="h-4 w-4 text-red-500" />
                    <span className="text-xs font-medium">YouTube Focus</span>
                </div>

                <div className="flex items-center gap-1">
                    {/* Visibility Toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        title={isVideoVisible ? "Hide Video" : "Show Video"}
                        onClick={() => setIsVideoVisible(!isVideoVisible)}
                    >
                        {isVideoVisible ? (
                            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                        ) : (
                            <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                    </Button>

                    {/* Presets Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6" title="Presets">
                                <ListMusic className="h-3.5 w-3.5 text-muted-foreground" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {PRESETS.map((preset) => (
                                <DropdownMenuItem key={preset.id} onClick={() => handlePresetSelect(preset.id)}>
                                    <Play className="mr-2 h-3.5 w-3.5" />
                                    {preset.name}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Custom Link Popover */}
                    <Popover open={isLinkPopoverOpen} onOpenChange={setIsLinkPopoverOpen}>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6" title="Paste Link">
                                <LinkIcon className="h-3.5 w-3.5 text-muted-foreground" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-3" align="end">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Paste YouTube Link..."
                                    className="h-8 text-xs"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    // Extract ID immediately if pasted? No, wait for Enter/Click
                                    onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
                                />
                                <Button size="sm" className="h-8 px-3" onClick={handleUpdate}>
                                    Play
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            {/* Iframe Player */}
            <div className={`relative w-full transition-all duration-300 ease-in-out ${isVideoVisible ? "h-[180px]" : "h-0"}`}>
                <iframe
                    src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=0&modestbranding=1&controls=1&rel=0`}
                    title="YouTube video player"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="absolute top-0 left-0 w-full h-full"
                ></iframe>
            </div>
        </div>
    );
}
