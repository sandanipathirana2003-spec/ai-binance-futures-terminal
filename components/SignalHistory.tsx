"use client";

import type { TradeSignal } from "@/lib/types";

interface Props {
  history: TradeSignal[];
  onSelect: (s: TradeSignal) => void;
}

export default function SignalHistory({ history, onSelect }: Props) {
  if (history.length === 0) {
    return (
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-center">
        <p className="text-xs text-[var(--color-muted-foreground)]">No signal history yet</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--color-border)]">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)]">
          Signal History
        </h3>
      </div>
      <div className="divide-y divide-[var(--color-border)] max-h-64 overflow-y-auto">
        {[...history].reverse().map((s, i) => {
          const isBuy = s.direction === "BUY";
          const isSell = s.direction === "SELL";
          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelect(s)}
              className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-[var(--color-muted)]/40 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-black font-mono w-16 ${
                    isBuy
                      ? "text-[var(--color-buy)]"
                      : isSell
                      ? "text-[var(--color-sell)]"
                      : "text-[var(--color-neutral)]"
                  }`}
                >
                  {s.direction}
                </span>
                <span className="text-xs text-[var(--color-muted-foreground)] font-mono">
                  {new Date(s.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <span
                className={`text-xs font-mono font-semibold ${
                  s.confidence >= 80
                    ? "text-[var(--color-buy)]"
                    : s.confidence >= 60
                    ? "text-[var(--color-primary)]"
                    : "text-[var(--color-neutral)]"
                }`}
              >
                {s.confidence}%
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
