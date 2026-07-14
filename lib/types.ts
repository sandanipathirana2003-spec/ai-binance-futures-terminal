export type SignalDirection = "BUY" | "SELL" | "NO TRADE";
export type SupertrendDirection = "BULLISH" | "BEARISH" | "NEUTRAL";

export interface IndicatorInputs {
  symbol: string;

  // 15m timeframe
  tf15m_supertrend: SupertrendDirection;
  tf15m_ema200_price_above: boolean;
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

  // Active trade (optional)
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
  confidence: number;
  entry: number | null;
  stop_loss: number | null;
  take_profit_1: number | null;
  take_profit_2: number | null;
  risk_reward: string | null;
  reason: string;
  active_trade_advice?: string | null;
  timestamp: string;
}

/**
 * A "coin slot" holds one coin's form state + its locked signal.
 * Once a signal is locked, it CANNOT be overwritten by re-analysis
 * unless the user explicitly unlocks it (trade closed / SL hit).
 */
export interface CoinSlot {
  id: string;            // unique tab id
  symbol: string;
  inputs: IndicatorInputs | null;
  signal: TradeSignal | null;
  /** LOCKED = signal is live, do not change. DRAFT = new analysis ready but not locked. */
  locked: boolean;
  loading: boolean;
  error: string | null;
}
