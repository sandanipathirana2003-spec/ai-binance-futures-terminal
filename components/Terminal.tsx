"use client";

import { useState } from "react";
import IndicatorForm from "./IndicatorForm";
import SignalCard from "./SignalCard";
import IndicatorStatus from "./IndicatorStatus";
import type { IndicatorInputs, TradeSignal, CoinSlot } from "@/lib/types";

let _nextId = 1;
function makeId() { return String(_nextId++); }

function makeSlot(symbol: string): CoinSlot {
  return {
    id: makeId(),
    symbol,
    inputs: null,
    signal: null,
    locked: false,
    loading: false,
    error: null,
  };
}

const DEFAULT_COINS = ["BTCUSDT", "ETHUSDT", "SOLUSDT"];

export default function Terminal() {
  const [slots, setSlots] = useState<CoinSlot[]>(() =>
    DEFAULT_COINS.map((s) => makeSlot(s))
  );
  const [_activeId, _setActiveId] = useState<string>(() => slots[0].id);
  const activeTab = slots.find((s) => s.id === _activeId) ?? slots[0];

  function addCoin() {
    const slot = makeSlot("BTCUSDT");
    setSlots((prev) => [...prev, slot]);
    _setActiveId(slot.id);
  }

  function removeCoin(id: string) {
    setSlots((prev) => {
      const next = prev.filter((s) => s.id !== id);
      if (_activeId === id && next.length > 0) {
        _setActiveId(next[next.length - 1].id);
      }
      return next;
    });
  }

  function updateSlot(id: string, patch: Partial<CoinSlot>) {
    setSlots((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  async function handleAnalyze(slotId: string, inputs: IndicatorInputs) {
    // If signal is locked, do not re-analyze
    const slot = slots.find((s) => s.id === slotId);
    if (!slot || slot.locked) return;

    updateSlot(slotId, { loading: true, error: null, inputs });

    try {
      const res = await fetch("/api/signal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputs),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const signal: TradeSignal = await res.json();

      updateSlot(slotId, {
        signal,
        inputs,
        loading: false,
        symbol: inputs.symbol,
        // DO NOT auto-lock — user must click "Lock Signal" to commit
        locked: false,
      });
    } catch (err) {
      updateSlot(slotId, {
        loading: false,
        error: "Failed to fetch signal. Check your AI Gateway API key.",
      });
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
        <div className="hidden md:flex items-center gap-3 text-xs font-mono text-[var(--color-muted-foreground)]">
          <RuleChip label="Supertrend" />
          <RuleChip label="EMA 200" />
          <RuleChip label="ADX &gt;25" />
          <RuleChip label="Volume" />
          <RuleChip label="15m+1h Align" />
          <RuleChip label="80% Confidence" />
        </div>
      </header>

      {/* Coin tabs */}
      <div className="border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 flex items-center gap-0 overflow-x-auto">
        {slots.map((slot) => (
          <CoinTab
            key={slot.id}
            slot={slot}
            isActive={slot.id === _activeId}
            onSelect={() => _setActiveId(slot.id)}
            onRemove={slots.length > 1 ? () => removeCoin(slot.id) : undefined}
          />
        ))}
        <button
          onClick={addCoin}
          className="ml-2 flex-shrink-0 text-xs px-3 py-2 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors border-l border-[var(--color-border)]"
          title="Add coin"
        >
          + Add Coin
        </button>
      </div>

      {/* Body */}
      {activeTab && (
        <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-[380px_1fr] gap-6">
          {/* Left — Input */}
          <aside className="flex flex-col gap-4">
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)]">
                  Indicator Inputs — {activeTab.symbol}
                </h2>
                {activeTab.locked && (
                  <span className="text-xs font-semibold text-[var(--color-buy)] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-buy)] animate-pulse inline-block" />
                    LOCKED
                  </span>
                )}
              </div>
              <IndicatorForm
                key={activeTab.id}
                onAnalyze={(inputs) => handleAnalyze(activeTab.id, inputs)}
                isLoading={activeTab.loading}
                isLocked={activeTab.locked}
                defaultSymbol={activeTab.symbol}
              />
            </div>

            {/* Rules */}
            <RulesSummary />
          </aside>

          {/* Right — Output */}
          <section className="flex flex-col gap-4">
            {/* Error */}
            {activeTab.error && (
              <div className="rounded-lg border border-[var(--color-sell)]/40 bg-[var(--color-sell)]/10 px-4 py-3 text-sm text-[var(--color-sell)]">
                {activeTab.error}
              </div>
            )}

            {/* Loading skeleton */}
            {activeTab.loading && (
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
            {!activeTab.loading && activeTab.signal && (
              <div className="flex flex-col gap-1">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)]">
                  Signal — {activeTab.symbol}
                </h2>
                <SignalCard
                  signal={activeTab.signal}
                  locked={activeTab.locked}
                  symbol={activeTab.symbol}
                  onLock={() => updateSlot(activeTab.id, { locked: true })}
                  onUnlock={() => updateSlot(activeTab.id, { locked: false, signal: null })}
                />
              </div>
            )}

            {/* Indicator status */}
            {activeTab.inputs && !activeTab.loading && (
              <IndicatorStatus inputs={activeTab.inputs} />
            )}

            {/* Empty state */}
            {!activeTab.loading && !activeTab.signal && (
              <div className="flex-1 flex flex-col items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-12 text-center min-h-[300px]">
                <div className="w-12 h-12 rounded-full border-2 border-dashed border-[var(--color-border)] flex items-center justify-center mb-4">
                  <span className="text-[var(--color-muted-foreground)] text-xl font-mono">?</span>
                </div>
                <p className="text-sm font-semibold text-[var(--color-foreground)]">
                  No signal for {activeTab.symbol}
                </p>
                <p className="text-xs text-[var(--color-muted-foreground)] mt-1 max-w-xs leading-relaxed">
                  Enter indicator values and click{" "}
                  <span className="text-[var(--color-primary)]">Generate Signal</span>.
                  The signal will be locked the moment you click{" "}
                  <span className="text-[var(--color-buy)]">Lock Signal</span>.
                </p>
              </div>
            )}

            {/* All coins summary strip */}
            {slots.filter((s) => s.signal && s.id !== activeTab.id).length > 0 && (
              <OtherCoinsSummary
                slots={slots.filter((s) => s.signal && s.id !== activeTab.id)}
                onSelect={_setActiveId}
              />
            )}
          </section>
        </div>
      )}
    </main>
  );
}

/* ── CoinTab ─────────────────────────────────────────────────── */

function CoinTab({
  slot,
  isActive,
  onSelect,
  onRemove,
}: {
  slot: CoinSlot;
  isActive: boolean;
  onSelect: () => void;
  onRemove?: () => void;
}) {
  const dir = slot.signal?.direction;
  const dotColor =
    dir === "BUY"
      ? "bg-[var(--color-buy)]"
      : dir === "SELL"
      ? "bg-[var(--color-sell)]"
      : slot.signal
      ? "bg-[var(--color-neutral)]"
      : "bg-[var(--color-border)]";

  return (
    <button
      onClick={onSelect}
      className={`group flex items-center gap-2 px-4 py-2.5 text-xs font-mono border-b-2 transition-colors flex-shrink-0 ${
        isActive
          ? "border-[var(--color-primary)] text-[var(--color-foreground)] bg-[var(--color-background)]"
          : "border-transparent text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:border-[var(--color-border)]"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColor} ${slot.locked ? "animate-pulse" : ""}`} />
      <span>{slot.symbol.replace("USDT", "")}</span>
      {slot.locked && (
        <span className="text-[0.6rem] text-[var(--color-buy)] font-bold">LIVE</span>
      )}
      {slot.signal && !slot.locked && (
        <span
          className={`text-[0.6rem] font-bold ${
            dir === "BUY"
              ? "text-[var(--color-buy)]"
              : dir === "SELL"
              ? "text-[var(--color-sell)]"
              : "text-[var(--color-neutral)]"
          }`}
        >
          {dir}
        </span>
      )}
      {onRemove && (
        <span
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="ml-1 opacity-0 group-hover:opacity-100 text-[var(--color-muted-foreground)] hover:text-[var(--color-sell)] transition-all"
        >
          ×
        </span>
      )}
    </button>
  );
}

/* ── Other coins summary strip ───────────────────────────────── */

function OtherCoinsSummary({
  slots,
  onSelect,
}: {
  slots: CoinSlot[];
  onSelect: (id: string) => void;
}) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)] mb-3">
        Other Coin Signals
      </h3>
      <div className="flex flex-wrap gap-2">
        {slots.map((slot) => {
          const dir = slot.signal!.direction;
          const isBuy = dir === "BUY";
          const isSell = dir === "SELL";
          return (
            <button
              key={slot.id}
              onClick={() => onSelect(slot.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded border text-xs font-mono transition-colors hover:opacity-80 ${
                isBuy
                  ? "border-[var(--color-buy)]/40 bg-[var(--color-buy)]/10 text-[var(--color-buy)]"
                  : isSell
                  ? "border-[var(--color-sell)]/40 bg-[var(--color-sell)]/10 text-[var(--color-sell)]"
                  : "border-[var(--color-border)] bg-[var(--color-muted)] text-[var(--color-muted-foreground)]"
              }`}
            >
              <span className="font-bold">{slot.symbol.replace("USDT", "")}</span>
              <span>{dir}</span>
              <span className="text-[0.65rem] opacity-70">{slot.signal!.confidence}%</span>
              {slot.locked && <span className="text-[0.6rem] font-bold">LIVE</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Reusable chips ──────────────────────────────────────────── */

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
    "Price must be correct side of EMA 200",
    "ADX above 25 on both timeframes",
    "Volume above average (both TFs)",
    "Confidence below 80% = NO TRADE",
    "Ranging / weak market = NO TRADE",
    "In a trade: no reversal until closed",
    "Signal is LOCKED when you enter trade",
    "Unlock only on SL hit or trade close",
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
