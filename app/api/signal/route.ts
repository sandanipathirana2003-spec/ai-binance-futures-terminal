import { generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";
import type { IndicatorInputs, TradeSignal } from "@/lib/types";

const SYSTEM_PROMPT = `You are a professional crypto futures trading signal engine for Binance Futures.
You analyze technical indicators and generate signals following these STRICT rules:

RULES:
1. Only give BUY or SELL if the trend is ALIGNED on BOTH the 15m AND 1h timeframes.
2. Confirm with ALL of: Supertrend direction, Price vs EMA200, ADX > 25, and Volume above average.
3. If the setup is weak, ADX <= 25, volume is low, or timeframes conflict → output direction: "NO TRADE".
4. If confidence is below 80% → output direction: "NO TRADE".
5. If an active_trade is provided, DO NOT reverse the position. Instead advise: Hold / Move SL to Break Even / Take Partial Profit / Close. Only suggest a new setup AFTER the current trade is closed.
6. Give Entry, Stop Loss, Take Profit 1, Take Profit 2, Risk:Reward ratio, and reason for every real signal.

ALIGNMENT LOGIC:
- BUY: Both timeframes must show BULLISH Supertrend + price above EMA200 + ADX > 25 + volume above average.
- SELL: Both timeframes must show BEARISH Supertrend + price below EMA200 + ADX > 25 + volume above average.
- If any condition fails → NO TRADE.

OUTPUT FORMAT (strict JSON, no extra text):
{
  "direction": "BUY" | "SELL" | "NO TRADE",
  "confidence": 0-100,
  "entry": number | null,
  "stop_loss": number | null,
  "take_profit_1": number | null,
  "take_profit_2": number | null,
  "risk_reward": "1:2.5" | null,
  "reason": "concise 2-3 sentence explanation",
  "active_trade_advice": "Hold / Move SL to BE / Take Partial / Close — with reason" | null
}`;

export async function POST(req: NextRequest) {
  try {
    const body: IndicatorInputs = await req.json();

    const userPrompt = `
Analyze the following indicator data and generate a trading signal.

Symbol: ${body.symbol}
Current Price: ${body.current_price}

--- 15-MINUTE TIMEFRAME ---
Supertrend: ${body.tf15m_supertrend}
Price Above EMA200: ${body.tf15m_ema200_price_above}
ADX: ${body.tf15m_adx}
Volume Above Average: ${body.tf15m_volume_above_avg}

--- 1-HOUR TIMEFRAME ---
Supertrend: ${body.tf1h_supertrend}
Price Above EMA200: ${body.tf1h_ema200_price_above}
ADX: ${body.tf1h_adx}
Volume Above Average: ${body.tf1h_volume_above_avg}

${body.support_level ? `Support Level: ${body.support_level}` : ""}
${body.resistance_level ? `Resistance Level: ${body.resistance_level}` : ""}

${
  body.active_trade
    ? `
--- ACTIVE TRADE ---
Direction: ${body.active_trade.direction}
Entry: ${body.active_trade.entry_price}
Stop Loss: ${body.active_trade.stop_loss}
TP1: ${body.active_trade.take_profit_1}
TP2: ${body.active_trade.take_profit_2}
Current PnL: ${body.active_trade.current_pnl_percent}%
`
    : "No active trade."
}

Apply all rules strictly. Return ONLY valid JSON matching the specified format.`;

    const { text } = await generateText({
      model: "openai/gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.1,
    });

    // Strip markdown code fences if model wraps in them
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed: Omit<TradeSignal, "timestamp"> = JSON.parse(cleaned);

    const signal: TradeSignal = {
      ...parsed,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(signal);
  } catch (err) {
    console.error("[signal/route] Error:", err);
    return NextResponse.json(
      {
        direction: "NO TRADE",
        confidence: 0,
        entry: null,
        stop_loss: null,
        take_profit_1: null,
        take_profit_2: null,
        risk_reward: null,
        reason: "Analysis failed. Please check your inputs and try again.",
        active_trade_advice: null,
        timestamp: new Date().toISOString(),
      } satisfies TradeSignal,
      { status: 500 }
    );
  }
}
