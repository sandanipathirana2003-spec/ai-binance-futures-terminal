"use client";

import { useState } from "react";
import type { IndicatorInputs, SupertrendDirection } from "@/lib/types";

interface Props {
  onAnalyze: (inputs: IndicatorInputs) => void;
  isLoading: boolean;
  isLocked: boolean;
  defaultSymbol?: string;
}

const ST_OPTIONS: SupertrendDirection[] = ["BULLISH", "BEARISH", "NEUTRAL"];

const POPULAR_COINS = [
  "BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT",
  "XRPUSDT", "DOGEUSDT", "ADAUSDT", "AVAXUSDT",
  "LINKUSDT", "DOTUSDT", "MATICUSDT", "LTCUSDT",
];

export default function IndicatorForm({ onAnalyze, isLoading, isLocked, defaultSymbol = "BTCUSDT" }: Props) {
  const [symbol, setSymbol] = useState(defaultSymbol);
  const [currentPrice, setCurrentPrice] = useState("");
  const [supportLevel, setSupportLevel] = useState("");
  const [resistanceLevel, setResistanceLevel] = useState("");

  // 15m
  const [tf15m_supertrend, setTf15m_supertrend] = useState<SupertrendDirection>("BULLISH");
  const [tf15m_ema200_above, setTf15m_ema200_above] = useState(true);
  const [tf15m_adx, setTf15m_adx] = useState("28");
  const [tf15m_vol, setTf15m_vol] = useState(true);

  // 1h
  const [tf1h_supertrend, setTf1h_supertrend] = useState<SupertrendDirection>("BULLISH");
  const [tf1h_ema200_above, setTf1h_ema200_above] = useState(true);
  const [tf1h_adx, setTf1h_adx] = useState("30");
  const [tf1h_vol, setTf1h_vol] = useState(true);

  // Active trade toggle
  const [hasActiveTrade, setHasActiveTrade] = useState(false);
  const [tradeDir, setTradeDir] = useState<"LONG" | "SHORT">("LONG");
  const [tradeEntry, setTradeEntry] = useState("");
  const [tradeSL, setTradeSL] = useState("");
  const [tradeTP1, setTradeTP1] = useState("");
  const [tradeTP2, setTradeTP2] = useState("");
  const [tradePnl, setTradePnl] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const inputs: IndicatorInputs = {
      symbol: symbol.toUpperCase().trim(),
      current_price: parseFloat(currentPrice),
      support_level: supportLevel ? parseFloat(supportLevel) : undefined,
      resistance_level: resistanceLevel ? parseFloat(resistanceLevel) : undefined,
      tf15m_supertrend,
      tf15m_ema200_price_above: tf15m_ema200_above,
      tf15m_adx: parseFloat(tf15m_adx),
      tf15m_volume_above_avg: tf15m_vol,
      tf1h_supertrend,
      tf1h_ema200_price_above: tf1h_ema200_above,
      tf1h_adx: parseFloat(tf1h_adx),
      tf1h_volume_above_avg: tf1h_vol,
      active_trade: hasActiveTrade
        ? {
            direction: tradeDir,
            entry_price: parseFloat(tradeEntry),
            stop_loss: parseFloat(tradeSL),
            take_profit_1: parseFloat(tradeTP1),
            take_profit_2: parseFloat(tradeTP2),
            current_pnl_percent: parseFloat(tradePnl),
          }
        : undefined,
    };
    onAnalyze(inputs);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Symbol quick-select */}
      <section>
        <SectionTitle>Select Coin</SectionTitle>
        <div className="flex flex-wrap gap-1.5 mt-2 mb-3">
          {POPULAR_COINS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setSymbol(c)}
              className={`text-xs px-2 py-1 rounded border font-mono transition-colors ${
                symbol === c
                  ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-[var(--color-primary-foreground)]"
                  : "border-[var(--color-border)] text-[var(--color-muted-foreground)] hover:border-[var(--color-muted)] hover:text-[var(--color-foreground)]"
              }`}
            >
              {c.replace("USDT", "")}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Symbol (custom)">
            <input
              className={inputClass}
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="BTCUSDT"
              required
            />
          </Field>
          <Field label="Current Price">
            <input
              className={inputClass}
              type="number"
              step="any"
              value={currentPrice}
              onChange={(e) => setCurrentPrice(e.target.value)}
              placeholder="65000"
              required
            />
          </Field>
          <Field label="Support (optional)">
            <input
              className={inputClass}
              type="number"
              step="any"
              value={supportLevel}
              onChange={(e) => setSupportLevel(e.target.value)}
              placeholder="64200"
            />
          </Field>
          <Field label="Resistance (optional)">
            <input
              className={inputClass}
              type="number"
              step="any"
              value={resistanceLevel}
              onChange={(e) => setResistanceLevel(e.target.value)}
              placeholder="66500"
            />
          </Field>
        </div>
      </section>

      {/* 15m */}
      <section>
        <SectionTitle>15-Minute Timeframe</SectionTitle>
        <div className="grid grid-cols-2 gap-3 mt-2">
          <Field label="Supertrend">
            <select
              className={selectClass}
              value={tf15m_supertrend}
              onChange={(e) => setTf15m_supertrend(e.target.value as SupertrendDirection)}
            >
              {ST_OPTIONS.map((o) => <option key={o}>{o}</option>)}
            </select>
          </Field>
          <Field label="ADX">
            <input
              className={inputClass}
              type="number"
              step="0.1"
              value={tf15m_adx}
              onChange={(e) => setTf15m_adx(e.target.value)}
              placeholder="28"
              required
            />
          </Field>
          <Field label="Price vs EMA 200">
            <ToggleButton
              value={tf15m_ema200_above}
              onChange={setTf15m_ema200_above}
              trueLabel="Above EMA 200"
              falseLabel="Below EMA 200"
            />
          </Field>
          <Field label="Volume">
            <ToggleButton
              value={tf15m_vol}
              onChange={setTf15m_vol}
              trueLabel="Above Avg"
              falseLabel="Below Avg"
            />
          </Field>
        </div>
      </section>

      {/* 1h */}
      <section>
        <SectionTitle>1-Hour Timeframe</SectionTitle>
        <div className="grid grid-cols-2 gap-3 mt-2">
          <Field label="Supertrend">
            <select
              className={selectClass}
              value={tf1h_supertrend}
              onChange={(e) => setTf1h_supertrend(e.target.value as SupertrendDirection)}
            >
              {ST_OPTIONS.map((o) => <option key={o}>{o}</option>)}
            </select>
          </Field>
          <Field label="ADX">
            <input
              className={inputClass}
              type="number"
              step="0.1"
              value={tf1h_adx}
              onChange={(e) => setTf1h_adx(e.target.value)}
              placeholder="30"
              required
            />
          </Field>
          <Field label="Price vs EMA 200">
            <ToggleButton
              value={tf1h_ema200_above}
              onChange={setTf1h_ema200_above}
              trueLabel="Above EMA 200"
              falseLabel="Below EMA 200"
            />
          </Field>
          <Field label="Volume">
            <ToggleButton
              value={tf1h_vol}
              onChange={setTf1h_vol}
              trueLabel="Above Avg"
              falseLabel="Below Avg"
            />
          </Field>
        </div>
      </section>

      {/* Active Trade */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <SectionTitle>Active Trade</SectionTitle>
          <button
            type="button"
            onClick={() => setHasActiveTrade((v) => !v)}
            className={`text-xs px-3 py-1 rounded border transition-colors ${
              hasActiveTrade
                ? "border-[var(--color-primary)] text-[var(--color-primary)] bg-[var(--color-primary)]/10"
                : "border-[var(--color-border)] text-[var(--color-muted-foreground)] hover:border-[var(--color-muted)]"
            }`}
          >
            {hasActiveTrade ? "In a Trade" : "No Active Trade"}
          </button>
        </div>

        {hasActiveTrade && (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Direction">
              <div className="flex gap-2">
                {(["LONG", "SHORT"] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setTradeDir(d)}
                    className={`flex-1 py-2 text-xs font-semibold rounded border transition-colors ${
                      tradeDir === d
                        ? d === "LONG"
                          ? "bg-[var(--color-buy)]/20 border-[var(--color-buy)] text-[var(--color-buy)]"
                          : "bg-[var(--color-sell)]/20 border-[var(--color-sell)] text-[var(--color-sell)]"
                        : "border-[var(--color-border)] text-[var(--color-muted-foreground)]"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Current PnL %">
              <input
                className={inputClass}
                type="number"
                step="0.01"
                value={tradePnl}
                onChange={(e) => setTradePnl(e.target.value)}
                placeholder="2.5"
                required={hasActiveTrade}
              />
            </Field>
            <Field label="Entry Price">
              <input
                className={inputClass}
                type="number"
                step="any"
                value={tradeEntry}
                onChange={(e) => setTradeEntry(e.target.value)}
                required={hasActiveTrade}
              />
            </Field>
            <Field label="Stop Loss">
              <input
                className={inputClass}
                type="number"
                step="any"
                value={tradeSL}
                onChange={(e) => setTradeSL(e.target.value)}
                required={hasActiveTrade}
              />
            </Field>
            <Field label="Take Profit 1">
              <input
                className={inputClass}
                type="number"
                step="any"
                value={tradeTP1}
                onChange={(e) => setTradeTP1(e.target.value)}
                required={hasActiveTrade}
              />
            </Field>
            <Field label="Take Profit 2">
              <input
                className={inputClass}
                type="number"
                step="any"
                value={tradeTP2}
                onChange={(e) => setTradeTP2(e.target.value)}
                required={hasActiveTrade}
              />
            </Field>
          </div>
        )}
      </section>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading || isLocked}
        className="mt-1 w-full py-3 rounded font-semibold text-sm tracking-wide transition-colors bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isLoading ? "Analyzing..." : isLocked ? "Signal Locked — Unlock to Re-analyze" : "Generate Signal"}
      </button>

      {isLocked && (
        <p className="text-xs text-center text-[var(--color-muted-foreground)] -mt-3 leading-relaxed">
          Signal is <span className="text-[var(--color-buy)] font-semibold">LIVE &amp; LOCKED</span>. Close your trade or hit SL, then unlock to get a new signal.
        </p>
      )}
    </form>
  );
}

/* ── Helpers ─────────────────────────────────────────────────── */

const inputClass =
  "w-full bg-[var(--color-muted)] border border-[var(--color-border)] rounded px-3 py-2 text-sm font-mono text-[var(--color-foreground)] placeholder-[var(--color-muted-foreground)] focus:outline-none focus:border-[var(--color-primary)] transition-colors";

const selectClass =
  "w-full bg-[var(--color-muted)] border border-[var(--color-border)] rounded px-3 py-2 text-sm font-mono text-[var(--color-foreground)] focus:outline-none focus:border-[var(--color-primary)] transition-colors";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)]">
      {children}
    </h3>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs text-[var(--color-muted-foreground)]">{label}</label>
      {children}
    </div>
  );
}

function ToggleButton({
  value,
  onChange,
  trueLabel,
  falseLabel,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  trueLabel: string;
  falseLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`w-full py-2 text-xs font-semibold rounded border transition-colors ${
        value
          ? "bg-[var(--color-buy)]/15 border-[var(--color-buy)] text-[var(--color-buy)]"
          : "bg-[var(--color-sell)]/15 border-[var(--color-sell)] text-[var(--color-sell)]"
      }`}
    >
      {value ? trueLabel : falseLabel}
    </button>
  );
}
