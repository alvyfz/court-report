import { useMemo, useState } from "react";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { Button } from "@/components/base/buttons/button";
import { CloseButton } from "@/components/base/buttons/close-button";
import { Input } from "@/components/base/input/input";
import { NativeSelect } from "@/components/base/select/select-native";
import type { CreateJobPayload, JobLocationType } from "@/features/dashboard/types";

interface CreateJobModalProps {
    isOpen: boolean;
    isSubmitting: boolean;
    onClose: () => void;
    onSubmit: (payload: CreateJobPayload) => Promise<boolean>;
}

export default function CreateJobModal({ isOpen, isSubmitting, onClose, onSubmit }: CreateJobModalProps) {
    const [caseName, setCaseName] = useState("");
    const [durationMinutes, setDurationMinutes] = useState("90");
    const [locationType, setLocationType] = useState<JobLocationType>("PHYSICAL");
    const [city, setCity] = useState("");

    const locationOptions = useMemo(
        () => [
            { label: "On-site / Physical", value: "PHYSICAL" },
            { label: "Remote", value: "REMOTE" },
        ],
        [],
    );

    if (!isOpen) {
        return null;
    }

    return (
        <ModalOverlay isOpen isDismissable onOpenChange={(open) => !open && onClose()}>
            <Modal className="max-w-xl">
                <Dialog className="items-start">
                    <div className="w-full rounded-[20px] border border-[#c3c6d7] bg-white p-6 shadow-[0_24px_48px_-12px_rgba(15,23,42,0.18)]">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-sm font-semibold tracking-[0.05em] text-[#004ac6] uppercase">Create Job</p>
                                <h2 className="mt-1 text-2xl font-bold text-[#191b23]">Tambah transcription job baru</h2>
                                <p className="mt-2 text-sm text-[#434655]">Payload akan dikirim ke endpoint POST /api/jobs sesuai skema backend.</p>
                            </div>
                            <CloseButton onClick={onClose} />
                        </div>

                        <form
                            className="mt-6 space-y-4"
                            onSubmit={async (event) => {
                                event.preventDefault();

                                const success = await onSubmit({
                                    caseName: caseName.trim(),
                                    durationMinutes: Number(durationMinutes),
                                    locationType,
                                    city: locationType === "PHYSICAL" ? city.trim() : null,
                                    status: "NEW",
                                });

                                if (success) {
                                    setCaseName("");
                                    setDurationMinutes("90");
                                    setLocationType("PHYSICAL");
                                    setCity("");
                                    onClose();
                                }
                            }}
                        >
                            <Input label="Case name" value={caseName} onChange={setCaseName} placeholder="State vs Doe" isRequired />
                            <Input label="Duration (minutes)" type="number" value={durationMinutes} onChange={setDurationMinutes} placeholder="90" isRequired />
                            <NativeSelect
                                label="Location type"
                                value={locationType}
                                onChange={(event) => setLocationType(event.target.value as JobLocationType)}
                                options={locationOptions}
                            />
                            {locationType === "PHYSICAL" ? (
                                <Input label="City" value={city} onChange={setCity} placeholder="Jakarta" isRequired />
                            ) : (
                                <div className="rounded-xl border border-dashed border-[#c3c6d7] bg-[#faf8ff] px-4 py-3 text-sm text-[#434655]">
                                    Remote jobs tidak mengirim field city ke backend.
                                </div>
                            )}

                            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                                <Button color="secondary" size="lg" onClick={onClose}>
                                    Cancel
                                </Button>
                                <Button
                                    size="lg"
                                    type="submit"
                                    isDisabled={isSubmitting || !caseName.trim() || !durationMinutes || (locationType === "PHYSICAL" && !city.trim())}
                                >
                                    {isSubmitting ? "Submitting..." : "Create Job"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </Dialog>
            </Modal>
        </ModalOverlay>
    );
}
