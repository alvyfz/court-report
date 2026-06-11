import type { JobStatus } from "@/features/dashboard/types";
import { STATUS_LABELS, STATUS_STYLES } from "@/features/dashboard/utils";

interface StatusBadgeProps {
    status: JobStatus;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
    return <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${STATUS_STYLES[status]}`}>{STATUS_LABELS[status]}</span>;
};
