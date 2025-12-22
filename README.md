# Pomodoro Focus 🍅

A calm, aesthetic, and feature-rich Pomodoro timer built with Next.js, TypeScript, Tailwind CSS, and Shadcn UI.

## Features ✨

### Core Productivity
- **Smart Timer**: Context-aware greetings and task suggestions based on time of day and energy levels.
- **Customizable Intervals**: Set your preferred Pomodoro, Short Break, and Long Break durations.
- **Task Management**: Create tasks with priorities, estimated pomodoros, and energy levels (Low ⚡, Medium ⚡⚡, High ⚡⚡⚡).
- **Project Organization**: Color-coded projects to categorize your work.

### Focus & Ambience
- **Zen Mode**: Distraction-free full-screen mode to help you get in the zone.
- **Ambient Sounds**: High-quality White Noise, Rain, and Cafe sounds with adjustable volume.
- **Breathing Guide**: Integrated box breathing (4-4-4-4) or 4-7-8 guide during breaks.

### Personalization 🎨
- **Themes**: 5 curated themes (Stone, Focus Blue, Calm Rose, Nature Green, Sunrise Orange).
- **Typography**: Choose between Sans, Serif, and Mono fonts.
- **Circadian Mode**: Automatically switches between Light and Dark mode based on the time of day.
- **Visual Quotes**: Gentle motivational quotes to keep you inspired.

### Consistency & Analytics
- **Streaks**: Track your daily focus streaks (Leaf 🌱 -> Flame 🔥).
- **Daily Journal**: Set a daily intention and reflect on your progress.
- **Statistics**: View your focus distribution by project and tracking history.

## Getting Started

1.  **Clone the repository**
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Run the development server**:
    ```bash
    npm run dev
    ```
4.  **Open [http://localhost:3000](http://localhost:3000)**

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn UI (Radix Primitives)
- **State Management**: Zustand (Persisted to LocalStorage)
- **Icons**: Lucide React
- **Animation**: Tailwind Animate

## Local Storage

- **Cloud Sync**: Sign in with Google to sync your tasks, settings, and stats across devices (powered by Supabase).
- **Offline Capable**: Works flawlessly offline and syncs when connection is restored.

## Privacy & Storage (Architecture Refactor)

- **Cloud First**: Uses Supabase (PostgreSQL) as the single source of truth.
- **Secure Sync**: All data is strictly scoped to your User ID using Row Level Security (RLS).
- **Data Migration**: Automatically merges your local (guest) data when you sign in for the first time.
- **Offline Support**: Stores data locally for speed and syncs automatically when online.


## License

MIT
