"use client";

import React, { useEffect, useState } from "react";
import { fetchHealth, getBackendBaseUrl } from "@/lib/api";
import { HealthResponse } from "@/types";

type StatusState = "checking" | "connected" | "error";

export function HealthCheck() {
  const [status, setStatus] = useState<StatusState>("checking");
  const [data, setData] = useState<HealthResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const backendUrl = getBackendBaseUrl();

  const handleManualCheck = async () => {
    setStatus("checking");
    setErrorMessage(null);
    const start = performance.now();

    try {
      const response = await fetchHealth();
      const elapsed = Math.round(performance.now() - start);
      setData(response);
      setLatencyMs(elapsed);
      setStatus("connected");
    } catch (err) {
      setStatus("error");
      setData(null);
      setLatencyMs(null);
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to establish connection to backend"
      );
    }
  };

  useEffect(() => {
    let ignore = false;
    const start = performance.now();

    fetchHealth()
      .then((response) => {
        if (!ignore) {
          setData(response);
          setLatencyMs(Math.round(performance.now() - start));
          setStatus("connected");
        }
      })
      .catch((err) => {
        if (!ignore) {
          setData(null);
          setLatencyMs(null);
          setStatus("error");
          setErrorMessage(
            err instanceof Error ? err.message : "Failed to establish connection to backend"
          );
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
        <div>
          <h2 className="text-base font-semibold text-[#172033] flex items-center gap-2">
            Backend Connectivity Status
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Target Endpoint:{" "}
            <code className="text-[#4F6BED] bg-[#EEF4FF] px-1.5 py-0.5 rounded font-mono text-[11px]">
              {backendUrl}/api/health
            </code>
          </p>
        </div>

        <div>
          {status === "checking" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              Pinging...
            </span>
          )}
          {status === "connected" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#ECFDF5] text-[#16845B] border border-[#A7F3D0]">
              <span className="w-2 h-2 rounded-full bg-[#16845B]" />
              Operational
            </span>
          )}
          {status === "error" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA]">
              <span className="w-2 h-2 rounded-full bg-[#C24141]" />
              Unreachable
            </span>
          )}
        </div>
      </div>

      <div className="mt-4">
        {status === "checking" && (
          <div className="py-6 text-center text-[#64748B] text-sm animate-pulse">
            Connecting to FastAPI backend at {backendUrl}...
          </div>
        )}

        {status === "connected" && data && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
                <span className="block text-[11px] text-[#64748B] uppercase tracking-wider font-semibold">
                  Service
                </span>
                <span className="block text-sm font-medium text-[#172033] truncate mt-1">
                  {data.app_name}
                </span>
              </div>
              <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
                <span className="block text-[11px] text-[#64748B] uppercase tracking-wider font-semibold">
                  Version
                </span>
                <span className="block text-sm font-medium text-[#172033] mt-1">
                  v{data.version}
                </span>
              </div>
              <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
                <span className="block text-[11px] text-[#64748B] uppercase tracking-wider font-semibold">
                  Environment
                </span>
                <span className="block text-sm font-medium text-[#16845B] capitalize mt-1">
                  {data.environment}
                </span>
              </div>
              <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
                <span className="block text-[11px] text-[#64748B] uppercase tracking-wider font-semibold">
                  Latency
                </span>
                <span className="block text-sm font-medium text-[#4F6BED] mt-1">
                  {latencyMs !== null ? `${latencyMs}ms` : "-"}
                </span>
              </div>
            </div>

            <p className="text-xs text-[#64748B] text-center pt-2">
              FastAPI backend is actively communicating with Next.js frontend via CORS.
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <div className="p-3.5 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-[#991B1B] text-sm">
              <p className="font-semibold text-[#991B1B]">Connection Failed:</p>
              <p className="font-mono text-xs mt-1 text-[#7F1D1D] break-words">
                {errorMessage}
              </p>
            </div>
            <div className="text-xs text-[#64748B] space-y-1">
              <p>
                Make sure the FastAPI backend is running on{" "}
                <code className="text-[#172033] bg-[#F1F5F9] px-1 py-0.5 rounded font-mono">{backendUrl}</code>:
              </p>
              <pre className="bg-[#F8FAFC] p-2.5 rounded-lg border border-[#E2E8F0] text-[#1E293B] font-mono text-[11px] overflow-x-auto">
                cd backend &amp;&amp; .venv/bin/uvicorn app.main:app --reload --port 8000
              </pre>
            </div>
          </div>
        )}
      </div>

      <div className="mt-5 pt-4 border-t border-[#E2E8F0] flex items-center justify-between">
        <span className="text-xs text-[#64748B] font-sans">
          Live Backend Diagnostics &amp; Health
        </span>
        <button
          onClick={handleManualCheck}
          disabled={status === "checking"}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-[#F8FAFC] text-[#172033] border border-[#CBD5E1] shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus-visible:ring-2 focus-visible:ring-[#4F6BED] focus-visible:outline-none"
        >
          {status === "checking" ? "Checking..." : "Recheck Status"}
        </button>
      </div>
    </div>
  );
}
