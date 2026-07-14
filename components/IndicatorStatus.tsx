"use client";

import type { IndicatorInputs } from "@/lib/types";

interface Props {
  inputs: IndicatorInputs;
}

export default function IndicatorStatus({ inputs }: Props) {
  const rows = [
    {
      timeframe: "15m",
      supertrend: inputs.tf15m_supertrend,
      emaAbove: inputs.tf15m_ema200_price_above,
      adx: inputs.tf15m_adx,
      volume: inputs.tf15m_volume_above_avg,
    },
    {
      timeframe: "1h",
      supertrend: inputs.tf1h_supertrend,
      emaAbove: inputs.tf1h_ema200_price_above,
      adx: inputs.tf1h_adx,
      volume: inputs.tf1h_volume_above_avg,
    },
  ];

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--color-border)] flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)]">
          Indicator Status
        </h3>
        <span className="text-xs font-mono text-[var(--color-foreground)] font-semibold">
          {inputs.symbol}
        </span>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border)]">
            <th className="text-left px-4 py-2 text-xs text-[var(--color-muted-foreground)] font-medium">TF</th>
            <th className="text-left px-4 py-2 text-xs text-[var(--color-muted-foreground)] font-medium">Supertrend</th>
            <th className="text-left px-4 py-2 text-xs text-[var(--color-muted-foreground)] font-medium">EMA 200</th>
            <th className="text-left px-4 py-2 text-xs text-[var(--color-muted-foreground)] font-medium">ADX</th>
            <th className="text-left px-4 py-2 text-xs text-[var(--color-muted-foreground)] font-medium">Volume</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const adxOk = row.adx > 25;
            return (
              <tr key={row.timeframe} className="border-b border-[var(--color-border)] last:border-0">
                <td className="px-4 py-3 font-mono font-semibold text-[var(--color-foreground)]">
                  {row.timeframe}
                </td>
                <td className="px-4 py-3">
                  <StatusPill
                    label={row.supertrend}
                    ok={row.supertrend === "BULLISH" || row.supertrend === "BEARISH"}
                    color={
                      row.supertrend === "BULLISH"
                        ? "buy"
                        : row.supertrend === "BEARISH"
                        ? "sell"
                        : "neutral"
                    }
                  />
                </td>
                <td className="px-4 py-3">
                  <StatusPill
                    label={row.emaAbove ? "Above" : "Below"}
                    ok={true}
                    color={row.emaAbove ? "buy" : "sell"}
                  />
                </td>
                <td className="px-4 py-3">
                  <StatusPill
                    label={row.adx.toFixed(1)}
                    ok={adxOk}
                    color={adxOk ? "buy" : "sell"}
                  />
                </td>
                <td className="px-4 py-3">
                  <StatusPill
                    label={row.volume ? "High" : "Low"}
                    ok={true}
                    color={row.volume ? "buy" : "sell"}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function StatusPill({
  label,
  color,
}: {
  label: string;
  ok: boolean;
  color: "buy" | "sell" | "neutral";
}) {
  const styles = {
    buy: "bg-[var(--color-buy)]/15 text-[var(--color-buy)] border-[var(--color-buy)]/30",
    sell: "bg-[var(--color-sell)]/15 text-[var(--color-sell)] border-[var(--color-sell)]/30",
    neutral:
      "bg-[var(--color-muted)] text-[var(--color-muted-foreground)] border-[var(--color-border)]",
  };
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded text-xs font-mono font-semibold border ${styles[color]}`}
    >
      {label}
    </span>
  );
}
