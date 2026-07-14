"use client";

import type { TradeSignal } from "@/lib/types";

interface Props {
  signal: TradeSignal;
}

export default function SignalCard({ signal }: Props) {
  const isBuy = signal.direction === "BUY";
  const isSell = signal.direction === "SELL";
  const isNoTrade = signal.direction === "NO TRADE";

  const directionColor = isBuy
    ? "text-[var(--color-buy)]"
    : isSell
    ? "text-[var(--color-sell)]"
    : "text-[var(--color-neutral)]";

  const directionBg = isBuy
    ? "bg-[var(--color-buy)]/10 border-[var(--color-buy)]/30"
    : isSell
    ? "bg-[var(--color-sell)]/10 border-[var(--color-sell)]/30"
    : "bg-[var(--color-muted)] border-[var(--color-border)]";

  const confidenceColor =
    signal.confidence >= 80
      ? "text-[var(--color-buy)]"
      : signal.confidence >= 60
      ? "text-[var(--color-primary)]"
      : "text-[var(--color-sell)]";

  return (
    <div className={`rounded-lg border p-5 ${directionBg}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span
            className={`text-2xl font-black tracking-tight font-mono ${directionColor}`}
          >
            {signal.direction}
          </span>
          {!isNoTrade && (
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                isBuy
                  ? "border-[var(--color-buy)]/40 text-[var(--color-buy)]"
                  : "border-[var(--color-sell)]/40 text-[var(--color-sell)]"
              }`}
            >
              {isBuy ? "LONG" : "SHORT"}
            </span>
          )}
        </div>
        <div className="text-right">
          <div className="text-xs text-[var(--color-muted-foreground)] mb-0.5">Confidence</div>
          <div className={`text-xl font-black font-mono ${confidenceColor}`}>
            {signal.confidence}%
          </div>
        </div>
      </div>

      {/* Levels */}
      {!isNoTrade && signal.entry !== null && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <LevelRow label="Entry" value={signal.entry} />
          <LevelRow label="Stop Loss" value={signal.stop_loss} color="text-[var(--color-sell)]" />
          <LevelRow label="Take Profit 1" value={signal.take_profit_1} color="text-[var(--color-buy)]" />
          <LevelRow label="Take Profit 2" value={signal.take_profit_2} color="text-[var(--color-buy)]" />
          {signal.risk_reward && (
            <div className="col-span-2">
              <LevelRow label="Risk : Reward" value={signal.risk_reward} isText />
            </div>
          )}
        </div>
      )}

      {/* Reason */}
      <div className="border-t border-[var(--color-border)] pt-3 mt-1">
        <p className="text-xs text-[var(--color-muted-foreground)] uppercase tracking-widest mb-1.5">
          Analysis
        </p>
        <p className="text-sm text-[var(--color-foreground)] leading-relaxed">
          {signal.reason}
        </p>
      </div>

      {/* Active trade advice */}
      {signal.active_trade_advice && (
        <div className="mt-3 border-t border-[var(--color-primary)]/20 pt-3">
          <p className="text-xs text-[var(--color-primary)] uppercase tracking-widest mb-1.5">
            Active Trade Advice
          </p>
          <p className="text-sm text-[var(--color-foreground)] leading-relaxed">
            {signal.active_trade_advice}
          </p>
        </div>
      )}

      {/* Timestamp */}
      <p className="text-xs text-[var(--color-muted-foreground)] mt-3 font-mono">
        {new Date(signal.timestamp).toLocaleTimeString()} —{" "}
        {new Date(signal.timestamp).toLocaleDateString()}
      </p>
    </div>
  );
}

function LevelRow({
  label,
  value,
  color,
  isText,
}: {
  label: string;
  value: number | string | null;
  color?: string;
  isText?: boolean;
}) {
  if (value === null || value === undefined) return null;
  return (
    <div className="flex flex-col gap-0.5 bg-[var(--color-background)]/50 rounded p-2.5">
      <span className="text-xs text-[var(--color-muted-foreground)]">{label}</span>
      <span
        className={`text-sm font-semibold font-mono ${
          color ?? "text-[var(--color-foreground)]"
        }`}
      >
        {isText ? value : Number(value).toLocaleString()}
      </span>
    </div>
  );
}
