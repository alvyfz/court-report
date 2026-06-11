import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "@/components/application/toast/toast-provider";
import { ApiError, dashboardApi } from "@/features/dashboard/api/dashboard-api";
import type { CreateJobPayload, CreateUserPayload, DashboardFilters, HealthStatus, JobPayment, JobRecord, UserRecord } from "@/features/dashboard/types";
import { filterJobs, getDashboardMetrics, getNextStatus } from "@/features/dashboard/utils";

type HealthState = "checking" | "online" | "offline";

const DEFAULT_FILTERS: DashboardFilters = {
    searchTerm: "",
    status: "ALL",
    locationType: "ALL",
};

const getErrorDescription = (error: unknown) => {
    if (!(error instanceof ApiError)) {
        return error instanceof Error ? error.message : "Unexpected error";
    }

    if (error.status === 0) {
        return "Check your network connection or the dashboard API URL.";
    }

    if (!error.details || typeof error.details !== "object") {
        return error.message;
    }

    const details = error.details as {
        formErrors?: string[];
        fieldErrors?: Record<string, string[] | undefined>;
    };

    const fieldMessages = Object.entries(details.fieldErrors ?? {})
        .flatMap(([field, messages]) => (messages ?? []).map((message) => `${field}: ${message}`))
        .slice(0, 3);
    const formMessages = (details.formErrors ?? []).slice(0, 2);
    const combined = [...formMessages, ...fieldMessages].filter(Boolean);

    return combined.length > 0 ? combined.join(" | ") : error.message;
};

