import { Suspense, StrictMode, lazy } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import { ToastProvider } from "@/components/application/toast/toast-provider";
import { NotFound } from "@/pages/not-found";
import { RouteProvider } from "@/providers/router-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import "@/styles/globals.css";

const DashboardScreen = lazy(() => import("@/pages/dashboard-screen"));

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <ThemeProvider>
            <ToastProvider>
                <BrowserRouter>
                    <RouteProvider>
                        <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#faf8ff] text-sm text-[#434655]">Loading dashboard...</div>}>
                            <Routes>
                                <Route path="/" element={<DashboardScreen />} />
                                <Route path="*" element={<NotFound />} />
                            </Routes>
                        </Suspense>
                    </RouteProvider>
                </BrowserRouter>
            </ToastProvider>
        </ThemeProvider>
    </StrictMode>,
);
