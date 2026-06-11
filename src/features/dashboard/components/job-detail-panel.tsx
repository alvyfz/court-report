import { useMemo, useState } from "react";
import { AlertCircle, CheckCircle, LayersTwo01, User01 } from "@untitledui/icons";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { NativeSelect } from "@/components/base/select/select-native";
import type { JobPayment, JobRecord, UserRecord } from "@/features/dashboard/types";
import { formatCurrency, formatDuration, formatJobCode, formatLocation, getNextStatus, ROLE_LABELS, STATUS_LABELS } from "@/features/dashboard/utils";
import { StatusBadge } from "./status-badge";

interface JobDetailPanelProps {
    job: JobRecord | null;
    payment: JobPayment | null;
    reporterCandidates: UserRecord[];
    editorCandidates: UserRecord[];
    isLoadingDetails: boolean;
    isSubmitting: boolean;
    onAssignUser: (roleType: "REPORTER" | "EDITOR", userId: string) => Promise<boolean>;
    onAdvanceStatus: () => Promise<boolean>;
}

export const JobDetailPanel = ({
    job,
    payment,
    reporterCandidates,
    editorCandidates,
    isLoadingDetails,
    isSubmitting,
    onAssignUser,
    onAdvanceStatus,
}: JobDetailPanelProps) => {
    const [reporterDraft, setReporterDraft] = useState("");
    const [editorDraft, setEditorDraft] = useState("");

    const reporterOptions = useMemo(
        () => [
            { label: "Select reporter", value: "" },
            ...reporterCandidates.map((candidate) => ({
                label: `${candidate.name}${candidate.city ? ` - ${candidate.city}` : ""}`,
                value: candidate.id,
            })),
        ],
        [reporterCandidates],
    );

    const editorOptions = useMemo(
        () => [
            { label: "Select editor", value: "" },
            ...editorCandidates.map((candidate) => ({
                label: `${candidate.name}${candidate.city ? ` - ${candidate.city}` : ""}`,
                value: candidate.id,
            })),
        ],
        [editorCandidates],
    );

    const nextStatus = job ? getNextStatus(job.status) : null;

    if (!job) {
        return (
            <aside className="rounded-[12px] border border-[#c3c6d7] bg-white p-6 shadow-[0_4px_14px_rgba(15,23,42,0.06)]">
                <h3 className="text-lg font-semibold text-[#191b23]">Job Details</h3>
                <p className="mt-2 text-sm text-[#434655]">Pilih salah satu job untuk melihat assignment, payment, dan aksi lanjutan.</p>
            </aside>
        );
    }

    return (
        <aside className="sticky top-6 rounded-[12px] border border-[#c3c6d7] bg-white shadow-[0_4px_14px_rgba(15,23,42,0.06)]">
            <div className="border-b border-[#e1e2ed] px-6 py-5">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <div className="text-sm font-medium text-[#737686]">{formatJobCode(job.id)}</div>
                        <h3 className="mt-1 text-2xl font-bold text-[#191b23]">{job.caseName}</h3>
                        <p className="mt-2 text-sm text-[#434655]">
                            {formatDuration(job.durationMinutes)} · {formatLocation(job)}
                        </p>
                    </div>
                    <StatusBadge status={job.status} />
                </div>
            </div>

            <div className="space-y-6 px-6 py-5">
                <section>
                    <div className="flex items-center gap-2">
                        <LayersTwo01 className="size-4 text-[#004ac6]" />
                        <h4 className="text-sm font-semibold tracking-[0.05em] text-[#737686] uppercase">Current Assignments</h4>
                    </div>
                    <div className="mt-3 grid gap-3">
                        <div className="rounded-xl bg-[#f8faff] p-4">
                            <div className="text-xs font-semibold tracking-[0.05em] text-[#737686] uppercase">Reporter</div>
                            <div className="mt-2 text-sm font-semibold text-[#191b23]">{job.reporter?.name ?? "Pending assignment"}</div>
                            <div className="text-sm text-[#434655]">{job.reporter?.city ?? "No city configured"}</div>
                        </div>
                        <div className="rounded-xl bg-[#fffaf5] p-4">
                            <div className="text-xs font-semibold tracking-[0.05em] text-[#737686] uppercase">Editor</div>
                            <div className="mt-2 text-sm font-semibold text-[#191b23]">{job.editor?.name ?? "Pending assignment"}</div>
                            <div className="text-sm text-[#434655]">{job.editor?.city ?? "No city configured"}</div>
                        </div>
                    </div>
                </section>

                <section>
                    <div className="flex items-center gap-2">
                        <User01 className="size-4 text-[#004ac6]" />
                        <h4 className="text-sm font-semibold tracking-[0.05em] text-[#737686] uppercase">Assign Personnel</h4>
                    </div>
                    <div className="mt-3 space-y-3">
                        <NativeSelect size="md" value={reporterDraft} onChange={(event) => setReporterDraft(event.target.value)} options={reporterOptions} />
                        <Button
                            color="secondary"
                            size="md"
                            isDisabled={!reporterDraft || isSubmitting}
                            onClick={async () => {
                                const success = await onAssignUser("REPORTER", reporterDraft);
                                if (success) {
                                    setReporterDraft("");
                                }
                            }}
                            className="w-full justify-center"
                        >
                            Assign Reporter
                        </Button>
                        <NativeSelect size="md" value={editorDraft} onChange={(event) => setEditorDraft(event.target.value)} options={editorOptions} />
                        <Button
                            color="secondary"
                            size="md"
                            isDisabled={!editorDraft || isSubmitting}
                            onClick={async () => {
                                const success = await onAssignUser("EDITOR", editorDraft);
                                if (success) {
                                    setEditorDraft("");
                                }
                            }}
                            className="w-full justify-center"
                        >
                            Assign Editor
                        </Button>
                    </div>
                </section>

                <section>
                    <div className="flex items-center gap-2">
                        <CheckCircle className="size-4 text-[#004ac6]" />
                        <h4 className="text-sm font-semibold tracking-[0.05em] text-[#737686] uppercase">Workflow Action</h4>
                    </div>
                    <div className="mt-3 rounded-xl border border-[#dbe1ff] bg-[#f8faff] p-4">
                        <p className="text-sm text-[#434655]">
                            Current status: <span className="font-semibold text-[#191b23]">{STATUS_LABELS[job.status]}</span>
                        </p>
                        {nextStatus ? (
                            <>
                                <p className="mt-2 text-sm text-[#434655]">
                                    Next valid transition: <span className="font-semibold text-[#191b23]">{STATUS_LABELS[nextStatus]}</span>
                                </p>
                                <Button size="md" className="mt-4 w-full justify-center bg-[#004ac6] hover:bg-[#2563eb]" isDisabled={isSubmitting} onClick={onAdvanceStatus}>
                                    Move to {STATUS_LABELS[nextStatus]}
                                </Button>
                            </>
                        ) : (
                            <Badge color="success" size="md" type="color" className="mt-4">
                                Workflow Complete
                            </Badge>
                        )}
                    </div>
                </section>

                <section>
                    <div className="flex items-center gap-2">
                        <AlertCircle className="size-4 text-[#004ac6]" />
                        <h4 className="text-sm font-semibold tracking-[0.05em] text-[#737686] uppercase">Payout Summary</h4>
                    </div>
                    <div className="mt-3 rounded-xl border border-[#e1e2ed] bg-[#faf8ff] p-4">
                        {isLoadingDetails ? (
                            <p className="text-sm text-[#434655]">Loading payment and availability data...</p>
                        ) : payment ? (
                            <div className="space-y-4 text-sm">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <div className="font-medium text-[#434655]">{ROLE_LABELS.REPORTER}</div>
                                        <div className="text-xs text-[#737686]">
                                            {job.reporter?.name ?? "Pending"} · {formatDuration(job.durationMinutes)} @ IDR 2,000/min
                                        </div>
                                    </div>
                                    <div className="font-semibold text-[#191b23]">{formatCurrency(payment.reporterPayout)}</div>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <div className="font-medium text-[#434655]">{ROLE_LABELS.EDITOR}</div>
                                        <div className="text-xs text-[#737686]">{job.editor?.name ?? "Pending"} · Flat fee</div>
                                    </div>
                                    <div className="font-semibold text-[#191b23]">{formatCurrency(payment.editorPayout)}</div>
                                </div>
                                <div className="border-t border-dashed border-[#c3c6d7] pt-4">
                                    <div className="flex items-center justify-between rounded-lg bg-white px-4 py-3">
                                        <span className="text-sm font-semibold text-[#191b23]">Total Cost</span>
                                        <span className="text-xl font-bold text-[#004ac6]">{formatCurrency(payment.totalCost)}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-[#434655]">Payment summary belum tersedia.</p>
                        )}
                    </div>
                </section>
            </div>
        </aside>
    );
};