export const useDashboardData = () => {
    const toast = useToast();
    const [filters, setFilters] = useState<DashboardFilters>(DEFAULT_FILTERS);
    const [healthState, setHealthState] = useState<HealthState>("checking");
    const [health, setHealth] = useState<HealthStatus | null>(null);
    const [allJobs, setAllJobs] = useState<JobRecord[]>([]);
    const [jobs, setJobs] = useState<JobRecord[]>([]);
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
    const [payment, setPayment] = useState<JobPayment | null>(null);
    const [reporterCandidates, setReporterCandidates] = useState<UserRecord[]>([]);
    const [editorCandidates, setEditorCandidates] = useState<UserRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const refreshJobs = useCallback(
        async (preferredJobId?: string | null) => {
            const selectedStatus = filters.status === "ALL" ? undefined : filters.status;
            const allJobsPromise = dashboardApi.listJobs();
            const currentJobsPromise = selectedStatus ? dashboardApi.listJobs(selectedStatus) : allJobsPromise;
            const [allJobsResponse, jobsResponse] = await Promise.all([allJobsPromise, currentJobsPromise]);

            setAllJobs(allJobsResponse);
            setJobs(jobsResponse);

            const nextSelectedJobId =
                preferredJobId && jobsResponse.some((job) => job.id === preferredJobId)
                    ? preferredJobId
                    : selectedJobId && jobsResponse.some((job) => job.id === selectedJobId)
                      ? selectedJobId
                      : (jobsResponse[0]?.id ?? null);

            setSelectedJobId(nextSelectedJobId);
        },
        [filters.status, selectedJobId],
    );

    useEffect(() => {
        let isMounted = true;

        const loadHealth = async () => {
            try {
                const response = await dashboardApi.getHealth();
                if (!isMounted) {
                    return;
                }

                setHealth(response);
                setHealthState("online");
            } catch {
                if (!isMounted) {
                    return;
                }

                setHealthState("offline");
                toast.error("Dashboard API is unreachable", "Check the backend connection or VITE_API_BASE_URL configuration.");
            }
        };

        void loadHealth();

        return () => {
            isMounted = false;
        };
    }, [toast]);

    useEffect(() => {
        let isMounted = true;

        const loadJobs = async () => {
            try {
                setIsLoading(true);
                await refreshJobs();
            } catch (error) {
                if (isMounted) {
                    toast.error("Failed to load job list", getErrorDescription(error));
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        void loadJobs();

        return () => {
            isMounted = false;
        };
    }, [refreshJobs]);

    const visibleJobs = useMemo(() => filterJobs(jobs, filters), [filters, jobs]);

    const selectedJob = useMemo(() => visibleJobs.find((job) => job.id === selectedJobId) ?? visibleJobs[0] ?? null, [selectedJobId, visibleJobs]);

    useEffect(() => {
        if (!selectedJob && selectedJobId !== null) {
            setSelectedJobId(null);
            return;
        }

        if (selectedJob && selectedJob.id !== selectedJobId) {
            setSelectedJobId(selectedJob.id);
        }
    }, [selectedJob, selectedJobId]);

    useEffect(() => {
        let isMounted = true;

        const loadSelectedJobDetails = async () => {
            if (!selectedJob) {
                setPayment(null);
                setReporterCandidates([]);
                setEditorCandidates([]);
                return;
            }

            try {
                setIsLoadingDetails(true);
                const [paymentResponse, reportersResponse, editorsResponse] = await Promise.all([
                    dashboardApi.getJobPayment(selectedJob.id),
                    dashboardApi.listUsers({
                        role: "REPORTER",
                        available: true,
                        jobId: selectedJob.id,
                    }),
                    dashboardApi.listUsers({
                        role: "EDITOR",
                        available: true,
                    }),
                ]);

                if (!isMounted) {
                    return;
                }

                setPayment(paymentResponse);
                setReporterCandidates(reportersResponse);
                setEditorCandidates(editorsResponse);
            } catch (error) {
                if (isMounted) {
                    toast.error("Failed to load job details", getErrorDescription(error));
                }
            } finally {
                if (isMounted) {
                    setIsLoadingDetails(false);
                }
            }
        };

        void loadSelectedJobDetails();

        return () => {
            isMounted = false;
        };
    }, [selectedJob]);

    const metrics = useMemo(() => getDashboardMetrics(allJobs), [allJobs]);

    const reload = useCallback(
        async (preferredJobId?: string | null) => {
            try {
                setIsRefreshing(true);
                await refreshJobs(preferredJobId);
            } catch (error) {
                toast.error("Failed to refresh data", getErrorDescription(error));
            } finally {
                setIsRefreshing(false);
            }
        },
        [refreshJobs, toast],
    );

    const createJob = useCallback(
        async (payload: CreateJobPayload) => {
            try {
                setIsSubmitting(true);
                const createdJob = await dashboardApi.createJob(payload);
                toast.success("Job created", createdJob.caseName);
                await reload(createdJob.id);
                return true;
            } catch (error) {
                toast.error("Failed to create job", getErrorDescription(error));
                return false;
            } finally {
                setIsSubmitting(false);
            }
        },
        [reload, toast],
    );

    const createUser = useCallback(
        async (payload: CreateUserPayload) => {
            try {
                setIsSubmitting(true);
                const createdUser = await dashboardApi.createUser(payload);
                toast.success("Personnel created", createdUser.name);

                if (selectedJob) {
                    const [nextReporters, nextEditors] = await Promise.all([
                        dashboardApi.listUsers({
                            role: "REPORTER",
                            available: true,
                            jobId: selectedJob.id,
                        }),
                        dashboardApi.listUsers({
                            role: "EDITOR",
                            available: true,
                        }),
                    ]);

                    setReporterCandidates(nextReporters);
                    setEditorCandidates(nextEditors);
                }

                return true;
            } catch (error) {
                toast.error("Failed to create personnel", getErrorDescription(error));
                return false;
            } finally {
                setIsSubmitting(false);
            }
        },
        [selectedJob, toast],
    );

    const assignUser = useCallback(
        async (roleType: "REPORTER" | "EDITOR", userId: string) => {
            if (!selectedJob) {
                return false;
            }

            try {
                setIsSubmitting(true);
                const updatedJob = await dashboardApi.assignJob(selectedJob.id, {
                    user_id: userId,
                    role_type: roleType,
                });
                toast.success(`${roleType === "REPORTER" ? "Reporter" : "Editor"} assigned`, updatedJob.caseName);
                await reload(updatedJob.id);
                return true;
            } catch (error) {
                toast.error("Failed to assign personnel", getErrorDescription(error));
                return false;
            } finally {
                setIsSubmitting(false);
            }
        },
        [reload, selectedJob, toast],
    );

    const advanceJobStatus = useCallback(async () => {
        if (!selectedJob) {
            return false;
        }

        const nextStatus = getNextStatus(selectedJob.status);
        if (!nextStatus) {
            return false;
        }

        try {
            setIsSubmitting(true);
            const updatedJob = await dashboardApi.updateJobStatus(selectedJob.id, nextStatus);
            toast.success("Job status updated", `${updatedJob.caseName} -> ${nextStatus}`);
            await reload(updatedJob.id);
            return true;
        } catch (error) {
            toast.error("Failed to update job status", getErrorDescription(error));
            return false;
        } finally {
            setIsSubmitting(false);
        }
    }, [reload, selectedJob, toast]);

    return {
        apiBaseUrl: dashboardApi.apiBaseUrl,
        filters,
        setFilters,
        health,
        healthState,
        jobs: visibleJobs,
        allJobs,
        metrics,
        selectedJob,
        selectedJobId,
        setSelectedJobId,
        payment,
        reporterCandidates,
        editorCandidates,
        isLoading,
        isRefreshing,
        isLoadingDetails,
        isSubmitting,
        reload,
        createJob,
        createUser,
        assignUser,
        advanceJobStatus,
    };
};
