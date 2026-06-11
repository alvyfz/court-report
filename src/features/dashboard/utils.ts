import type { DashboardFilters, DashboardMetrics, JobLocationType, JobRecord, JobStatus, UserRole } from "@/features/dashboard/types";

export const STATUS_LABELS: Record<JobStatus, string> = {
    NEW: "New",
    ASSIGNED: "Assigned",
    TRANSCRIBED: "Transcribed",
    REVIEWED: "Reviewed",
    COMPLETED: "Completed",
};

export const ROLE_LABELS: Record<UserRole, string> = {
    REPORTER: "Reporter",
    EDITOR: "Editor",
};

export const LOCATION_LABELS: Record<JobLocationType, string> = {
    PHYSICAL: "On-site",
    REMOTE: "Remote",
};

export const STATUS_STYLES: Record<JobStatus, string> = {
    NEW: "bg-slate-100 text-slate-700 ring-slate-200",
    ASSIGNED: "bg-blue-50 text-blue-700 ring-blue-200",
    TRANSCRIBED: "bg-orange-50 text-orange-700 ring-orange-200",
    REVIEWED: "bg-purple-50 text-purple-700 ring-purple-200",
    COMPLETED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

export const STATUS_SEQUENCE: JobStatus[] = ["NEW", "ASSIGNED", "TRANSCRIBED", "REVIEWED", "COMPLETED"];

export const getNextStatus = (status: JobStatus): JobStatus | null => {
    const currentIndex = STATUS_SEQUENCE.indexOf(status);
    if (currentIndex === -1 || currentIndex === STATUS_SEQUENCE.length - 1) {
        return null;
    }

    return STATUS_SEQUENCE[currentIndex + 1];
};

export const formatCurrency = (value: number) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(value);

export const formatDuration = (minutes: number) => `${minutes} min`;

export const formatJobCode = (jobId: string) => `#JOB-${jobId.slice(0, 8).toUpperCase()}`;

export const formatLocation = (job: Pick<JobRecord, "locationType" | "city">) => {
    if (job.locationType === "REMOTE") {
        return "Remote";
    }

    return job.city ?? "On-site";
};

export const formatCreatedDate = (value: string) =>
    new Date(value).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

export const getDashboardMetrics = (jobs: JobRecord[]): DashboardMetrics => ({
    activeJobs: jobs.filter((job) => job.status !== "COMPLETED").length,
    awaitingReporter: jobs.filter((job) => !job.reporterId).length,
    awaitingEditor: jobs.filter((job) => job.reporterId && !job.editorId && job.status !== "COMPLETED").length,
    completedJobs: jobs.filter((job) => job.status === "COMPLETED").length,
});

export const filterJobs = (jobs: JobRecord[], filters: DashboardFilters) => {
    const normalizedSearch = filters.searchTerm.trim().toLowerCase();

    return jobs.filter((job) => {
        const matchesSearch =
            normalizedSearch.length === 0 ||
            job.caseName.toLowerCase().includes(normalizedSearch) ||
            job.id.toLowerCase().includes(normalizedSearch) ||
            formatLocation(job).toLowerCase().includes(normalizedSearch) ||
            job.reporter?.name.toLowerCase().includes(normalizedSearch) ||
            job.editor?.name.toLowerCase().includes(normalizedSearch);

        const matchesLocation = filters.locationType === "ALL" || job.locationType === filters.locationType;

        return matchesSearch && matchesLocation;
    });
};

export const isPhysicalJob = (locationType: JobLocationType) => locationType === "PHYSICAL";
