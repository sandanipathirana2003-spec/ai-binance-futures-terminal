import { generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";
import type { IndicatorInputs, TradeSignal } from "@/lib/types";

const SYSTEM_PROMPT = `You are a professional Binance Futures trading signal engine.
Your signals are FINAL. Once issued, they are locked. You do NOT flip or update recommendations because the market ticks.

HARD RULES — violating any = "NO TRADE":
1. Both 15m AND 1h timeframes must fully align (Supertrend + EMA200 side + ADX + Volume).
2. ADX must be above 25 on BOTH timeframes. Below 25 = ranging = NO TRADE.
3. Volume must be above average on BOTH timeframes. Low volume = NO TRADE.
4. If any indicator contradicts → NO TRADE.
5. Confidence below 80% → NO TRADE. Be conservative.
6. If an active_trade is provided:
   - DO NOT tell the user to reverse or close and re-enter immediately.
   - ONLY advise: "Hold" | "Move SL to Break Even" | "Take Partial Profit at TP1" | "Close Trade".
   - A reverse signal can only be suggested AFTER the current trade is fully closed and a NEW confirmed setup forms.
   - Never change the direction of advice just because price moved slightly.

SIGNAL ALIGNMENT:
- BUY signal: Both timeframes = BULLISH Supertrend + price ABOVE EMA200 + ADX > 25 + volume above average.
- SELL signal: Both timeframes = BEARISH Supertrend + price BELOW EMA200 + ADX > 25 + volume below average is NOT required for sells but volume must not be extremely low.
- NEUTRAL Supertrend on either timeframe → NO TRADE.
- Conflicting timeframes (e.g., 15m BUY but 1h SELL) → NO TRADE.

ENTRY / SL / TP CALCULATION:
- For BUY: Entry near current price or last support, SL just below key support, TP1 = 1:1.5 RR, TP2 = 1:2.5+ RR.
- For SELL: Entry near current price or last resistance, SL just above key resistance, TP1 = 1:1.5 RR, TP2 = 1:2.5+ RR.
- Always give exact price numbers, not percentages.

OUTPUT — strict JSON only, no markdown, no extra text:
{
  "direction": "BUY" | "SELL" | "NO TRADE",
  "confidence": <integer 0-100>,
  "entry": <number | null>,
  "stop_loss": <number | null>,
  "take_profit_1": <number | null>,
  "take_profit_2": <number | null>,
  "risk_reward": "<string like 1:2.4>" | null,
  "reason": "<2-3 sentence explanation of why this signal was issued or why NO TRADE>",
  "active_trade_advice": "<Hold/Move SL to BE/Take Partial/Close — with one sentence reason>" | null
}`;

export async function POST(req: NextRequest) {
  try {
    const body: IndicatorInputs = await req.json();

    const userPrompt = `
Analyze these indicators and issue a signal. Apply ALL rules strictly.

SYMBOL: ${body.symbol}
CURRENT PRICE: ${body.current_price}
${body.support_level ? `SUPPORT: ${body.support_level}` : ""}
${body.resistance_level ? `RESISTANCE: ${body.resistance_level}` : ""}

=== 15-MINUTE TIMEFRAME ===
Supertrend:          ${body.tf15m_supertrend}
Price vs EMA 200:    ${body.tf15m_ema200_price_above ? "ABOVE EMA 200" : "BELOW EMA 200"}
ADX:                 ${body.tf15m_adx}
Volume:              ${body.tf15m_volume_above_avg ? "ABOVE AVERAGE" : "BELOW AVERAGE"}

=== 1-HOUR TIMEFRAME ===
Supertrend:          ${body.tf1h_supertrend}
Price vs EMA 200:    ${body.tf1h_ema200_price_above ? "ABOVE EMA 200" : "BELOW EMA 200"}
ADX:                 ${body.tf1h_adx}
Volume:              ${body.tf1h_volume_above_avg ? "ABOVE AVERAGE" : "BELOW AVERAGE"}

${
  body.active_trade
    ? `=== ACTIVE TRADE (DO NOT REVERSE) ===
Direction:   ${body.active_trade.direction}
Entry Price: ${body.active_trade.entry_price}
Stop Loss:   ${body.active_trade.stop_loss}
TP1:         ${body.active_trade.take_profit_1}
TP2:         ${body.active_trade.take_profit_2}
Current PnL: ${body.active_trade.current_pnl_percent}%

The user is IN this trade. Advise them on trade management only. Do NOT suggest reversing.`
    : "No active trade."
}

Return ONLY the JSON object. No explanation outside the JSON.`;

    const { text } = await generateText({
      model: "openai/gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.05, // Very low temperature = consistent, non-flip-flopping signals
    });

    const cleaned = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

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
        reason: "Analysis failed. Check your API key and inputs, then try again.",
        active_trade_advice: null,
        timestamp: new Date().toISOString(),
      } satisfies TradeSignal,
      { status: 500 }
    );
  }
}
