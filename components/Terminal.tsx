"use client";

import { useState } from "react";
import IndicatorForm from "./IndicatorForm";
import SignalCard from "./SignalCard";
import IndicatorStatus from "./IndicatorStatus";
import SignalHistory from "./SignalHistory";
import type { IndicatorInputs, TradeSignal } from "@/lib/types";

export default function Terminal() {
  const [latestSignal, setLatestSignal] = useState<TradeSignal | null>(null);
  const [lastInputs, setLastInputs] = useState<IndicatorInputs | null>(null);
  const [history, setHistory] = useState<TradeSignal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze(inputs: IndicatorInputs) {
    setIsLoading(true);
    setError(null);
    setLastInputs(inputs);

    try {
      const res = await fetch("/api/signal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputs),
      });

      const signal: TradeSignal = await res.json();
      setLatestSignal(signal);
      setHistory((prev) => [...prev, signal]);
    } catch (err) {
      setError("Failed to fetch signal. Check your AI Gateway API key.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--color-background)]">
      {/* Top bar */}
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[var(--color-buy)] animate-pulse" />
          <span className="font-mono font-bold text-sm tracking-widest text-[var(--color-foreground)] uppercase">
            AI Futures Terminal
          </span>
          <span className="text-xs text-[var(--color-muted-foreground)] border border-[var(--color-border)] px-2 py-0.5 rounded">
            Binance Futures
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono text-[var(--color-muted-foreground)]">
          <span>Rule Engine v1.0</span>
          <RuleChip label="Supertrend" />
          <RuleChip label="EMA 200" />
          <RuleChip label="ADX &gt;25" />
          <RuleChip label="Volume" />
        </div>
      </header>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-[380px_1fr] gap-6">
        {/* Left — Input */}
        <aside className="flex flex-col gap-4">
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)] mb-4">
              Indicator Inputs
            </h2>
            <IndicatorForm onAnalyze={handleAnalyze} isLoading={isLoading} />
          </div>

          {/* Rule summary */}
          <RulesSummary />
        </aside>

        {/* Right — Output */}
        <section className="flex flex-col gap-4">
          {/* Error */}
          {error && (
            <div className="rounded-lg border border-[var(--color-sell)]/40 bg-[var(--color-sell)]/10 px-4 py-3 text-sm text-[var(--color-sell)]">
              {error}
            </div>
          )}

          {/* Loading skeleton */}
          {isLoading && (
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5 animate-pulse">
              <div className="h-8 w-40 bg-[var(--color-muted)] rounded mb-4" />
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-14 bg-[var(--color-muted)] rounded" />
                ))}
              </div>
              <div className="h-16 bg-[var(--color-muted)] rounded" />
            </div>
          )}

          {/* Signal result */}
          {!isLoading && latestSignal && (
            <div className="flex flex-col gap-1">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)]">
                Latest Signal
              </h2>
              <SignalCard signal={latestSignal} />
            </div>
          )}

          {/* Indicator status table */}
          {lastInputs && !isLoading && (
            <IndicatorStatus inputs={lastInputs} />
          )}

          {/* Empty state */}
          {!isLoading && !latestSignal && (
            <div className="flex-1 flex flex-col items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-12 text-center min-h-[300px]">
              <div className="w-12 h-12 rounded-full border-2 border-dashed border-[var(--color-border)] flex items-center justify-center mb-4">
                <span className="text-[var(--color-muted-foreground)] text-xl">?</span>
              </div>
              <p className="text-sm font-semibold text-[var(--color-foreground)]">
                No signal yet
              </p>
              <p className="text-xs text-[var(--color-muted-foreground)] mt-1 max-w-xs leading-relaxed">
                Fill in the indicator values on the left and click{" "}
                <span className="text-[var(--color-primary)]">Generate Signal</span> to run the
                rule engine.
              </p>
            </div>
          )}

          {/* History */}
          {history.length > 0 && (
            <SignalHistory
              history={history}
              onSelect={(s) => setLatestSignal(s)}
            />
          )}
        </section>
      </div>
    </main>
  );
}

function RuleChip({ label }: { label: string }) {
  return (
    <span className="border border-[var(--color-border)] px-2 py-0.5 rounded text-[var(--color-muted-foreground)]">
      {label}
    </span>
  );
}

function RulesSummary() {
  const rules = [
    "Both 15m + 1h timeframes must align",
    "Supertrend must confirm direction",
    "Price must be on correct side of EMA 200",
    "ADX must be above 25 (trending market)",
    "Volume must be above average",
    "Confidence below 80% = NO TRADE",
    "Weak/ranging market = NO TRADE",
    "Active trade: no reversal until closed",
  ];

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)] mb-3">
        Active Rules
      </h3>
      <ul className="flex flex-col gap-1.5">
        {rules.map((r, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-[var(--color-muted-foreground)]">
            <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] flex-shrink-0" />
            <span>{r}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
