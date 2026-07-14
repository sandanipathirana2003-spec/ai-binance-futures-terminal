"use client";

import type { TradeSignal } from "@/lib/types";

interface Props {
  signal: TradeSignal;
  locked: boolean;
  onLock: () => void;
  onUnlock: () => void;
  symbol: string;
}

export default function SignalCard({ signal, locked, onLock, onUnlock, symbol }: Props) {
  const isBuy = signal.direction === "BUY";
  const isSell = signal.direction === "SELL";
  const isNoTrade = signal.direction === "NO TRADE";
  const isActionable = isBuy || isSell;

  const directionColor = isBuy
    ? "text-[var(--color-buy)]"
    : isSell
    ? "text-[var(--color-sell)]"
    : "text-[var(--color-neutral)]";

  const borderColor = isBuy
    ? "border-[var(--color-buy)]/30"
    : isSell
    ? "border-[var(--color-sell)]/30"
    : "border-[var(--color-border)]";

  const bgColor = isBuy
    ? "bg-[var(--color-buy)]/5"
    : isSell
    ? "bg-[var(--color-sell)]/5"
    : "bg-[var(--color-surface)]";

  const confidenceColor =
    signal.confidence >= 80
      ? "text-[var(--color-buy)]"
      : signal.confidence >= 60
      ? "text-yellow-400"
      : "text-[var(--color-sell)]";

  return (
    <div className={`rounded-lg border p-5 ${bgColor} ${borderColor}`}>
      {/* Header row */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex flex-col gap-1.5">
          {/* Direction */}
          <div className="flex items-center gap-2.5">
            <span className={`text-2xl font-black tracking-tight font-mono ${directionColor}`}>
              {signal.direction}
            </span>
            {isActionable && (
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded border ${
                  isBuy
                    ? "border-[var(--color-buy)]/50 text-[var(--color-buy)] bg-[var(--color-buy)]/10"
                    : "border-[var(--color-sell)]/50 text-[var(--color-sell)] bg-[var(--color-sell)]/10"
                }`}
              >
                {isBuy ? "LONG" : "SHORT"}
              </span>
            )}
            {/* Symbol chip */}
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-[var(--color-muted)] text-[var(--color-muted-foreground)] border border-[var(--color-border)]">
              {symbol}
            </span>
          </div>

          {/* Lock status */}
          {isActionable && (
            <div className="flex items-center gap-2">
              {locked ? (
                <>
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-buy)]">
                    <span className="w-2 h-2 rounded-full bg-[var(--color-buy)] animate-pulse inline-block" />
                    LIVE &amp; LOCKED
                  </span>
                  <button
                    onClick={onUnlock}
                    className="text-xs px-2 py-0.5 rounded border border-[var(--color-border)] text-[var(--color-muted-foreground)] hover:border-[var(--color-sell)] hover:text-[var(--color-sell)] transition-colors"
                  >
                    Unlock (SL hit / trade closed)
                  </button>
                </>
              ) : (
                <>
                  <span className="text-xs text-[var(--color-muted-foreground)]">Not locked yet</span>
                  <button
                    onClick={onLock}
                    className="text-xs px-2 py-0.5 rounded border border-[var(--color-buy)]/50 text-[var(--color-buy)] hover:bg-[var(--color-buy)]/10 transition-colors"
                  >
                    Lock Signal (entering trade)
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Confidence */}
        <div className="text-right">
          <div className="text-xs text-[var(--color-muted-foreground)] mb-0.5">Confidence</div>
          <div className={`text-2xl font-black font-mono ${confidenceColor}`}>
            {signal.confidence}%
          </div>
        </div>
      </div>

      {/* Trade levels */}
      {isActionable && signal.entry !== null && (
        <div className="grid grid-cols-2 gap-2 mb-4">
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

      {/* Analysis */}
      <div className="border-t border-[var(--color-border)] pt-3">
        <p className="text-xs text-[var(--color-muted-foreground)] uppercase tracking-widest mb-1.5">
          Analysis
        </p>
        <p className="text-sm text-[var(--color-foreground)] leading-relaxed">
          {signal.reason}
        </p>
      </div>

      {/* Active trade advice */}
      {signal.active_trade_advice && (
        <div className="mt-3 rounded border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5 p-3">
          <p className="text-xs text-[var(--color-primary)] uppercase tracking-widest mb-1.5 font-semibold">
            Trade Management Advice
          </p>
          <p className="text-sm text-[var(--color-foreground)] leading-relaxed">
            {signal.active_trade_advice}
          </p>
        </div>
      )}

      {/* Locked warning */}
      {locked && (
        <div className="mt-3 rounded border border-[var(--color-buy)]/20 bg-[var(--color-buy)]/5 px-3 py-2">
          <p className="text-xs text-[var(--color-buy)]/80 leading-relaxed">
            Signal is locked. The AI will not change this recommendation until you unlock it.
            Unlock only when your SL is hit or you have manually closed the trade.
          </p>
        </div>
      )}

      {/* Timestamp */}
      <p className="text-xs text-[var(--color-muted-foreground)] mt-3 font-mono">
        Generated: {new Date(signal.timestamp).toLocaleTimeString()} —{" "}
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
    <div className="flex flex-col gap-0.5 bg-[var(--color-background)]/60 rounded p-2.5 border border-[var(--color-border)]/50">
      <span className="text-xs text-[var(--color-muted-foreground)]">{label}</span>
      <span className={`text-sm font-semibold font-mono ${color ?? "text-[var(--color-foreground)]"}`}>
        {isText ? value : Number(value).toLocaleString(undefined, { maximumFractionDigits: 6 })}
      </span>
    </div>
  );
}
