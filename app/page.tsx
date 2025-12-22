import { TimerView } from "@/components/timer/timer-view";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <TimerView />
    </div>
  );
}
