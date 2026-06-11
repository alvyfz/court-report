import { Suspense, lazy, useState } from "react";
import { Bell01, HelpCircle, Plus, RefreshCcw02, SearchLg, Settings01 } from "@untitledui/icons";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { NativeSelect } from "@/components/base/select/select-native";
import { useDashboardData } from "@/features/dashboard/hooks/use-dashboard-data";
import { JobDetailPanel } from "./job-detail-panel";
import { JobsOverviewMetrics } from "./jobs-overview-metrics";
import { JobsTable } from "./jobs-table";

const CreateJobModal = lazy(() => import("./create-job-modal"));
const CreateUserModal = lazy(() => import("./create-user-modal"));

export const DashboardShell = () => {
    const [isCreateJobOpen, setIsCreateJobOpen] = useState(false);
    const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);

    const {
        apiBaseUrl,
        filters,
        setFilters,
        health,
        healthState,
        jobs,
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
    } = useDashboardData();

    const healthToneClassName =
        healthState === "online"
            ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
            : healthState === "offline"
              ? "bg-red-50 text-red-700 ring-red-200"
              : "bg-slate-100 text-slate-700 ring-slate-200";

    return (
        <div className="min-h-screen bg-[#faf8ff] text-[#191b23]">
            <div className="mx-auto min-h-screen max-w-[1600px]">
                <header className="border-b border-[#c3c6d7] bg-white px-6 py-4">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex size-11 items-center justify-center rounded-xl bg-[#2563eb] text-white shadow-[0_8px_20px_rgba(37,99,235,0.22)]">
                                <span className="text-lg font-bold">L</span>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-[#004ac6]">LexFlow</h1>
                                <p className="text-sm text-[#434655]">Workflow Portal</p>
                            </div>
                            <Badge
                                color={healthState === "online" ? "success" : healthState === "offline" ? "error" : "gray"}
                                size="md"
                                type="color"
                                className="hidden md:inline-flex"
                            >
                                {healthState === "online" ? (health?.message ?? "API online") : healthState === "offline" ? "API offline" : "Checking API"}
                            </Badge>
                        </div>

                        <div>
                            <div className="w-full xl:max-w-md">
                                <Input
                                    aria-label="Search jobs"
                                    placeholder="Search jobs, cases, or personnel..."
                                    icon={SearchLg}
                                    value={filters.searchTerm}
                                    onChange={(value) =>
                                        setFilters((current) => ({
                                            ...current,
                                            searchTerm: value,
                                        }))
                                    }
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 self-end xl:self-auto">
                            <button type="button" className="rounded-full p-2 text-[#434655] transition hover:bg-[#f3f3fe] hover:text-[#004ac6]">
                                <Bell01 className="size-5" />
                            </button>
                            <button type="button" className="rounded-full p-2 text-[#434655] transition hover:bg-[#f3f3fe] hover:text-[#004ac6]">
                                <HelpCircle className="size-5" />
                            </button>
                            <button type="button" className="rounded-full p-2 text-[#434655] transition hover:bg-[#f3f3fe] hover:text-[#004ac6]">
                                <Settings01 className="size-5" />
                            </button>
                            <Button size="md" iconLeading={Plus} className="bg-[#004ac6] hover:bg-[#2563eb]" onClick={() => setIsCreateJobOpen(true)}>
                                Create New Job
                            </Button>
                        </div>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-[#737686]">
                        <span className={`inline-flex rounded-full px-3 py-1 font-semibold ring-1 ring-inset ${healthToneClassName}`}>
                            {healthState === "online" ? "Connected" : healthState === "offline" ? "Disconnected" : "Checking"}
                        </span>
                        <span className="break-all">{apiBaseUrl}</span>
                    </div>
                </header>

                <main className="space-y-6 px-6 py-6">
                    <section className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                        <div>
                            <p className="text-sm font-semibold tracking-[0.05em] text-[#004ac6] uppercase">Transcription Jobs</p>
                            <h2 className="mt-2 text-4xl font-bold tracking-[-0.02em] text-[#191b23]">Jobs Overview</h2>
                            <p className="mt-2 text-base text-[#434655]">
                                Dashboard operasional untuk memonitor workflow transcription dan assignment personel.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <Button color="secondary" size="md" iconLeading={RefreshCcw02} isDisabled={isRefreshing} onClick={() => void reload(selectedJobId)}>
                                Refresh Data
                            </Button>
                            <Button color="secondary" size="md" iconLeading={Plus} onClick={() => setIsCreateUserOpen(true)}>
                                Add Personnel
                            </Button>
                        </div>
                    </section>

                    <JobsOverviewMetrics metrics={metrics} />

                    <section className="grid gap-4 rounded-[12px] border border-[#c3c6d7] bg-white p-5 shadow-[0_2px_6px_rgba(15,23,42,0.04)] xl:grid-cols-[minmax(0,1fr)_220px_220px]">
                        <div>
                            <div className="text-sm font-semibold text-[#191b23]">API-backed filters</div>
                            <p className="mt-1 text-sm text-[#434655]">
                                Filter status memanggil query `GET /api/jobs?status=...`, sedangkan pencarian dan tipe lokasi diterapkan di frontend.
                            </p>
                        </div>
                        <NativeSelect
                            label="Status"
                            value={filters.status}
                            onChange={(event) =>
                                setFilters((current) => ({
                                    ...current,
                                    status: event.target.value as typeof current.status,
                                }))
                            }
                            options={[
                                { label: "All statuses", value: "ALL" },
                                { label: "New", value: "NEW" },
                                { label: "Assigned", value: "ASSIGNED" },
                                { label: "Transcribed", value: "TRANSCRIBED" },
                                { label: "Reviewed", value: "REVIEWED" },
                                { label: "Completed", value: "COMPLETED" },
                            ]}
                        />
                        <NativeSelect
                            label="Location"
                            value={filters.locationType}
                            onChange={(event) =>
                                setFilters((current) => ({
                                    ...current,
                                    locationType: event.target.value as typeof current.locationType,
                                }))
                            }
                            options={[
                                { label: "All locations", value: "ALL" },
                                { label: "On-site", value: "PHYSICAL" },
                                { label: "Remote", value: "REMOTE" },
                            ]}
                        />
                    </section>

                    <section className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_360px]">
                        <div>
                            {isLoading ? (
                                <div className="rounded-[12px] border border-[#c3c6d7] bg-white p-10 shadow-[0_2px_6px_rgba(15,23,42,0.04)]">
                                    <p className="text-sm text-[#434655]">Loading jobs from API...</p>
                                </div>
                            ) : (
                                <JobsTable jobs={jobs} selectedJobId={selectedJobId} isRefreshing={isRefreshing} onSelect={setSelectedJobId} />
                            )}
                        </div>

                        <JobDetailPanel
                            job={selectedJob}
                            payment={payment}
                            reporterCandidates={reporterCandidates}
                            editorCandidates={editorCandidates}
                            isLoadingDetails={isLoadingDetails}
                            isSubmitting={isSubmitting}
                            onAssignUser={assignUser}
                            onAdvanceStatus={advanceJobStatus}
                        />
                    </section>
                </main>
            </div>

            <Suspense fallback={null}>
                {isCreateJobOpen ? (
                    <CreateJobModal isOpen={isCreateJobOpen} isSubmitting={isSubmitting} onClose={() => setIsCreateJobOpen(false)} onSubmit={createJob} />
                ) : null}
                {isCreateUserOpen ? (
                    <CreateUserModal isOpen={isCreateUserOpen} isSubmitting={isSubmitting} onClose={() => setIsCreateUserOpen(false)} onSubmit={createUser} />
                ) : null}
            </Suspense>
        </div>
    );
};
