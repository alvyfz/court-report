import type {
    AssignJobPayload,
    CreateJobPayload,
    CreateUserPayload,
    HealthStatus,
    JobPayment,
    JobRecord,
    JobStatus,
    UserRecord,
    UserRole,
} from "@/features/dashboard/types";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");

interface ApiEnvelope<T> {
    message: string;
    data: T;
    total?: number;
    details?: unknown;
}

interface ApiErrorPayload {
    message?: string;
    details?: unknown;
}

export class ApiError extends Error {
    status: number;
    details?: unknown;

    constructor(message: string, status: number, details?: unknown) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.details = details;
    }
}

const readJsonSafely = async <T>(response: Response): Promise<T | null> => {
    const text = await response.text();
    if (!text) {
        return null;
    }

    return JSON.parse(text) as T;
};

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
    let response: Response;

    try {
        response = await fetch(`${API_BASE_URL}${path}`, {
            headers: {
                "Content-Type": "application/json",
                ...(init?.headers ?? {}),
            },
            ...init,
        });
    } catch (error) {
        throw new ApiError(error instanceof Error ? error.message : "Network request failed", 0);
    }

    const payload = await readJsonSafely<ApiEnvelope<T> | ApiErrorPayload>(response);

    if (!response.ok) {
        const message = payload && "message" in payload && payload.message ? payload.message : "Unexpected API error";
        const details = payload && "details" in payload ? payload.details : undefined;
        throw new ApiError(message, response.status, details);
    }

    if (!payload || !("data" in payload)) {
        throw new ApiError("API returned an invalid response", response.status);
    }

    return payload.data;
};

const searchParamsFromEntries = (entries: Record<string, string | undefined>) => {
    const params = new URLSearchParams();

    Object.entries(entries).forEach(([key, value]) => {
        if (value) {
            params.set(key, value);
        }
    });

    const queryString = params.toString();
    return queryString ? `?${queryString}` : "";
};

export const dashboardApi = {
    apiBaseUrl: API_BASE_URL,

    async getHealth(): Promise<HealthStatus> {
        let response: Response;

        try {
            response = await fetch(`${API_BASE_URL}/api/health`);
        } catch (error) {
            throw new ApiError(error instanceof Error ? error.message : "Network request failed", 0);
        }

        if (!response.ok) {
            throw new ApiError("Unable to reach API health endpoint", response.status);
        }

        return (await response.json()) as HealthStatus;
    },

    async listJobs(status?: JobStatus): Promise<JobRecord[]> {
        const queryString = searchParamsFromEntries({
            status,
        });

        return request<JobRecord[]>(`/api/jobs${queryString}`);
    },

    async createJob(payload: CreateJobPayload): Promise<JobRecord> {
        return request<JobRecord>("/api/jobs", {
            method: "POST",
            body: JSON.stringify(payload),
        });
    },

    async updateJobStatus(id: string, status: JobStatus): Promise<JobRecord> {
        return request<JobRecord>(`/api/jobs/${id}/status`, {
            method: "PATCH",
            body: JSON.stringify({ status }),
        });
    },

    async assignJob(id: string, payload: AssignJobPayload): Promise<JobRecord> {
        return request<JobRecord>(`/api/jobs/${id}/assign`, {
            method: "POST",
            body: JSON.stringify(payload),
        });
    },

    async getJobPayment(id: string): Promise<JobPayment> {
        const payment = await request<{
            job_id: string;
            reporter_payout: number;
            editor_payout: number;
            total_cost: number;
        }>(`/api/jobs/${id}/payment`);

        return {
            jobId: payment.job_id,
            reporterPayout: payment.reporter_payout,
            editorPayout: payment.editor_payout,
            totalCost: payment.total_cost,
        };
    },

    async listUsers(params?: { role?: UserRole; available?: boolean; jobId?: string }): Promise<UserRecord[]> {
        const queryString = searchParamsFromEntries({
            role: params?.role,
            available: typeof params?.available === "boolean" ? String(params.available) : undefined,
            job_id: params?.jobId,
        });

        return request<UserRecord[]>(`/api/users${queryString}`);
    },

    async createUser(payload: CreateUserPayload): Promise<UserRecord> {
        return request<UserRecord>("/api/users", {
            method: "POST",
            body: JSON.stringify(payload),
        });
    },
};
