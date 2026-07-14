export type Timeframe = "1m" | "3m" | "5m" | "15m" | "1h" | "4h" | "1d";
export type SignalDirection = "BUY" | "SELL" | "NO TRADE";
export type SupertrendDirection = "BULLISH" | "BEARISH" | "NEUTRAL";

export interface IndicatorInputs {
  symbol: string;

  // 15m timeframe
  tf15m_supertrend: SupertrendDirection;
  tf15m_ema200_price_above: boolean; // price above EMA200?
  tf15m_adx: number;
  tf15m_volume_above_avg: boolean;

  // 1h timeframe
  tf1h_supertrend: SupertrendDirection;
  tf1h_ema200_price_above: boolean;
  tf1h_adx: number;
  tf1h_volume_above_avg: boolean;

  // Price context
  current_price: number;
  support_level?: number;
  resistance_level?: number;

  // Active trade (optional — if user is already in a trade)
  active_trade?: {
    direction: "LONG" | "SHORT";
    entry_price: number;
    stop_loss: number;
    take_profit_1: number;
    take_profit_2: number;
    current_pnl_percent: number;
  };
}

export interface TradeSignal {
  direction: SignalDirection;
  confidence: number; // 0–100
  entry: number | null;
  stop_loss: number | null;
  take_profit_1: number | null;
  take_profit_2: number | null;
  risk_reward: string | null;
  reason: string;
  active_trade_advice?: string | null;
  timestamp: string;
}
