import type { ComponentType } from "react";
import { Briefcase01, CheckCircle, Clock, User01 } from "@untitledui/icons";
import type { DashboardMetrics } from "@/features/dashboard/types";

interface JobsOverviewMetricsProps {
    metrics: DashboardMetrics;
}

const cards: Array<{
    key: keyof DashboardMetrics;
    label: string;
    icon: ComponentType<{ className?: string }>;
    iconClassName: string;
}> = [
    {
        key: "activeJobs",
        label: "Active Jobs",
        icon: Briefcase01,
        iconClassName: "text-[#2563eb]",
    },
    {
        key: "awaitingReporter",
        label: "Awaiting Reporter",
        icon: User01,
        iconClassName: "text-[#7c3aed]",
    },
    {
        key: "awaitingEditor",
        label: "Awaiting Editor",
        icon: Clock,
        iconClassName: "text-[#bc4800]",
    },
    {
        key: "completedJobs",
        label: "Completed Jobs",
        icon: CheckCircle,
        iconClassName: "text-[#15803d]",
    },
];

export const JobsOverviewMetrics = ({ metrics }: JobsOverviewMetricsProps) => {
    return (
        <div className="grid gap-4 xl:grid-cols-4">
            {cards.map(({ key, label, icon: Icon, iconClassName }) => (
                <article key={key} className="rounded-[12px] border border-[#c3c6d7] bg-white p-6 shadow-[0_2px_6px_rgba(15,23,42,0.04)]">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-[#434655]">{label}</p>
                        <Icon className={`size-5 ${iconClassName}`} />
                    </div>
                    <p className="mt-4 text-4xl font-bold tracking-[-0.02em] text-[#191b23]">{metrics[key]}</p>
                </article>
            ))}
        </div>
    );
};
