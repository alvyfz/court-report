import type { PropsWithChildren, ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { AlertCircle, CheckCircle, InfoCircle, XClose } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { cx } from "@/utils/cx";

type ToastTone = "success" | "error" | "info";

interface ToastItem {
    id: string;
    title: string;
    description?: string;
    tone: ToastTone;
}

interface ToastOptions {
    title: string;
    description?: string;
    tone?: ToastTone;
}

interface ToastContextValue {
    showToast: (options: ToastOptions) => void;
    success: (title: string, description?: string) => void;
    error: (title: string, description?: string) => void;
    info: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const TOAST_DURATION_MS = 5000;

const toneStyles: Record<ToastTone, { container: string; icon: ReactNode }> = {
    success: {
        container: "border-emerald-200 bg-emerald-50 text-emerald-900",
        icon: <CheckCircle className="size-5 text-emerald-600" />,
    },
    error: {
        container: "border-red-200 bg-red-50 text-red-900",
        icon: <AlertCircle className="size-5 text-red-600" />,
    },
    info: {
        container: "border-blue-200 bg-blue-50 text-blue-900",
        icon: <InfoCircle className="size-5 text-blue-600" />,
    },
};

export const ToastProvider = ({ children }: PropsWithChildren) => {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const dismissToast = useCallback((id: string) => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
    }, []);

    const showToast = useCallback(
        ({ title, description, tone = "info" }: ToastOptions) => {
            const id = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
            setToasts((current) => [...current, { id, title, description, tone }]);

            window.setTimeout(() => {
                dismissToast(id);
            }, TOAST_DURATION_MS);
        },
        [dismissToast],
    );

    const value = useMemo<ToastContextValue>(
        () => ({
            showToast,
            success: (title, description) => showToast({ title, description, tone: "success" }),
            error: (title, description) => showToast({ title, description, tone: "error" }),
            info: (title, description) => showToast({ title, description, tone: "info" }),
        }),
        [showToast],
    );

    return (
        <ToastContext.Provider value={value}>
            {children}
            <ToastViewport toasts={toasts} onDismiss={dismissToast} />
        </ToastContext.Provider>
    );
};

const ToastViewport = ({ toasts, onDismiss }: { toasts: ToastItem[]; onDismiss: (id: string) => void }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return createPortal(
        <div className="pointer-events-none fixed top-4 right-4 z-[100] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3 sm:w-full">
            {toasts.map((toast) => {
                const style = toneStyles[toast.tone];

                return (
                    <div key={toast.id} className={cx("pointer-events-auto rounded-2xl border p-4 shadow-lg backdrop-blur-sm", style.container)}>
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 shrink-0">{style.icon}</div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold">{toast.title}</p>
                                {toast.description ? <p className="mt-1 text-sm opacity-90">{toast.description}</p> : null}
                            </div>
                            <Button color="tertiary" size="sm" className="size-8 justify-center p-0" onClick={() => onDismiss(toast.id)}>
                                <XClose className="size-4" />
                            </Button>
                        </div>
                    </div>
                );
            })}
        </div>,
        document.body,
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);

    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }

    return context;
};
