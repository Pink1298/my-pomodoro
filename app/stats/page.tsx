import { StatsCards } from "@/components/stats/stats-cards";
import { DailyChart } from "@/components/stats/daily-chart";
import { ProjectDistributionChart } from "@/components/stats/project-chart";
import { FocusGanttChart } from "@/components/stats/focus-gantt-chart";
import { TaskCompletionChart } from "@/components/stats/task-completion-chart";
import { MockDataButton } from "@/components/stats/mock-data-button";
import { RecentActivity } from "@/components/stats/recent-activity";

import { WeeklyReview } from "@/components/stats/weekly-review";

export default function StatsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Statistics</h2>
                    <p className="text-muted-foreground">Track your productivity trends and habits.</p>
                </div>
                {/* <MockDataButton /> */}
            </div>

            <StatsCards />
            <WeeklyReview />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <DailyChart />
                <ProjectDistributionChart />
            </div>

            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
                <FocusGanttChart />
            </div>

            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
                <TaskCompletionChart />
            </div>

            <RecentActivity />
        </div>
    );
}
