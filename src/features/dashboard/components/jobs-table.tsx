import { ChevronRight, Clock, SearchLg } from "@untitledui/icons";
import type { JobRecord } from "@/features/dashboard/types";
import { formatCreatedDate, formatDuration, formatJobCode, formatLocation } from "@/features/dashboard/utils";
import { StatusBadge } from "./status-badge";

interface JobsTableProps {
    jobs: JobRecord[];
    selectedJobId: string | null;
    isRefreshing: boolean;
    onSelect: (jobId: string) => void;
}

export const JobsTable = ({ jobs, selectedJobId, isRefreshing, onSelect }: JobsTableProps) => {
    if (jobs.length === 0) {
        return (
            <div className="rounded-[12px] border border-[#c3c6d7] bg-white p-10 text-center shadow-[0_2px_6px_rgba(15,23,42,0.04)]">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#dbe1ff] text-[#004ac6]">
                    <SearchLg className="size-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-[#191b23]">No jobs match the current filters</h3>
                <p className="mt-2 text-sm text-[#434655]">Coba ubah filter status, lokasi, atau kata kunci pencarian.</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-[12px] border border-[#c3c6d7] bg-white shadow-[0_2px_6px_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between border-b border-[#e1e2ed] bg-[#f3f3fe] px-6 py-4">
                <div>
                    <h3 className="text-lg font-semibold text-[#191b23]">Job Pipeline</h3>
                    <p className="text-sm text-[#434655]">Memuat {jobs.length} job dari backend.</p>
                </div>
                {isRefreshing ? <span className="text-sm text-[#004ac6]">Refreshing...</span> : null}
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                    <thead>
                        <tr className="border-b border-[#e1e2ed] bg-[#faf8ff] text-left">
                            {["Job ID", "Case Name", "Duration", "Location", "Status", "Personnel", "Created", "Details"].map((label) => (
                                <th key={label} className="px-6 py-3 text-xs font-semibold tracking-[0.05em] text-[#737686] uppercase">
                                    {label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {jobs.map((job) => {
                            const isSelected = job.id === selectedJobId;

                            return (
                                <tr
                                    key={job.id}
                                    className={`border-b border-[#e1e2ed] transition last:border-b-0 ${isSelected ? "bg-[#f3f6ff]" : "hover:bg-[#faf8ff]"}`}
                                >
                                    <td className="px-6 py-4 font-mono text-sm text-[#434655]">{formatJobCode(job.id)}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-[#191b23]">{job.caseName}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-[#434655]">{formatDuration(job.durationMinutes)}</td>
                                    <td className="px-6 py-4 text-sm text-[#434655]">{formatLocation(job)}</td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={job.status} />
                                    </td>
                                    <td className="px-6 py-4 text-sm text-[#434655]">
                                        <div>R: {job.reporter?.name ?? "Pending"}</div>
                                        <div>E: {job.editor?.name ?? "Pending"}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-[#434655]">
                                        <div className="inline-flex items-center gap-2">
                                            <Clock className="size-4 text-[#737686]" />
                                            <span>{formatCreatedDate(job.createdAt)}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            type="button"
                                            onClick={() => onSelect(job.id)}
                                            className="inline-flex items-center gap-1 rounded-lg border border-[#c3c6d7] px-3 py-2 text-sm font-semibold text-[#004ac6] transition hover:bg-[#dbe1ff]"
                                        >
                                            View
                                            <ChevronRight className="size-4" />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
