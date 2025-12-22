"use client";

import { useEffect, useRef, useState } from "react";
import { useTimerStore } from "@/lib/store";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Waves, CloudRain, Coffee, Trees } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type NoiseType = 'white' | 'pink' | 'brown' | 'rain' | 'forest' | 'cafe';

export function WhiteNoisePlayer() {
    const { isRunning, mode } = useTimerStore();
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.5);
    const [noiseType, setNoiseType] = useState<NoiseType>('rain');

    // Audio Context Refs
    const audioCtxRef = useRef<AudioContext | null>(null);
    const noiseNodeRef = useRef<AudioBufferSourceNode | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);

    // Initialize Audio Context
    useEffect(() => {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
            audioCtxRef.current = new AudioContext();
            gainNodeRef.current = audioCtxRef.current.createGain();
            gainNodeRef.current.connect(audioCtxRef.current.destination);
            gainNodeRef.current.gain.value = volume;
        }

        return () => {
            audioCtxRef.current?.close();
        };
    }, []);

    const createNoiseBuffer = () => {
        if (!audioCtxRef.current) return null;

        const bufferSize = audioCtxRef.current.sampleRate * 2;
        const buffer = audioCtxRef.current.createBuffer(1, bufferSize, audioCtxRef.current.sampleRate);
        const data = buffer.getChannelData(0);
        let lastOut = 0;

        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;

            if (noiseType === 'white') {
                data[i] = white;
            } else if (noiseType === 'pink' || noiseType === 'brown') {
                // Simple 1/f filter for basic colored noise
                const alpha = noiseType === 'pink' ? 0.02 : 0.1;
                data[i] = (lastOut + (alpha * white)) / (1 + alpha);
                lastOut = data[i];
                data[i] *= 3.5;
            } else if (noiseType === 'rain') {
                // Rain simulation: White noise with low-pass and random amplitude modulation
                // This is a very rough approximation using random math
                data[i] = (Math.random() * 2 - 1) * 0.1;
                if (Math.random() > 0.98) data[i] += (Math.random() * 0.5); // Droplets
            } else if (noiseType === 'forest') {
                // Forest: High filtered noise + occasional chirps (hard to synth purely, using low level mix)
                data[i] = (lastOut + (0.05 * white)) / 1.05;
                lastOut = data[i];
                data[i] *= 0.5;
            } else {
                // Cafe: Abstract low rumble (Brown) + bursts (Clatter)
                const rumble = (lastOut + (0.1 * white)) / 1.1;
                lastOut = rumble;
                data[i] = rumble * 2;
                if (Math.random() > 0.999) data[i] += 0.5; // Dishes
            }
        }
        return buffer;
    };

    // Variables for noise generation logic above needs state/context if complex, 
    // but for buffer filling it's sync. 

    // ... Play/Stop Logic same as before ... 
    const playNoise = () => {
        if (!audioCtxRef.current || !gainNodeRef.current) return;
        if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
        if (noiseNodeRef.current) {
            try { noiseNodeRef.current.stop(); } catch (e) { }
        }

        const buffer = createNoiseBuffer();
        if (!buffer) return;

        const noise = audioCtxRef.current.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;
        noise.connect(gainNodeRef.current);
        noise.start();
        noiseNodeRef.current = noise;
        setIsPlaying(true);
    };

    const stopNoise = () => {
        if (noiseNodeRef.current) {
            try { noiseNodeRef.current.stop(); } catch (e) { }
            noiseNodeRef.current = null;
        }
        setIsPlaying(false);
    };

    const togglePlay = () => {
        if (isPlaying) stopNoise();
        else playNoise();
    };

    useEffect(() => {
        if (gainNodeRef.current) gainNodeRef.current.gain.value = volume * 0.5;
    }, [volume]);

    useEffect(() => {
        if (isPlaying) playNoise();
    }, [noiseType]);

    const getIcon = () => {
        switch (noiseType) {
            case 'rain': return <CloudRain className="h-4 w-4" />;
            case 'forest': return <Trees className="h-4 w-4" />;
            case 'cafe': return <Coffee className="h-4 w-4" />;
            default: return <Waves className="h-4 w-4" />;
        }
    }

    return (
        <div className="flex items-center space-x-2 bg-secondary/20 p-2 rounded-full px-4 backdrop-blur-sm shadow-sm transition-all hover:bg-secondary/30">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                        {getIcon()}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => setNoiseType('white')}>White Noise</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setNoiseType('pink')}>Pink Noise</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setNoiseType('brown')}>Brown Noise</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setNoiseType('rain')}>Rain (Synthesized)</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setNoiseType('forest')}>Forest (Synthesized)</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setNoiseType('cafe')}>Cafe (Synthesized)</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={togglePlay}>
                {isPlaying ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>

            <div className="w-24 px-2">
                <Slider
                    value={[volume]}
                    max={1}
                    step={0.01}
                    onValueChange={(vals) => setVolume(vals[0])}
                    className="cursor-pointer"
                />
            </div>
        </div>
    );
}
