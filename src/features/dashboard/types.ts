export const JOB_STATUSES = ["NEW", "ASSIGNED", "TRANSCRIBED", "REVIEWED", "COMPLETED"] as const;
export const JOB_LOCATION_TYPES = ["PHYSICAL", "REMOTE"] as const;
export const USER_ROLES = ["REPORTER", "EDITOR"] as const;

export type JobStatus = (typeof JOB_STATUSES)[number];
export type JobLocationType = (typeof JOB_LOCATION_TYPES)[number];
export type UserRole = (typeof USER_ROLES)[number];

export interface UserRecord {
    id: string;
    name: string;
    role: UserRole;
    city: string | null;
    isAvailable: boolean;
}

export interface JobRecord {
    id: string;
    caseName: string;
    durationMinutes: number;
    locationType: JobLocationType;
    city: string | null;
    status: JobStatus;
    reporterId: string | null;
    editorId: string | null;
    createdAt: string;
    reporter?: UserRecord | null;
    editor?: UserRecord | null;
}

export interface JobPayment {
    jobId: string;
    reporterPayout: number;
    editorPayout: number;
    totalCost: number;
}

export interface HealthStatus {
    message: string;
}

export interface CreateJobPayload {
    caseName: string;
    durationMinutes: number;
    locationType: JobLocationType;
    city?: string | null;
    status?: Extract<JobStatus, "NEW" | "ASSIGNED">;
    reporterId?: string | null;
    editorId?: string | null;
}

export interface CreateUserPayload {
    name: string;
    role: UserRole;
    city?: string | null;
    isAvailable?: boolean;
}

export interface AssignJobPayload {
    user_id: string;
    role_type: UserRole;
}

export interface DashboardMetrics {
    activeJobs: number;
    awaitingReporter: number;
    awaitingEditor: number;
    completedJobs: number;
}

export interface DashboardFilters {
    searchTerm: string;
    status: "ALL" | JobStatus;
    locationType: "ALL" | JobLocationType;
}
