import { useMemo, useState } from "react";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { Button } from "@/components/base/buttons/button";
import { CloseButton } from "@/components/base/buttons/close-button";
import { Input } from "@/components/base/input/input";
import { NativeSelect } from "@/components/base/select/select-native";
import type { CreateUserPayload, UserRole } from "@/features/dashboard/types";

interface CreateUserModalProps {
    isOpen: boolean;
    isSubmitting: boolean;
    onClose: () => void;
    onSubmit: (payload: CreateUserPayload) => Promise<boolean>;
}

export default function CreateUserModal({ isOpen, isSubmitting, onClose, onSubmit }: CreateUserModalProps) {
    const [name, setName] = useState("");
    const [role, setRole] = useState<UserRole>("REPORTER");
    const [city, setCity] = useState("");

    const roleOptions = useMemo(
        () => [
            { label: "Reporter", value: "REPORTER" },
            { label: "Editor", value: "EDITOR" },
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
                                <p className="text-sm font-semibold tracking-[0.05em] text-[#004ac6] uppercase">Create User</p>
                                <h2 className="mt-1 text-2xl font-bold text-[#191b23]">Tambah reporter atau editor</h2>
                                <p className="mt-2 text-sm text-[#434655]">Personel baru akan dikirim ke endpoint POST /api/users dengan status tersedia.</p>
                            </div>
                            <CloseButton onClick={onClose} />
                        </div>

                        <form
                            className="mt-6 space-y-4"
                            onSubmit={async (event) => {
                                event.preventDefault();

                                const success = await onSubmit({
                                    name: name.trim(),
                                    role,
                                    city: city.trim() ? city.trim() : null,
                                    isAvailable: true,
                                });

                                if (success) {
                                    setName("");
                                    setRole("REPORTER");
                                    setCity("");
                                    onClose();
                                }
                            }}
                        >
                            <Input label="Full name" value={name} onChange={setName} placeholder="Ayu Prasetyo" isRequired />
                            <NativeSelect label="Role" value={role} onChange={(event) => setRole(event.target.value as UserRole)} options={roleOptions} />
                            <Input
                                label="City"
                                value={city}
                                onChange={setCity}
                                placeholder={role === "REPORTER" ? "Bandung" : "Optional"}
                                hint={role === "REPORTER" ? "Kota membantu proses matching untuk job physical." : "Kosongkan jika editor tidak terikat kota."}
                            />

                            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                                <Button color="secondary" size="lg" onClick={onClose}>
                                    Cancel
                                </Button>
                                <Button size="lg" type="submit" isDisabled={isSubmitting || !name.trim()}>
                                    {isSubmitting ? "Submitting..." : "Create User"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </Dialog>
            </Modal>
        </ModalOverlay>
    );
}
